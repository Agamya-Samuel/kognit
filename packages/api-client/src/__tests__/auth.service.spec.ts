import { beforeEach, describe, expect, test, vi } from 'vitest';
import { authService } from '../services/auth';

// Mock the getApiClient function
vi.mock('../index', () => ({
  getApiClient: vi.fn(),
}));

describe('authService', () => {
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(require('../index').getApiClient).mockReturnValue({
      post: mockPost,
    });
  });

  describe('login', () => {
    test('should call login endpoint with correct parameters', async () => {
      const mockResponse = {
        user: { id: 1, email: 'test@example.com', name: 'Test User', role: 'student' },
        tokens: { accessToken: 'token123', refreshToken: 'refresh123' },
      };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password123');

      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });

    test('should handle error from API', async () => {
      mockPost.mockRejectedValue(new Error('Invalid credentials'));

      await expect(authService.login('test@example.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('changePassword', () => {
    test('should call change-password endpoint with correct parameters', async () => {
      const mockResponse = { message: 'Password changed successfully' };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.changePassword('oldPass123', 'newPass456');

      expect(mockPost).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'oldPass123',
        newPassword: 'newPass456',
      });
      expect(result).toEqual(mockResponse);
    });

    test('should handle error from API', async () => {
      mockPost.mockRejectedValue(new Error('Current password is incorrect'));

      await expect(authService.changePassword('wrongOld', 'newPass')).rejects.toThrow(
        'Current password is incorrect'
      );
    });
  });

  describe('enableTwoFactor', () => {
    test('should call 2fa enable endpoint', async () => {
      const mockResponse = { secret: 'SECRET123', qrCode: 'data:image/png;base64,ABC123' };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.enableTwoFactor();

      expect(mockPost).toHaveBeenCalledWith('/auth/2fa/enable', {});
      expect(result).toEqual(mockResponse);
    });

    test('should handle error from API', async () => {
      mockPost.mockRejectedValue(new Error('Failed to generate 2FA secret'));

      await expect(authService.enableTwoFactor()).rejects.toThrow(
        'Failed to generate 2FA secret'
      );
    });
  });

  describe('disableTwoFactor', () => {
    test('should call 2fa disable endpoint with token', async () => {
      const mockResponse = { message: '2FA disabled successfully' };
      mockPost.mockResolvedValue(mockResponse);

      const result = await authService.disableTwoFactor('TOKEN123');

      expect(mockPost).toHaveBeenCalledWith('/auth/2fa/disable', { token: 'TOKEN123' });
      expect(result).toEqual(mockResponse);
    });

    test('should handle error from API', async () => {
      mockPost.mockRejectedValue(new Error('Invalid 2FA token'));

      await expect(authService.disableTwoFactor('invalid')).rejects.toThrow(
        'Invalid 2FA token'
      );
    });
  });
});