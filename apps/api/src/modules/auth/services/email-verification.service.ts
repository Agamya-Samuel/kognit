import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { EmailVerificationsRepository } from '../../../db/repositories/email-verifications.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';

const VERIFICATION_CODE_TTL_SECONDS = 10 * 60; // 10 minutes
const RESEND_COOLDOWN_SECONDS = 60; // 1 minute cooldown between resends
const CODE_HASH_ROUNDS = 10;

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly emailVerificationsRepo: EmailVerificationsRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  /**
   * Generate a 6-digit verification code, hash it, and store in DB.
   * Returns the plaintext code (to be sent via email).
   */
  async generateCode(userId: number): Promise<string> {
    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, CODE_HASH_ROUNDS);

    // Invalidate any previous active codes for this user
    const existing = await this.emailVerificationsRepo.findActiveByUserId(userId);
    if (existing) {
      // Mark previous as verified (effectively invalidating it)
      await this.emailVerificationsRepo.markAsVerified(existing.id);
    }

    // Create new verification record
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_TTL_SECONDS * 1000);
    await this.emailVerificationsRepo.create({
      userId,
      tokenHash: codeHash,
      expiresAt,
      verified: false,
      purpose: 'email_verify',
    });

    this.logger.log(`Verification code generated for user ${userId}`);
    return code;
  }

  /**
   * Verify a 6-digit code for a user.
   * Returns true if valid and not expired.
   */
  async verifyCode(userId: number, code: string): Promise<boolean> {
    const verification = await this.emailVerificationsRepo.findActiveByUserId(userId);
    if (!verification) {
      throw new BadRequestException('No active verification code found. Please request a new one.');
    }

    // Check expiration
    if (new Date() > verification.expiresAt) {
      throw new BadRequestException('Verification code has expired. Please request a new one.');
    }

    // Compare code against hash
    const isValid = await bcrypt.compare(code, verification.tokenHash);
    if (!isValid) {
      throw new BadRequestException('Invalid verification code.');
    }

    // Mark as verified
    await this.emailVerificationsRepo.markAsVerified(verification.id);

    // Mark user email as verified
    await this.usersRepo.update(userId, { isVerified: true });

    this.logger.log(`Email verified for user ${userId}`);
    return true;
  }

  /**
   * Verify a code by email (used during registration before user exists).
   * This looks up by scanning verification records.
   */
  async verifyCodeByEmail(email: string, code: string): Promise<number> {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new BadRequestException('No account found with this email.');
    }

    await this.verifyCode(user.id, code);
    return user.id;
  }
}
