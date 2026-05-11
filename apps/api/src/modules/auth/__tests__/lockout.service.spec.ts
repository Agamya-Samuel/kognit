import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../../common/services/cache.service';
import { LockoutService } from '../services/lockout.service';
import { UnauthorizedException } from '@nestjs/common';

describe('LockoutService', () => {
  let service: LockoutService;
  let cacheService: Record<string, jest.Mock>;

  beforeEach(async () => {
    cacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      invalidate: jest.fn().mockResolvedValue(0),
      exists: jest.fn().mockResolvedValue(false),
      expire: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LockoutService,
        { provide: CacheService, useValue: cacheService },
      ],
    }).compile();

    service = module.get<LockoutService>(LockoutService);
  });

  describe('isLocked', () => {
    it('should return false if no lockout data in cache', async () => {
      cacheService.get.mockResolvedValue(null);
      expect(await service.isLocked('user@test.com')).toBe(false);
    });

    it('should return true if lockout has not expired', async () => {
      const futureExpiry = new Date(Date.now() + 600 * 1000).toISOString();
      cacheService.get.mockResolvedValue({ attempts: 5, lockedAt: futureExpiry });
      expect(await service.isLocked('user@test.com')).toBe(true);
    });

    it('should return true even if expired (isLocked only checks presence)', async () => {
      const pastExpiry = new Date(Date.now() - 100 * 1000).toISOString();
      cacheService.get.mockResolvedValue({ attempts: 5, lockedAt: pastExpiry });
      // isLocked only checks if lockedAt is truthy, doesn't check expiration
      expect(await service.isLocked('user@test.com')).toBe(true);
    });
  });

  describe('getLockoutRemainingSeconds', () => {
    it('should return 0 if not locked', async () => {
      cacheService.get.mockResolvedValue(null);
      expect(await service.getLockoutRemainingSeconds('user@test.com')).toBe(0);
    });

    it('should return remaining seconds', async () => {
      // lockedAt is the time lockout STARTED, so set it in the past
      // ~600s ago → remaining ≈ 900 - 600 = 300s
      const pastStart = new Date(Date.now() - 600 * 1000).toISOString();
      cacheService.get.mockResolvedValue({ attempts: 5, lockedAt: pastStart });
      const remaining = await service.getLockoutRemainingSeconds('user@test.com');
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(301);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should create new attempt record for first failure', async () => {
      cacheService.get.mockResolvedValue(null);
      const result = await service.recordFailedAttempt('user@test.com');
      expect(result.attempts).toBe(1);
      expect(result.isLocked).toBe(false);
      expect(cacheService.set).toHaveBeenCalledWith(
        'lockout',
        'user@test.com',
        { attempts: 1, lockedAt: null },
        900,
      );
    });

    it('should increment attempts on subsequent failures', async () => {
      cacheService.get.mockResolvedValue({ attempts: 3, lockedAt: null });
      const result = await service.recordFailedAttempt('user@test.com');
      expect(result.attempts).toBe(4);
      expect(result.isLocked).toBe(false);
    });

    it('should lock account after 5 failed attempts', async () => {
      cacheService.get.mockResolvedValue({ attempts: 4, lockedAt: null });
      const result = await service.recordFailedAttempt('user@test.com');
      expect(result.attempts).toBe(5);
      expect(result.isLocked).toBe(true);
      expect(cacheService.set).toHaveBeenCalledWith(
        'lockout',
        'user@test.com',
        expect.objectContaining({ lockedAt: expect.any(String) }),
        900,
      );
    });
  });

  describe('resetAttempts', () => {
    it('should delete lockout data from cache', async () => {
      await service.resetAttempts('user@test.com');
      expect(cacheService.del).toHaveBeenCalledWith('lockout', 'user@test.com');
    });
  });

  describe('unlockAccount', () => {
    it('should delete lockout data from cache', async () => {
      await service.unlockAccount('user@test.com');
      expect(cacheService.del).toHaveBeenCalledWith('lockout', 'user@test.com');
    });
  });

  describe('assertNotLocked', () => {
    it('should not throw if account is not locked', async () => {
      cacheService.get.mockResolvedValue(null);
      await expect(service.assertNotLocked('user@test.com')).resolves.not.toThrow();
    });

    it('should throw UnauthorizedException with remaining time if locked', async () => {
      const futureExpiry = new Date(Date.now() + 600 * 1000).toISOString();
      cacheService.get.mockResolvedValue({ attempts: 5, lockedAt: futureExpiry });
      await expect(service.assertNotLocked('user@test.com')).rejects.toThrow(UnauthorizedException);
      await expect(service.assertNotLocked('user@test.com')).rejects.toThrow(/too many failed/);
    });
  });
});
