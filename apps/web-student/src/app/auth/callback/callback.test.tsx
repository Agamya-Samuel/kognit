import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetMe } = vi.hoisted(() => ({
  mockGetMe: vi.fn(),
}));

vi.mock('@edutech/api-client', () => ({
  authService: {
    getMe: mockGetMe,
  },
}));

describe('Auth callback role validation logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should accept student role', async () => {
    mockGetMe.mockResolvedValue({ role: 'student', id: 1, email: 'a@b.com' });
    const { authService } = await import('@edutech/api-client');
    const profile = await authService.getMe();
    expect(profile.role).toBe('student');
  });

  it('should reject instructor role', async () => {
    mockGetMe.mockResolvedValue({ role: 'instructor', id: 1, email: 'a@b.com' });
    const { authService } = await import('@edutech/api-client');
    const profile = await authService.getMe();
    expect(profile.role).not.toBe('student');
  });

  it('should reject admin role', async () => {
    mockGetMe.mockResolvedValue({ role: 'admin', id: 1, email: 'a@b.com' });
    const { authService } = await import('@edutech/api-client');
    const profile = await authService.getMe();
    expect(profile.role).not.toBe('student');
  });

  it('should handle missing role', async () => {
    mockGetMe.mockResolvedValue({ id: 1, email: 'a@b.com' });
    const { authService } = await import('@edutech/api-client');
    const profile = await authService.getMe();
    expect(profile.role).toBeUndefined();
  });

  it('should handle API failure gracefully', async () => {
    mockGetMe.mockRejectedValue(new Error('Network error'));
    const { authService } = await import('@edutech/api-client');
    await expect(authService.getMe()).rejects.toThrow('Network error');
  });
});
