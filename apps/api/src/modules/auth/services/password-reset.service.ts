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
