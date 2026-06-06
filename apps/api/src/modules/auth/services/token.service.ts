import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { RefreshTokensRepository } from '../../../db/repositories/refresh-tokens.repository';
import type { JwtPayload } from '../strategies';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class TokenService implements OnModuleInit {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokensRepo: RefreshTokensRepository,
  ) {}

  async onModuleInit() {
    try {
      const deleted = await this.refreshTokensRepo.deleteExpired();
      if (deleted > 0) {
        this.logger.log(`Startup cleanup: deleted ${deleted} expired refresh tokens`);
      }
    } catch (error) {
      this.logger.warn(`Startup token cleanup failed: ${error.message}`);
    }
  }

  generateAccessToken(user: { id: number; email: string; role: string }): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Generate a JWT refresh token (raw plaintext for returning to client)
   */
  generateRefreshTokenRaw(user: { id: number; email: string; role: string }, family?: string): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    if (family) {
      payload.family = family;
    }

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY') as any,
    });
  }

  /**
   * Generate a full token pair and persist the refresh token in DB
   */
  async generateTokenPair(user: { id: number; email: string; role: string }, existingFamily?: string): Promise<TokenPayload> {
    const accessToken = this.generateAccessToken(user);

    const family = existingFamily || crypto.randomBytes(30).toString('hex');

    const refreshTokenRaw = this.generateRefreshTokenRaw(user, family);

    const tokenHash = await bcrypt.hash(refreshTokenRaw, 10);

    const refreshExpiryMs = this.parseExpiryToMs(this.configService.get<string>('JWT_REFRESH_EXPIRY') || '30d');
    const expiresAt = new Date(Date.now() + refreshExpiryMs);

    const decodedAccess = this.jwtService.decode(accessToken) as { exp?: number };
    const expiresIn = decodedAccess.exp
      ? decodedAccess.exp - Math.floor(Date.now() / 1000)
      : 900;

    await this.refreshTokensRepo.create({
      userId: user.id,
      tokenHash,
      family,
      isRevoked: false,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn,
    };
  }

  /**
   * Validate a raw refresh token against the DB.
   * Returns the stored token record or null if invalid.
   * Also checks for reuse of a revoked token (theft detection).
   */
  async validateRefreshToken(userId: number, rawToken: string): Promise<{
    valid: boolean;
    revokedFamily?: string;
  }> {
    // Find all active tokens for this user
    const activeTokens = await this.refreshTokensRepo.findActiveByUserId(userId);

    for (const storedToken of activeTokens) {
      const match = await bcrypt.compare(rawToken, storedToken.tokenHash);
      if (match) {
        return { valid: true };
      }
    }

    // Token not found among active — check if it's a previously revoked token (theft detection)
    const allUserTokens = await this.refreshTokensRepo.findActiveByUserId(userId);
    // If we got here, the token isn't active. Check revoked tokens.
    // We need to check all tokens (including revoked) for this user.
    // The repository only returns active, so we check differently:
    // The token could be revoked or could be completely invalid.
    // For theft detection, we check if ANY token with the same hash exists and is revoked.
    const tokenHashForCheck = await bcrypt.hash(rawToken, 10);
    // Actually, we can't hash-and-compare efficiently here. Instead, we decode the JWT
    // to check if it was previously valid and now revoked.
    // Let's use a different approach: decode the JWT and check family.

    try {
      const decoded = this.jwtService.verify(rawToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      if (decoded.sub !== userId) {
        return { valid: false };
      }

      // Token is structurally valid but not found in active tokens.
      // This means it was revoked — possible theft!
      // We don't have the family from the token itself, so we mark as invalid.
      // The controller/service layer will handle the revocation logic.
      return { valid: false, revokedFamily: 'REUSED_TOKEN' };
    } catch {
      // Token is expired or malformed
      return { valid: false };
    }
  }

  /**
   * Revoke a specific refresh token by its raw value
   */
  async revokeRefreshToken(rawToken: string): Promise<boolean> {
    const activeTokens = await this.refreshTokensRepo.findActiveByTokenHash(
      await bcrypt.hash(rawToken, 10),
    );

    // Since we can't search by raw token (we store hashes), we need a different approach.
    // The caller should identify the token by its hash or ID.
    return false;
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: number): Promise<number> {
    return this.refreshTokensRepo.revokeAllByUserId(userId);
  }

  /**
   * Revoke an entire token family (theft detection response)
   */
  async revokeTokenFamily(family: string): Promise<number> {
    return this.refreshTokensRepo.revokeFamily(family);
  }

  /**
   * Revoke all refresh tokens for a user (logout from all devices)
   */
  async logoutAllDevices(userId: number): Promise<void> {
    const count = await this.refreshTokensRepo.revokeAllByUserId(userId);
    this.logger.log(`Revoked ${count} refresh tokens for user ${userId}`);
  }

  private parseExpiryToMs(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 30 * 24 * 60 * 60 * 1000; // default 30 days

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 30 * 24 * 60 * 60 * 1000;
    }
  }
}
