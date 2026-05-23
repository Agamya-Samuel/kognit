import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { PasswordService } from '../services/password.service';
import { TokenService, TokenPayload } from '../services/token.service';
import { LockoutService } from '../services/lockout.service';
import { EmailVerificationService } from '../services/email-verification.service';
import { PasswordResetService } from '../services/password-reset.service';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { EmailVerificationsRepository } from '../../../db/repositories/email-verifications.repository';
import { RefreshTokensRepository } from '../../../db/repositories/refresh-tokens.repository';
import { UserAuthProvidersRepository } from '../../../db/repositories/user-auth-providers.repository';
import { CacheService } from '../../../common/services/cache.service';

// ─── Inline Test Factories ─────────────────────────────────────────────

function createUser(overrides: Record<string, any> = {}) {
  const id = overrides.id ?? Math.floor(Math.random() * 10000);
  return {
    id,
    email: overrides.email ?? `user${id}@edutech.test`,
    passwordHash: overrides.passwordHash ?? '$2b$12$hashedpassword',
    role: overrides.role ?? 'student',
    name: overrides.name ?? `Test User ${id}`,
    avatarUrl: overrides.avatarUrl ?? null,
    isVerified: overrides.isVerified ?? false,
    isActive: overrides.isActive ?? true,
    deletedAt: overrides.deletedAt ?? null,
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date(),
    ...overrides,
  };
}

// ─── Mock Helpers ───────────────────────────────────────────────────────

function createMockCacheService(): Record<string, jest.Mock> {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    invalidate: jest.fn().mockResolvedValue(0),
    exists: jest.fn().mockResolvedValue(false),
    expire: jest.fn().mockResolvedValue(true),
  };
}

const mockTokens: TokenPayload = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 900,
};

function createMockUsersRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findByEmail: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue({ data: [], total: 0, limit: 10, offset: 0 }),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

function createMockRefreshTokensRepo(overrides: Partial<Record<string, jest.Mock>> = {}): Record<string, jest.Mock> {
  return {
    findByTokenHash: jest.fn().mockResolvedValue(null),
    findActiveByTokenHash: jest.fn().mockResolvedValue(null),
    findActiveByUserId: jest.fn().mockResolvedValue([]),
    create: jest.fn(),
    revoke: jest.fn(),
    revokeAllByUserId: jest.fn().mockResolvedValue(0),
    revokeFamily: jest.fn().mockResolvedValue(0),
    deleteExpired: jest.fn().mockResolvedValue(0),
    ...overrides,
  };
}

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let usersRepo: Record<string, jest.Mock>;
  let refreshTokensRepo: Record<string, jest.Mock>;
  let cacheService: Record<string, jest.Mock>;
  let tokenService: { generateTokenPair: jest.Mock; revokeAllUserTokens: jest.Mock };
  let lockoutService: { assertNotLocked: jest.Mock; recordFailedAttempt: jest.Mock; resetAttempts: jest.Mock };
  let passwordService: { hash: jest.Mock; compare: jest.Mock };
  let emailVerificationService: { generateCode: jest.Mock; verifyCode: jest.Mock };
  let passwordResetService: { generateResetToken: jest.Mock; resetPasswordWithEmail: jest.Mock };
  let jwtService: { sign: jest.Mock; verify: jest.Mock; decode: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    usersRepo = createMockUsersRepo();
    refreshTokensRepo = createMockRefreshTokensRepo();
    cacheService = createMockCacheService();
    tokenService = { generateTokenPair: jest.fn().mockResolvedValue(mockTokens), revokeAllUserTokens: jest.fn().mockResolvedValue(5) };
    lockoutService = { assertNotLocked: jest.fn(), recordFailedAttempt: jest.fn().mockResolvedValue({ isLocked: false }), resetAttempts: jest.fn() };
    passwordService = { hash: jest.fn().mockResolvedValue('$2b$12$hashed'), compare: jest.fn().mockResolvedValue(true) };
    emailVerificationService = { generateCode: jest.fn().mockResolvedValue('654321'), verifyCode: jest.fn() };
    passwordResetService = { generateResetToken: jest.fn(), resetPasswordWithEmail: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token'), verify: jest.fn().mockReturnValue({ sub: 1, email: 'test@test.com', role: 'student' }), decode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 900 }) };
    configService = { get: jest.fn().mockReturnValue('test-secret') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: usersRepo },
        { provide: EmailVerificationsRepository, useValue: {} },
        { provide: RefreshTokensRepository, useValue: refreshTokensRepo },
        { provide: UserAuthProvidersRepository, useValue: {} },
        { provide: PasswordService, useValue: passwordService },
        { provide: TokenService, useValue: tokenService },
        { provide: LockoutService, useValue: lockoutService },
        { provide: EmailVerificationService, useValue: emailVerificationService },
        { provide: PasswordResetService, useValue: passwordResetService },
        { provide: CacheService, useValue: cacheService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ─── Registration Flow ──────────────────────────────────────────────

  describe('requestRegistrationVerification', () => {
    it('should throw ConflictException if email already registered', async () => {
      usersRepo.findByEmail.mockResolvedValue(createUser({ email: 'taken@test.com' }));
      await expect(service.requestRegistrationVerification('taken@test.com')).rejects.toThrow(ConflictException);
    });

    it('should store verification code in cache and return it', async () => {
      const result = await service.requestRegistrationVerification('new@test.com');
      expect(result.message).toContain('Verification code sent');
      expect(result.code).toBeDefined();
      expect(result.code).toHaveLength(6);
      expect(cacheService.set).toHaveBeenCalledWith(
        'pending_registration',
        'new@test.com',
        expect.objectContaining({ codeHash: expect.any(String) }),
        600,
      );
    });
  });

  describe('verifyRegistrationCode', () => {
    it('should throw BadRequestException if no pending verification', async () => {
      await expect(service.verifyRegistrationCode('new@test.com', '123456')).rejects.toThrow(BadRequestException);
    });

    it('should verify correct code and mark email as verified', async () => {
      cacheService.get.mockResolvedValue({ codeHash: '$2b$10$fakehash', createdAt: new Date().toISOString() });
      passwordService.compare.mockResolvedValue(true);
      const result = await service.verifyRegistrationCode('new@test.com', '123456');
      expect(result.verified).toBe(true);
      expect(result.email).toBe('new@test.com');
      expect(cacheService.set).toHaveBeenCalledWith(
        'pending_registration',
        'new@test.com',
        expect.objectContaining({ emailVerified: true }),
        600,
      );
    });

    it('should throw BadRequestException for wrong code', async () => {
      cacheService.get.mockResolvedValue({ codeHash: '$2b$10$fakehash', createdAt: new Date().toISOString() });
      passwordService.compare.mockResolvedValueOnce(false);
      await expect(service.verifyRegistrationCode('new@test.com', '000000')).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeRegistration', () => {
    it('should throw BadRequestException if email not verified', async () => {
      cacheService.get.mockResolvedValue({ codeHash: '$2b$10$fakehash', createdAt: new Date().toISOString(), emailVerified: false });
      await expect(service.completeRegistration('new@test.com', '123456', 'John', 'Password1')).rejects.toThrow(BadRequestException);
    });

    it('should create user and return tokens on success', async () => {
      const pending = { codeHash: '$2b$10$fakehash', createdAt: new Date().toISOString(), emailVerified: true };
      cacheService.get.mockResolvedValue(pending);
      passwordService.compare.mockResolvedValue(true);
      const newUser = createUser({ email: 'new@test.com', id: 99, isVerified: true, isActive: true });
      usersRepo.create.mockResolvedValue(newUser);

      const result = await service.completeRegistration('new@test.com', '123456', 'John Doe', 'Password123');

      expect(usersRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@test.com', name: 'John Doe', role: 'student', isVerified: true }),
      );
      expect(tokenService.generateTokenPair).toHaveBeenCalledWith(newUser);
      expect(result.tokens).toEqual(mockTokens);
      expect(cacheService.del).toHaveBeenCalledWith('pending_registration', 'new@test.com');
    });

    it('should throw ConflictException if user created during race condition', async () => {
      const pending = { codeHash: '$2b$10$fakehash', createdAt: new Date().toISOString(), emailVerified: true };
      cacheService.get.mockResolvedValue(pending);
      passwordService.compare.mockResolvedValue(true);
      usersRepo.findByEmail.mockResolvedValue(createUser({ email: 'new@test.com' }));
      await expect(service.completeRegistration('new@test.com', '123456', 'John', 'Password1')).rejects.toThrow(ConflictException);
    });
  });

  // ─── Login ──────────────────────────────────────────────────────────

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      usersRepo.findByEmail.mockResolvedValue(null);
      await expect(service.login('missing@test.com', 'password')).rejects.toThrow(UnauthorizedException);
      expect(lockoutService.recordFailedAttempt).toHaveBeenCalledWith('missing@test.com');
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = createUser({ email: 'user@test.com' });
      usersRepo.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(false);
      await expect(service.login('user@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException with lockout message when account is locked', async () => {
      const user = createUser({ email: 'user@test.com' });
      usersRepo.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(false);
      lockoutService.recordFailedAttempt.mockResolvedValue({ isLocked: true });
      await expect(service.login('user@test.com', 'wrong')).rejects.toThrow('locked due to too many failed');
    });

    it('should throw ForbiddenException for deactivated user', async () => {
      const user = createUser({ email: 'user@test.com', isActive: false });
      usersRepo.findByEmail.mockResolvedValue(user);
      await expect(service.login('user@test.com', 'password')).rejects.toThrow(ForbiddenException);
    });

    it('should return user and tokens on successful login', async () => {
      const user = createUser({ email: 'user@test.com', passwordHash: '$2b$12$hash' });
      usersRepo.findByEmail.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);
      const result = await service.login('user@test.com', 'Password123');
      expect(result.tokens).toEqual(mockTokens);
      expect(lockoutService.resetAttempts).toHaveBeenCalledWith('user@test.com');
      expect(result.user.passwordHash).toBeUndefined();
    });
  });

  // ─── Logout ─────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should revoke all user tokens', async () => {
      const result = await service.logout(1);
      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(1);
      expect(result.message).toContain('Logged out');
    });
  });

  // ─── Refresh Tokens ─────────────────────────────────────────────────

  describe('refreshTokens', () => {
    it('should throw UnauthorizedException for invalid JWT', async () => {
      jwtService.verify.mockImplementation(() => { throw new Error('invalid'); });
      await expect(service.refreshTokens(1, 'bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token sub does not match', async () => {
      jwtService.verify.mockReturnValue({ sub: 2, email: 'other@test.com', role: 'student' });
      await expect(service.refreshTokens(1, 'token')).rejects.toThrow('does not belong');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, email: 'test@test.com', role: 'student' });
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.refreshTokens(1, 'token')).rejects.toThrow('User not found');
    });

    it('should throw ForbiddenException for deactivated user', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, email: 'test@test.com', role: 'student' });
      usersRepo.findById.mockResolvedValue(createUser({ id: 1, isActive: false }));
      await expect(service.refreshTokens(1, 'token')).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException for token reuse (theft detection)', async () => {
      jwtService.verify.mockReturnValue({ sub: 1, email: 'test@test.com', role: 'student' });
      usersRepo.findById.mockResolvedValue(createUser({ id: 1 }));
      refreshTokensRepo.findActiveByUserId.mockResolvedValue([]);
      await expect(service.refreshTokens(1, 'stolen-token')).rejects.toThrow('Token reuse detected');
      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(1);
    });

    it('should rotate tokens successfully', async () => {
      const user = createUser({ id: 1 });
      jwtService.verify.mockReturnValue({ sub: 1, email: 'test@test.com', role: 'student' });
      usersRepo.findById.mockResolvedValue(user);
      passwordService.compare.mockResolvedValue(true);
      const mockToken = { id: 1, userId: 1, tokenHash: 'hash', family: 'family1', isRevoked: false, expiresAt: new Date(), createdAt: new Date() };
      refreshTokensRepo.findActiveByUserId.mockResolvedValue([mockToken]);
      refreshTokensRepo.revoke.mockResolvedValue(mockToken);
      tokenService.generateTokenPair.mockResolvedValue({ ...mockTokens, accessToken: 'new-access', refreshToken: 'new-refresh' });

      const result = await service.refreshTokens(1, 'valid-token');
      expect(refreshTokensRepo.revoke).toHaveBeenCalledWith(1);
      expect(tokenService.generateTokenPair).toHaveBeenCalledWith(user, 'family1');
      expect(result.accessToken).toBe('new-access');
    });
  });

  // ─── Profile ────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.getProfile(999)).rejects.toThrow(UnauthorizedException);
    });

    it('should return sanitized user', async () => {
      const user = createUser({ id: 1, passwordHash: 'secret-hash' });
      usersRepo.findById.mockResolvedValue(user);
      const result = await service.getProfile(1);
      expect(result.id).toBe(1);
      expect(result.passwordHash).toBeUndefined();
    });
  });

  // ─── Change Password ────────────────────────────────────────────────

  describe('changePassword', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      usersRepo.findById.mockResolvedValue(null);
      await expect(service.changePassword(1, 'old', 'new')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if current password is wrong', async () => {
      usersRepo.findById.mockResolvedValue(createUser({ id: 1 }));
      passwordService.compare.mockResolvedValue(false);
      await expect(service.changePassword(1, 'wrong', 'NewPass1')).rejects.toThrow('Current password is incorrect');
    });

    it('should change password and revoke all tokens', async () => {
      usersRepo.findById.mockResolvedValue(createUser({ id: 1 }));
      passwordService.compare.mockResolvedValue(true);
      const result = await service.changePassword(1, 'OldPass1', 'NewPass123');
      expect(usersRepo.update).toHaveBeenCalledWith(1, expect.objectContaining({ passwordHash: '$2b$12$hashed' }));
      expect(tokenService.revokeAllUserTokens).toHaveBeenCalledWith(1);
      expect(result.message).toContain('Password changed');
    });
  });

  // ─── Forgot / Reset Password ────────────────────────────────────────

  describe('forgotPassword', () => {
    it('should always return success to prevent email enumeration', async () => {
      const result = await service.forgotPassword('anyone@test.com');
      expect(result.message).toContain('If an account exists');
      expect(passwordResetService.generateResetToken).toHaveBeenCalledWith('anyone@test.com');
    });
  });

  describe('resetPasswordWithEmail', () => {
    it('should delegate to passwordResetService', async () => {
      passwordResetService.resetPasswordWithEmail.mockResolvedValue(undefined);
      const result = await service.resetPasswordWithEmail('user@test.com', 'token', 'NewPass1');
      expect(passwordResetService.resetPasswordWithEmail).toHaveBeenCalledWith('user@test.com', 'token', 'NewPass1');
      expect(result.message).toContain('Password reset');
    });
  });

  // ─── Email Verification ─────────────────────────────────────────────

  describe('requestEmailVerification', () => {
    it('should return already verified message if user is verified', async () => {
      usersRepo.findById.mockResolvedValue(createUser({ id: 1, isVerified: true }));
      const result = await service.requestEmailVerification(1);
      expect(result.message).toContain('already verified');
    });

    it('should generate code if user is not verified', async () => {
      usersRepo.findById.mockResolvedValue(createUser({ id: 1, isVerified: false }));
      const result = await service.requestEmailVerification(1);
      expect(emailVerificationService.generateCode).toHaveBeenCalledWith(1);
      expect(result.code).toBe('654321');
    });
  });

  describe('verifyEmail', () => {
    it('should delegate to emailVerificationService', async () => {
      const result = await service.verifyEmail(1, '123456');
      expect(emailVerificationService.verifyCode).toHaveBeenCalledWith(1, '123456');
      expect(result.verified).toBe(true);
    });
  });

  // ─── Deactivation Check ─────────────────────────────────────────────

  describe('isUserDeactivated', () => {
    it('should return true if user is in Redis deactivated set', async () => {
      cacheService.get.mockResolvedValue(true);
      expect(await service.isUserDeactivated(1)).toBe(true);
    });

    it('should return true if user isActive is false in DB', async () => {
      cacheService.get.mockResolvedValue(null);
      usersRepo.findById.mockResolvedValue(createUser({ id: 1, isActive: false }));
      expect(await service.isUserDeactivated(1)).toBe(true);
    });

    it('should return false if user is active', async () => {
      cacheService.get.mockResolvedValue(null);
      usersRepo.findById.mockResolvedValue(createUser({ id: 1, isActive: true }));
      expect(await service.isUserDeactivated(1)).toBe(false);
    });

    it('should return true if user not found in DB', async () => {
      cacheService.get.mockResolvedValue(null);
      usersRepo.findById.mockResolvedValue(null);
      expect(await service.isUserDeactivated(1)).toBe(true);
    });
  });
});
