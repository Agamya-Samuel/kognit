import {
  Injectable,
  Logger,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../../db/repositories/users.repository';
import { EmailVerificationsRepository } from '../../db/repositories/email-verifications.repository';
import { RefreshTokensRepository } from '../../db/repositories/refresh-tokens.repository';
import { PasswordService } from './services/password.service';
import { TokenService, TokenPayload } from './services/token.service';
import { LockoutService } from './services/lockout.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import type { JwtPayload } from './strategies';
import { CacheService } from '../../common/services/cache.service';

// Temp storage for pending registrations (email → verification data)
// In production, this would be stored in Redis with TTL
const VERIFICATION_CODE_TTL_SECONDS = 10 * 60; // 10 minutes
const PENDING_REGISTRATION_NAMESPACE = 'pending_registration';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly emailVerificationsRepo: EmailVerificationsRepository,
    private readonly refreshTokensRepo: RefreshTokensRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly lockoutService: LockoutService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
    private readonly cacheService: CacheService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Email-First Registration Flow ──────────────────────────────────────

  /**
   * Step 1: Request email verification for registration.
   * Stores a 6-digit code in Redis (pending_registration:{email}).
   * Returns the plaintext code (in production, send via email).
   */
  async requestRegistrationVerification(email: string): Promise<{ message: string; code: string }> {
    // Check if email is already registered
    const existingUser = await this.usersRepo.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);

    // Store in Redis with TTL
    await this.cacheService.set(
      PENDING_REGISTRATION_NAMESPACE,
      email,
      { codeHash, createdAt: new Date().toISOString() },
      VERIFICATION_CODE_TTL_SECONDS,
    );

    this.logger.log(`Registration verification code sent for ${email}`);
    return {
      message: 'Verification code sent to your email.',
      code, // In production, this would be sent via email
    };
  }

  /**
   * Step 2: Verify the email code (without creating account yet).
   * Marks the email as verified in Redis.
   */
  async verifyRegistrationCode(email: string, code: string): Promise<{ verified: boolean; email: string }> {
    const pending = await this.cacheService.get<{ codeHash: string; createdAt: string }>(
      PENDING_REGISTRATION_NAMESPACE,
      email,
    );

    if (!pending) {
      throw new BadRequestException('No pending verification found. Please request a new code.');
    }

    // Check expiration
    const createdAt = new Date(pending.createdAt).getTime();
    const elapsed = (Date.now() - createdAt) / 1000;
    if (elapsed > VERIFICATION_CODE_TTL_SECONDS) {
      await this.cacheService.del(PENDING_REGISTRATION_NAMESPACE, email);
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    // Verify code
    const isValid = await this.passwordService.compare(code, pending.codeHash);
    if (!isValid) {
      throw new BadRequestException('Invalid verification code.');
    }

    // Mark as verified in Redis (extend TTL for the completion step)
    await this.cacheService.set(
      PENDING_REGISTRATION_NAMESPACE,
      email,
      { ...pending, emailVerified: true, verifiedAt: new Date().toISOString() },
      VERIFICATION_CODE_TTL_SECONDS,
    );

    return { verified: true, email };
  }

  /**
   * Step 3: Complete registration with name and password.
   * User must have verified their email first.
   */
  async completeRegistration(
    email: string,
    code: string,
    name: string,
    password: string,
  ): Promise<{ user: any; tokens: TokenPayload }> {
    // Re-verify the code (must still be valid and marked as verified)
    const pending = await this.cacheService.get<{
      codeHash: string;
      createdAt: string;
      emailVerified: boolean;
    }>(PENDING_REGISTRATION_NAMESPACE, email);

    if (!pending?.emailVerified) {
      throw new BadRequestException('Email not verified. Please verify your email first.');
    }

    // Verify code again for security
    const isValid = await this.passwordService.compare(code, pending.codeHash);
    if (!isValid) {
      throw new BadRequestException('Invalid verification code.');
    }

    // Check if user was created while pending (race condition)
    const existingUser = await this.usersRepo.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // Create user (already verified via email-first flow)
    const user = await this.usersRepo.create({
      email,
      passwordHash,
      name,
      role: 'student',
      avatarUrl: null,
      isVerified: true,
      isActive: true,
      deletedAt: null,
    });

    // Clean up pending registration
    await this.cacheService.del(PENDING_REGISTRATION_NAMESPACE, email);

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user);

    this.logger.log(`User registered successfully: ${user.id} (${email})`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  // ─── Login ──────────────────────────────────────────────────────────────

  /**
   * Authenticate user with email and password.
   */
  async login(email: string, password: string): Promise<{ user: any; tokens: TokenPayload }> {
    // Check if account is locked
    await this.lockoutService.assertNotLocked(email);

    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      await this.lockoutService.recordFailedAttempt(email);
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ForbiddenException('Account has been deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      const { isLocked } = await this.lockoutService.recordFailedAttempt(email);
      if (isLocked) {
        throw new UnauthorizedException(
          'Account has been locked due to too many failed login attempts. Please try again later.',
        );
      }
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Reset failed attempts on successful login
    await this.lockoutService.resetAttempts(email);

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user);

    this.logger.log(`User logged in: ${user.id} (${email})`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  // ─── Logout ─────────────────────────────────────────────────────────────

  /**
   * Logout user by revoking their refresh token.
   * Also adds user to a deactivated check set if needed.
   */
  async logout(userId: number): Promise<{ message: string }> {
    // Revoke all refresh tokens for this user (logout from all devices)
    const count = await this.tokenService.revokeAllUserTokens(userId);
    this.logger.log(`User logged out: ${userId} (${count} tokens revoked)`);
    return { message: 'Logged out successfully.' };
  }

  // ─── Refresh Token ──────────────────────────────────────────────────────

  /**
   * Refresh access token using refresh token.
   * Implements token rotation and theft detection.
   */
  async refreshTokens(userId: number, rawRefreshToken: string): Promise<TokenPayload> {
    // Verify the refresh token JWT is valid
    let decoded: JwtPayload;
    try {
      decoded = this.jwtService.verify(rawRefreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (decoded.sub !== userId) {
      throw new UnauthorizedException('Token does not belong to this user.');
    }

    // Check if user is still active
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Account has been deactivated.');
    }

    // Check deactivated_users set in Redis
    const isDeactivated = await this.cacheService.get<boolean>('deactivated_users', String(userId));
    if (isDeactivated) {
      throw new ForbiddenException('Account has been deactivated.');
    }

    // Find active tokens and check for the submitted one
    const activeTokens = await this.refreshTokensRepo.findActiveByUserId(userId);
    let matchedToken: any = null;

    for (const token of activeTokens) {
      const match = await this.passwordService.compare(rawRefreshToken, token.tokenHash);
      if (match) {
        matchedToken = token;
        break;
      }
    }

    if (!matchedToken) {
      // Token not found among active tokens — could be:
      // 1. Already revoked (normal rotation) → just reject
      // 2. Token reuse (theft!) → revoke entire family

      // Check if any token with this user exists but is revoked
      // For theft detection, we revoke the entire family
      // We need to find the family of the original token.
      // Since we can't find it directly, we check if ANY token for this user was recently revoked.

      // Simple approach: if the JWT is valid but the token isn't in active tokens,
      // it was likely revoked during rotation. This is reuse → revoke family.
      // However, we don't know the family. Let's check all tokens including revoked.

      // For now, we take a conservative approach:
      // If JWT is valid but token not active, it's reuse. Revoke ALL user tokens.
      await this.tokenService.revokeAllUserTokens(userId);
      this.logger.warn(`Possible token theft detected for user ${userId}. All tokens revoked.`);

      throw new UnauthorizedException(
        'Token reuse detected. All sessions have been terminated for security. Please log in again.',
      );
    }

    // Revoke the old refresh token (rotation)
    await this.refreshTokensRepo.revoke(matchedToken.id);

    // Issue new token pair in the same family
    const newTokens = await this.tokenService.generateTokenPair(user, matchedToken.family);

    this.logger.log(`Tokens refreshed for user ${userId}`);

    return newTokens;
  }

  // ─── Profile ────────────────────────────────────────────────────────────

  /**
   * Get the current user's profile
   */
  async getProfile(userId: number): Promise<any> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return this.sanitizeUser(user);
  }

  // ─── Change Password ────────────────────────────────────────────────────

  /**
   * Change user's password (authenticated)
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isCurrentValid = await this.passwordService.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    const passwordHash = await this.passwordService.hash(newPassword);
    await this.usersRepo.update(userId, { passwordHash });

    // Revoke all refresh tokens (force re-login on all devices)
    await this.tokenService.revokeAllUserTokens(userId);

    this.logger.log(`Password changed for user ${userId}`);
    return { message: 'Password changed successfully. Please log in again on all devices.' };
  }

  // ─── Password Reset (Forgot Password) ───────────────────────────────────

  /**
   * Request password reset (sends email with reset link)
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    await this.passwordResetService.generateResetToken(email);
    // Always return success to prevent email enumeration
    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    throw new BadRequestException('Use resetPasswordWithEmail instead — token alone is insufficient.');
  }

  /**
   * Reset password with token and email
   */
  async resetPasswordWithEmail(email: string, token: string, newPassword: string): Promise<{ message: string }> {
    await this.passwordResetService.resetPasswordWithEmail(email, token, newPassword);
    return { message: 'Password reset successfully. Please log in with your new password.' };
  }

  // ─── Email Verification (for existing users) ────────────────────────────

  /**
   * Request email verification for an existing user
   */
  async requestEmailVerification(userId: number): Promise<{ message: string; code: string }> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.isVerified) {
      return { message: 'Email is already verified.', code: '' };
    }

    const code = await this.emailVerificationService.generateCode(userId);
    return { message: 'Verification code sent to your email.', code };
  }

  /**
   * Verify email for an existing user
   */
  async verifyEmail(userId: number, code: string): Promise<{ verified: boolean }> {
    await this.emailVerificationService.verifyCode(userId, code);
    return { verified: true };
  }

  // ─── Deactivation Check ─────────────────────────────────────────────────

  /**
   * Check if a user is deactivated (called by JWT middleware)
   */
  async isUserDeactivated(userId: number): Promise<boolean> {
    const isDeactivated = await this.cacheService.get<boolean>('deactivated_users', String(userId));
    if (isDeactivated) return true;

    // Also check the DB
    const user = await this.usersRepo.findById(userId);
    return !user?.isActive;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: any): any {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
