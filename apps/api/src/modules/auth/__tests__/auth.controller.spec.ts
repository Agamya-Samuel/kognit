import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { ConflictException, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { createUser } from '../../../test/factories';

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Record<string, jest.Mock>;

  beforeEach(async () => {
    authService = {
      requestRegistrationVerification: jest.fn(),
      verifyRegistrationCode: jest.fn(),
      completeRegistration: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refreshTokens: jest.fn(),
      getProfile: jest.fn(),
      changePassword: jest.fn(),
      forgotPassword: jest.fn(),
      resetPasswordWithEmail: jest.fn(),
      requestEmailVerification: jest.fn(),
      verifyEmail: jest.fn(),
      isUserDeactivated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  // ─── Registration ────────────────────────────────────────────────────

  describe('requestRegistration', () => {
    it('should call authService.requestRegistrationVerification', async () => {
      authService.requestRegistrationVerification.mockResolvedValue({ message: 'sent', code: '123456' });
      const result = await controller.requestRegistration({ email: 'new@test.com' });
      expect(authService.requestRegistrationVerification).toHaveBeenCalledWith('new@test.com');
      expect(result.code).toBe('123456');
    });
  });

  describe('verifyRegistrationCode', () => {
    it('should call authService.verifyRegistrationCode', async () => {
      authService.verifyRegistrationCode.mockResolvedValue({ verified: true, email: 'new@test.com' });
      const result = await controller.verifyRegistrationCode({ email: 'new@test.com', code: '123456' });
      expect(authService.verifyRegistrationCode).toHaveBeenCalledWith('new@test.com', '123456');
      expect(result.verified).toBe(true);
    });
  });

  describe('completeRegistration', () => {
    it('should call authService.completeRegistration', async () => {
      const user = createUser({ isVerified: true });
      const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 };
      authService.completeRegistration.mockResolvedValue({ user, tokens });
      const result = await controller.completeRegistration({
        email: 'new@test.com',
        code: '123456',
        name: 'John Doe',
        password: 'Password123',
      });
      expect(authService.completeRegistration).toHaveBeenCalledWith('new@test.com', '123456', 'John Doe', 'Password123');
      expect(result.tokens).toEqual(tokens);
    });
  });

  // ─── Login / Logout ──────────────────────────────────────────────────

  describe('login', () => {
    it('should call authService.login', async () => {
      const user = createUser();
      const tokens = { accessToken: 'at', refreshToken: 'rt', expiresIn: 900 };
      authService.login.mockResolvedValue({ user, tokens });
      const result = await controller.login({ email: 'user@test.com', password: 'Password123' });
      expect(authService.login).toHaveBeenCalledWith('user@test.com', 'Password123');
      expect(result.tokens).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should call authService.logout with user id', async () => {
      authService.logout.mockResolvedValue({ message: 'Logged out' });
      const result = await controller.logout({ sub: 1, email: 'test@test.com', role: 'student' });
      expect(authService.logout).toHaveBeenCalledWith(1);
      expect(result.message).toContain('Logged out');
    });
  });

  // ─── Refresh ─────────────────────────────────────────────────────────

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens with user id and raw token', async () => {
      const newTokens = { accessToken: 'new-at', refreshToken: 'new-rt', expiresIn: 900 };
      authService.refreshTokens.mockResolvedValue(newTokens);
      const mockReq = { body: { refreshToken: 'raw-refresh-token' } };
      const result = await controller.refreshTokens({ sub: 1, email: 'test@test.com', role: 'student' }, mockReq as any);
      expect(authService.refreshTokens).toHaveBeenCalledWith(1, 'raw-refresh-token');
      expect(result.accessToken).toBe('new-at');
    });
  });

  // ─── Profile ─────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should call authService.getProfile with user id', async () => {
      const user = createUser();
      authService.getProfile.mockResolvedValue(user);
      const result = await controller.getProfile({ sub: 1, email: 'test@test.com', role: 'student' });
      expect(authService.getProfile).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });

  // ─── Password Management ─────────────────────────────────────────────

  describe('changePassword', () => {
    it('should call authService.changePassword', async () => {
      authService.changePassword.mockResolvedValue({ message: 'Password changed' });
      const result = await controller.changePassword(
        { sub: 1, email: 'test@test.com', role: 'student' },
        { currentPassword: 'OldPass1', newPassword: 'NewPass1' },
      );
      expect(authService.changePassword).toHaveBeenCalledWith(1, 'OldPass1', 'NewPass1');
      expect(result.message).toContain('Password changed');
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      authService.forgotPassword.mockResolvedValue({ message: 'If an account exists' });
      const result = await controller.forgotPassword({ email: 'user@test.com' });
      expect(authService.forgotPassword).toHaveBeenCalledWith('user@test.com');
      expect(result.message).toContain('If an account exists');
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPasswordWithEmail', async () => {
      authService.resetPasswordWithEmail.mockResolvedValue({ message: 'Password reset' });
      const result = await controller.resetPassword({
        email: 'user@test.com',
        token: 'reset-token',
        password: 'NewPass1',
      });
      expect(authService.resetPasswordWithEmail).toHaveBeenCalledWith('user@test.com', 'reset-token', 'NewPass1');
      expect(result.message).toContain('Password reset');
    });
  });

  // ─── Email Verification ──────────────────────────────────────────────

  describe('requestEmailVerification', () => {
    it('should call authService.requestEmailVerification', async () => {
      authService.requestEmailVerification.mockResolvedValue({ message: 'Code sent', code: '654321' });
      const result = await controller.requestEmailVerification({ sub: 1, email: 'test@test.com', role: 'student' });
      expect(authService.requestEmailVerification).toHaveBeenCalledWith(1);
      expect(result.code).toBe('654321');
    });
  });

  describe('verifyEmail', () => {
    it('should call authService.verifyEmail', async () => {
      authService.verifyEmail.mockResolvedValue({ verified: true });
      const result = await controller.verifyEmail(
        { sub: 1, email: 'test@test.com', role: 'student' },
        { email: 'test@test.com', code: '123456' },
      );
      expect(authService.verifyEmail).toHaveBeenCalledWith(1, '123456');
      expect(result.verified).toBe(true);
    });
  });
});
