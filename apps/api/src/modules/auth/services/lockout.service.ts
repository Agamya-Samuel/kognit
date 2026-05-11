import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CacheService } from '../../../common/services/cache.service';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes
const LOCKOUT_NAMESPACE = 'lockout';

@Injectable()
export class LockoutService {
  private readonly logger = new Logger(LockoutService.name);

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Check if an account is currently locked
   */
  async isLocked(email: string): Promise<boolean> {
    const lockInfo = await this.cacheService.get<{ attempts: number; lockedAt: string | null }>(
      LOCKOUT_NAMESPACE,
      email,
    );
    return !!lockInfo?.lockedAt;
  }

  /**
   * Get remaining lockout time in seconds (0 if not locked)
   */
  async getLockoutRemainingSeconds(email: string): Promise<number> {
    const lockInfo = await this.cacheService.get<{ attempts: number; lockedAt: string | null }>(
      LOCKOUT_NAMESPACE,
      email,
    );

    if (!lockInfo?.lockedAt) return 0;

    const lockedAt = new Date(lockInfo.lockedAt).getTime();
    const elapsed = (Date.now() - lockedAt) / 1000;
    const remaining = Math.max(0, LOCKOUT_DURATION_SECONDS - elapsed);

    if (remaining <= 0) {
      // Lockout expired, clean up
      await this.cacheService.del(LOCKOUT_NAMESPACE, email);
      return 0;
    }

    return Math.ceil(remaining);
  }

  /**
   * Record a failed login attempt. Returns true if the account is now locked.
   */
  async recordFailedAttempt(email: string): Promise<{ isLocked: boolean; attempts: number }> {
    const existing = await this.cacheService.get<{ attempts: number; lockedAt: string | null }>(
      LOCKOUT_NAMESPACE,
      email,
    );

    const attempts = (existing?.attempts || 0) + 1;

    if (attempts >= MAX_FAILED_ATTEMPTS) {
      await this.cacheService.set(
        LOCKOUT_NAMESPACE,
        email,
        { attempts, lockedAt: new Date().toISOString() },
        LOCKOUT_DURATION_SECONDS,
      );
      this.logger.warn(`Account locked for ${email} after ${attempts} failed attempts`);
      return { isLocked: true, attempts };
    }

    await this.cacheService.set(
      LOCKOUT_NAMESPACE,
      email,
      { attempts, lockedAt: null },
      LOCKOUT_DURATION_SECONDS,
    );

    return { isLocked: false, attempts };
  }

  /**
   * Reset failed attempt counter (on successful login or password reset)
   */
  async resetAttempts(email: string): Promise<void> {
    await this.cacheService.del(LOCKOUT_NAMESPACE, email);
  }

  /**
   * Manually unlock an account (admin action)
   */
  async unlockAccount(email: string): Promise<void> {
    await this.cacheService.del(LOCKOUT_NAMESPACE, email);
    this.logger.log(`Account unlocked for ${email} by admin`);
  }

  /**
   * Validate that an account is not locked. Throws if locked.
   */
  async assertNotLocked(email: string): Promise<void> {
    const isLocked = await this.isLocked(email);
    if (isLocked) {
      const remaining = await this.getLockoutRemainingSeconds(email);
      const minutes = Math.ceil(remaining / 60);
      throw new UnauthorizedException(
        `Account is temporarily locked due to too many failed login attempts. Please try again in ${minutes} minute(s).`,
      );
    }
  }
}
