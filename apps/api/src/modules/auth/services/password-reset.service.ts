import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { PasswordResetsRepository } from '../../../db/repositories/password-resets.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { PasswordService } from './password.service';

const RESET_TOKEN_TTL_HOURS = 1;
const TOKEN_HASH_ROUNDS = 10;

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly passwordResetsRepo: PasswordResetsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Generate a password reset token, hash it, store in DB.
   * Returns the plaintext token (to be sent via email as a reset link).
   */
  async generateResetToken(email: string): Promise<string> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists — return a fake success for security
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return 'token-not-generated';
    }

    // Invalidate any previous active reset tokens
    const existing = await this.passwordResetsRepo.findActiveByUserId(user.id);
    if (existing) {
      await this.passwordResetsRepo.markAsUsed(existing.id);
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, TOKEN_HASH_ROUNDS);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_HOURS * 60 * 60 * 1000);

    await this.passwordResetsRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      used: false,
    });

    this.logger.log(`Password reset token generated for user ${user.id}`);
    return token;
  }

  /**
   * Reset password using a token.
   * Returns true if successful.
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Hash the token to search in DB
    // We need to find the token by trying all active reset tokens for the user
    // Since we can't search by hash directly, we need a different approach.
    // We'll decode the token to find the user, then iterate through their active tokens.
    // Actually, the token is random bytes, not a JWT, so we can't decode it.
    // We need to find the matching record by checking all unused tokens.

    // Find all active (unused, non-expired) password reset records
    // The repository doesn't have a method for this, so we'll use a different approach:
    // Store the token hash and compare against all active tokens

    // For now, we'll use a brute-force approach (acceptable since password resets are infrequent)
    // In production, we could add a userId field to the reset flow or use a different storage approach

    throw new BadRequestException('Use resetPasswordWithIdentifier instead.');
  }

  /**
   * Reset password using token and email (the email helps identify the user).
   */
  async resetPasswordWithEmail(email: string, token: string, newPassword: string): Promise<boolean> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found with this email.');
    }

    const resetRecord = await this.passwordResetsRepo.findActiveByUserId(user.id);
    if (!resetRecord) {
      throw new BadRequestException('No active password reset request found. Please request a new one.');
    }

    // Check expiration
    if (new Date() > resetRecord.expiresAt) {
      throw new BadRequestException('Password reset link has expired. Please request a new one.');
    }

    // Verify token
    const isValid = await bcrypt.compare(token, resetRecord.tokenHash);
    if (!isValid) {
      throw new BadRequestException('Invalid password reset token.');
    }

    // Hash new password
    const passwordHash = await this.passwordService.hash(newPassword);

    // Update user password
    await this.usersRepo.update(user.id, { passwordHash });

    // Mark reset token as used
    await this.passwordResetsRepo.markAsUsed(resetRecord.id);

    this.logger.log(`Password reset successful for user ${user.id}`);
    return true;
  }
}
