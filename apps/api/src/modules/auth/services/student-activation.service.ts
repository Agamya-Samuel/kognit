import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { EmailVerificationsRepository } from '../../../db/repositories/email-verifications.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { StudentProfilesRepository } from '../../../db/repositories/student-profiles.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

const ACTIVATION_TOKEN_EXPIRY_DAYS = 1200; // ~3.3 years
const TOKEN_HASH_ROUNDS = 10;

@Injectable()
export class StudentActivationService {
  constructor(
    private readonly emailVerificationsRepo: EmailVerificationsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly studentProfilesRepo: StudentProfilesRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Generate an activation token for a newly created student user.
   * Stores the hashed token in email_verifications with purpose='student_activation'.
   */
  async generateActivationToken(userId: number): Promise<string> {
    // Generate a secure random token (64 bytes, hex encoded = 128 chars)
    const token = crypto.randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(token, TOKEN_HASH_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ACTIVATION_TOKEN_EXPIRY_DAYS);

    await this.emailVerificationsRepo.create({
      userId,
      tokenHash,
      purpose: 'student_activation',
      expiresAt,
      verified: false,
    });

    return token;
  }

  /**
   * Validate an activation token.
   * Returns the user info if valid, throws if invalid/expired/used.
   */
  async validateActivationToken(
    token: string,
  ): Promise<{ userId: number; email: string; name: string; institutionName: string | null }> {
    // Find all student_activation records (we need to check each one since we only store the hash)
    const verifications = await this.emailVerificationsRepo.findByPurpose('student_activation');

    let foundVerification: any = null;
    for (const verification of verifications) {
      if (verification.verified) continue; // Already used
      if (new Date() > verification.expiresAt) continue; // Expired
      const isValid = await bcrypt.compare(token, verification.tokenHash);
      if (isValid) {
        foundVerification = verification;
        break;
      }
    }

    if (!foundVerification) {
      throw new BadRequestException('Invalid or expired activation token.');
    }

    const user = await this.usersRepo.findById(foundVerification.userId);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // Get institution name if affiliated
    let institutionName: string | null = null;
    if (user.role === 'student') {
      const profile = await this.studentProfilesRepo.findByUserId(user.id);
      if (profile?.affiliatedInstituteId) {
        // We could look up the institution name here if needed
        institutionName = `Institution #${profile.affiliatedInstituteId}`;
      }
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      institutionName,
    };
  }

  /**
   * Complete the student activation.
   * Sets password, marks token as used, updates user status, and returns tokens.
   */
  async completeActivation(
    token: string,
    password: string,
    name: string,
    mobile: string,
    address: string,
    city: string,
    state: string,
    pinCode: string,
    country: string,
  ): Promise<{ user: any; tokens: any }> {
    // Find and validate the token
    const verifications = await this.emailVerificationsRepo.findByPurpose('student_activation');

    let foundVerification: any = null;
    for (const verification of verifications) {
      if (verification.verified) continue;
      if (new Date() > verification.expiresAt) continue;
      const isValid = await bcrypt.compare(token, verification.tokenHash);
      if (isValid) {
        foundVerification = verification;
        break;
      }
    }

    if (!foundVerification) {
      throw new BadRequestException('Invalid or expired activation token.');
    }

    const user = await this.usersRepo.findById(foundVerification.userId);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // Update user
    await this.usersRepo.update(user.id, {
      passwordHash,
      name, // Allow name edit during activation
      isVerified: true,
      onboardingCompleted: true,
    });

    // Mark token as used
    await this.emailVerificationsRepo.markAsVerified(foundVerification.id);

    // Create or update student profile
    const existingProfile = await this.studentProfilesRepo.findByUserId(user.id);
    if (existingProfile) {
      await this.studentProfilesRepo.update(existingProfile.id, {
        mobile,
        address,
        city,
        state,
        pinCode,
        country,
      });
    } else {
      await this.studentProfilesRepo.create({
        userId: user.id,
        mobile,
        address,
        city,
        state,
        pinCode,
        country,
      });
    }

    // Generate tokens for auto-login
    const updatedUser = await this.usersRepo.findById(user.id);
    const tokens = await this.tokenService.generateTokenPair(updatedUser!);

    return {
      user: updatedUser,
      tokens,
    };
  }
}
