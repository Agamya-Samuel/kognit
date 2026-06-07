import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailVerificationsRepository } from '../../../db/repositories/email-verifications.repository';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { InstructorProfilesRepository } from '../../../db/repositories/instructor-profiles.repository';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

const TOKEN_HASH_ROUNDS = 10;

@Injectable()
export class InstructorActivationService {
  constructor(
    private readonly emailVerificationsRepo: EmailVerificationsRepository,
    private readonly usersRepo: UsersRepository,
    private readonly instructorProfilesRepo: InstructorProfilesRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Validate an instructor activation token.
   * Returns the user info if valid, throws if invalid/expired/used.
   */
  async validateActivationToken(
    token: string,
  ): Promise<{ userId: number; email: string; name: string }> {
    const verifications = await this.emailVerificationsRepo.findByPurpose('instructor_activation');

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

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
  }

  /**
   * Complete the instructor activation.
   * Sets password, profile data, marks token as used, and returns auth tokens.
   */
  async completeActivation(
    token: string,
    password: string,
    name: string,
    bio: string,
    expertise: string[],
    mobile: string,
    linkedinUrl: string,
    websiteUrl: string,
  ): Promise<{ user: any; tokens: any }> {
    // Find and validate the token
    const verifications = await this.emailVerificationsRepo.findByPurpose('instructor_activation');

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

    // Update user record
    await this.usersRepo.update(user.id, {
      passwordHash,
      name, // Allow name edit during activation
      isVerified: true,
      onboardingCompleted: true,
    });

    // Mark token as used
    await this.emailVerificationsRepo.markAsVerified(foundVerification.id);

    // Build social links array from provided URLs
    const socialLinks: string[] = [];
    if (linkedinUrl) socialLinks.push(linkedinUrl);
    if (websiteUrl) socialLinks.push(websiteUrl);

    // Update or create instructor profile
    const existingProfile = await this.instructorProfilesRepo.findByUserId(user.id);
    if (existingProfile) {
      await this.instructorProfilesRepo.update(existingProfile.id, {
        bio: bio || null,
        expertise: expertise.length > 0 ? expertise : [],
        socialLinks,
      });
    } else {
      await this.instructorProfilesRepo.create({
        userId: user.id,
        bio: bio || null,
        expertise: expertise.length > 0 ? expertise : [],
        socialLinks,
        approvalStatus: 'pending',
        razorpaySellerAccountId: null,
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
