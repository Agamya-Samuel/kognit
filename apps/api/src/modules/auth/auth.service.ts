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
import { UserAuthProvidersRepository } from '../../db/repositories/user-auth-providers.repository';
import { StudentProfilesRepository } from '../../db/repositories/student-profiles.repository';
import { InstructorProfilesRepository } from '../../db/repositories/instructor-profiles.repository';
import { PasswordService } from './services/password.service';
import { TokenService, TokenPayload } from './services/token.service';
import { LockoutService } from './services/lockout.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import type { JwtPayload } from './strategies';
import { CacheService } from '../../common/services/cache.service';
import { NotificationDispatcherService } from '../notifications/services/notification-dispatcher.service';

// Temp storage for pending registrations (email → verification data)
// Stored in Redis with TTL via CacheService
const VERIFICATION_CODE_TTL_SECONDS = 10 * 60; // 10 minutes
const PENDING_REGISTRATION_NAMESPACE = 'pending_registration';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly emailVerificationsRepo: EmailVerificationsRepository,
    private readonly refreshTokensRepo: RefreshTokensRepository,
    private readonly userAuthProvidersRepo: UserAuthProvidersRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly lockoutService: LockoutService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
    private readonly cacheService: CacheService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly studentProfilesRepo: StudentProfilesRepository,
    private readonly instructorProfilesRepo: InstructorProfilesRepository,
    private readonly notificationDispatcher: NotificationDispatcherService,
  ) {}

  // ─── Email-First Registration Flow ──────────────────────────────────────

  /**
   * Step 1: Request email verification for registration.
   * Stores a 6-digit code in Redis (pending_registration:{email}).
   * Sends the code via email through the notification dispatcher.
   */
  async requestRegistrationVerification(email: string, intent?: string): Promise<{ message: string }> {
    // Check if email is already registered
    const existingUser = await this.usersRepo.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    // Validate intent - only allow student or instructor
    const validIntent = intent === 'instructor' ? 'instructor' : 'student';

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();
    const codeHash = await bcrypt.hash(code, 10);

    // Store in Redis with TTL (include intent for later use)
    await this.cacheService.set(
      PENDING_REGISTRATION_NAMESPACE,
      email,
      { codeHash, createdAt: new Date().toISOString(), intent: validIntent },
      VERIFICATION_CODE_TTL_SECONDS,
    );

    // Send verification code via email
    try {
      await this.notificationDispatcher.dispatch({
        userId: 0, // User doesn't exist yet
        type: 'verification',
        title: 'Your EduTech Verification Code',
        body: `Your verification code is: ${code}`,
        deliveredVia: 'email',
        channels: ['email'],
        templateName: 'EmailVerification',
        templateData: {
          code,
          intent: validIntent,
        },
        userEmail: email,
        priority: 1,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
    }

    this.logger.log(`Registration verification code sent for ${email} (intent: ${validIntent})`);
    return {
      message: 'Verification code sent to your email.',
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

    // Mark as verified in Redis (extend TTL for the completion step, preserve intent)
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
    intent?: string,
  ): Promise<{ user: any; tokens: TokenPayload }> {
    // Re-verify the code (must still be valid and marked as verified)
    const pending = await this.cacheService.get<{
      codeHash: string;
      createdAt: string;
      emailVerified: boolean;
      intent?: string;
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

    // Determine role and approvalStatus based on intent (from Redis, not request body)
    const registrationIntent = pending.intent || intent || 'student';
    const role = registrationIntent === 'instructor' ? 'instructor' : 'student';
    const approvalStatus = registrationIntent === 'instructor' ? 'pending' : 'approved';

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // Create user (already verified via email-first flow)
    const user = await this.usersRepo.create({
      email,
      passwordHash,
      name,
      role,
      avatarUrl: null,
      isVerified: true,
      isActive: true,
      approvalStatus,
      onboardingCompleted: false,
      deletedAt: null,
    });

    // Create role-specific profile record
    if (registrationIntent === 'instructor') {
      await this.instructorProfilesRepo.create({
        userId: user.id,
        bio: null,
        expertise: [],
        socialLinks: [],
        approvalStatus: 'pending',
        razorpaySellerAccountId: null,
      });
      this.logger.log(`Instructor profile created for user ${user.id}`);
    }

    // Clean up pending registration
    await this.cacheService.del(PENDING_REGISTRATION_NAMESPACE, email);

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair(user);

    this.logger.log(`User registered successfully: ${user.id} (${email}, role: ${role}, approval: ${approvalStatus})`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  // ─── Login ──────────────────────────────────────────────────────────────

  /**
   * Authenticate user with email and password.
   * Optionally enforce portal-vs-role access control.
   */
  async login(email: string, password: string, portal?: string): Promise<{ user: any; tokens: TokenPayload }> {
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

    // Enforce portal-vs-role access control
    if (portal) {
      this.assertPortalAccess(user, portal);
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

    await this.lockoutService.resetAttempts(email);

    const tokens = await this.tokenService.generateTokenPair(user);

    this.logger.log(`User logged in: ${user.id} (${email})`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Enforce portal-vs-role access control.
   * Throws ForbiddenException if user's role doesn't match the portal they tried to access.
   */
  assertPortalAccess(user: any, portal: string): void {
    switch (portal) {
      case 'student':
        if (user.role !== 'student') {
          throw new ForbiddenException(
            'This account is not a student account. Please use the correct portal for your role.',
          );
        }
        break;
      case 'instructor':
        if (user.role !== 'instructor') {
          throw new ForbiddenException(
            'This account is not an instructor account. Please use the correct portal for your role.',
          );
        }
        // Check if instructor is approved
        if (user.approvalStatus !== 'approved') {
          throw new ForbiddenException(
            'Your instructor account is pending approval. Please wait for an administrator to approve your account.',
          );
        }
        break;
      case 'admin':
        // Only admin role can access admin portal - institution_admin is explicitly excluded
        if (user.role !== 'admin') {
          throw new ForbiddenException(
            'This portal is for platform administrators only. Please contact your organization admin.',
          );
        }
        break;
    }
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
   * Grace period (in seconds) for concurrent refresh token requests.
   * If a revoked token was rotated within this window, subsequent requests
   * with the old token are treated as rotation race conditions, not theft.
   */
  private static readonly REFRESH_RACE_GRACE_SECONDS = 30;

  /**
   * Refresh access token using refresh token.
   * Implements token rotation with family-based theft detection.
   *
   * Handles concurrent refresh gracefully: if multiple tabs/apps send the
   * same (now-revoked) token within a short grace period after rotation,
   * we treat it as a race condition and issue a new pair instead of
   * revoking all sessions (which was causing mass logout on API restart).
   */
  async refreshTokens(userId: number, rawRefreshToken: string): Promise<TokenPayload> {
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

    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Account has been deactivated.');
    }

    const isDeactivated = await this.cacheService.get<boolean>('deactivated_users', String(userId));
    if (isDeactivated) {
      throw new ForbiddenException('Account has been deactivated.');
    }

    let matchedToken: any = null;
    let tokenWasRevoked = false;

    if (decoded.family) {
      const familyTokens = await this.refreshTokensRepo.findByFamily(decoded.family);

      for (const token of familyTokens) {
        const match = await this.passwordService.compare(rawRefreshToken, token.tokenHash);
        if (match) {
          matchedToken = token;
          tokenWasRevoked = token.isRevoked;
          break;
        }
      }

      if (matchedToken && tokenWasRevoked) {
        // Token was found but is revoked. This could be:
        //   (a) Rotation race condition — another tab/app just rotated this token
        //   (b) Genuine token reuse/theft — someone is replaying an old token
        //
        // Distinguish by checking if the family's most recent token was created
        // within the grace period. If yes → race condition. If no → theft.

        const mostRecentToken = familyTokens[familyTokens.length - 1];
        const secondsSinceRotation = (Date.now() - new Date(mostRecentToken.createdAt).getTime()) / 1000;

        if (secondsSinceRotation <= AuthService.REFRESH_RACE_GRACE_SECONDS) {
          // Race condition: another tab just rotated this token.
          // Issue new tokens in the same family instead of nuking everything.
          this.logger.debug(
            `Concurrent refresh detected for user ${userId} (family ${decoded.family.slice(0, 8)}…). ` +
            `Issuing new pair instead of revoking.`,
          );

          // Revoke the current active token in this family (it was issued to the racing request)
          const activeInFamily = familyTokens.find((t) => !t.isRevoked);
          if (activeInFamily) {
            await this.refreshTokensRepo.revoke(activeInFamily.id);
          }

          const newTokens = await this.tokenService.generateTokenPair(user, decoded.family);
          this.logger.log(`Tokens refreshed for user ${userId} (race-condition recovery)`);
          return newTokens;
        }

        // Genuine theft: token was revoked outside the grace period.
        // Revoke only this family (not ALL user tokens) to minimize blast radius.
        const revokedCount = await this.tokenService.revokeTokenFamily(decoded.family);
        this.logger.warn(
          `Token reuse/theft detected for user ${userId}. ` +
          `Family ${decoded.family.slice(0, 8)}… revoked (${revokedCount} tokens).`,
        );
        throw new UnauthorizedException(
          'Token reuse detected. Session has been terminated for security. Please log in again.',
        );
      }
    } else {
      // Legacy path: JWT doesn't contain family (tokens issued before family was embedded)
      const activeTokens = await this.refreshTokensRepo.findActiveByUserId(userId);

      for (const token of activeTokens) {
        const match = await this.passwordService.compare(rawRefreshToken, token.tokenHash);
        if (match) {
          matchedToken = token;
          break;
        }
      }
    }

    if (!matchedToken) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    await this.refreshTokensRepo.revoke(matchedToken.id);

    const family = matchedToken.family || decoded.family;
    const newTokens = await this.tokenService.generateTokenPair(user, family);

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

    const safeUser = this.sanitizeUser(user);

    // If user is a student, also fetch their student profile
    if (user.role === 'student') {
      const studentProfile = await this.studentProfilesRepo.findByUserId(userId);
      return {
        ...safeUser,
        studentProfile: studentProfile || null,
      };
    }

    return safeUser;
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
  async requestEmailVerification(userId: number): Promise<{ message: string }> {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.isVerified) {
      return { message: 'Email is already verified.' };
    }

    const code = await this.emailVerificationService.generateCode(userId);

    // Send verification code via email
    try {
      await this.notificationDispatcher.dispatch({
        userId: user.id,
        type: 'verification',
        title: 'Your EduTech Verification Code',
        body: `Your verification code is: ${code}`,
        deliveredVia: 'email',
        channels: ['email'],
        templateName: 'EmailVerification',
        templateData: { code },
        userEmail: user.email,
        priority: 1,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${user.email}`, error);
    }

    return { message: 'Verification code sent to your email.' };
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

  // ─── OAuth ──────────────────────────────────────────────────────────────────

  /**
   * Handle OAuth login (Google, GitHub, etc.)
   * Links existing account or creates new one
   */
  async handleOAuthLogin(params: {
    provider: string;
    providerId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<{ user: any; tokens: TokenPayload; isNewUser: boolean }> {
    const { provider, providerId, email, name, avatarUrl } = params;

    // Check if this OAuth account is already linked
    const existingProvider = await this.userAuthProvidersRepo.findByProviderAndProviderId(
      provider,
      providerId,
    );

    if (existingProvider) {
      // Account already linked - return existing user
      const user = await this.usersRepo.findById(existingProvider.userId);
      if (!user || !user.isActive) {
        throw new ForbiddenException('Account has been deactivated.');
      }

      const tokens = await this.tokenService.generateTokenPair(user);
      this.logger.log(`OAuth login via ${provider}: ${user.id} (${email})`);
      return { user: this.sanitizeUser(user), tokens, isNewUser: false };
    }

    // Check if an existing user has this email (account linking)
    const existingUser = await this.usersRepo.findByEmail(email);

    if (existingUser) {
      // Link Google account to existing user
      if (!existingUser.isActive) {
        throw new ForbiddenException('Account has been deactivated.');
      }

      await this.userAuthProvidersRepo.create({
        userId: existingUser.id,
        provider,
        providerId,
      });

      const tokens = await this.tokenService.generateTokenPair(existingUser);
      this.logger.log(`OAuth account linked via ${provider}: ${existingUser.id} (${email})`);
      return { user: this.sanitizeUser(existingUser), tokens, isNewUser: false };
    }

    // Create new user with OAuth (role depends on intent, default to student)
    // TODO: Once OAuth strategy passes intent from state parameter, use params.intent
    const intent = (params as any).intent || 'student';
    const role = intent === 'instructor' ? 'instructor' : 'student';
    const approvalStatus = intent === 'instructor' ? 'pending' : 'approved';

    const user = await this.usersRepo.create({
      email,
      name,
      passwordHash: null,
      role,
      avatarUrl: avatarUrl || null,
      isVerified: true,
      isActive: true,
      approvalStatus,
      onboardingCompleted: false,
      deletedAt: null,
    });

    // Create OAuth provider link
    await this.userAuthProvidersRepo.create({
      userId: user.id,
      provider,
      providerId,
    });

    const tokens = await this.tokenService.generateTokenPair(user);
    this.logger.log(`New user registered via ${provider} OAuth: ${user.id} (${email})`);

    return { user: this.sanitizeUser(user), tokens, isNewUser: true };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  /**
   * Revoke all refresh tokens for a user (used after OAuth portal access denial).
   */
  async revokeTokensForUser(userId: number): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
    this.logger.warn(`Revoked all tokens for user ${userId} after portal access denial.`);
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: any): any {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
