import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomBytes, timingSafeEqual } from 'crypto';
import type { Request, Response } from 'express';

/**
 * CSRF Guard — Double-Submit Cookie Pattern
 *
 * Safe methods (GET, HEAD, OPTIONS):
 *   - Generate a random XSRF token and set it as a non-httpOnly cookie
 *     (`XSRF-TOKEN`). The browser JS can read this cookie and echo it
 *     back in the `X-XSRF-TOKEN` header on state-changing requests.
 *
 * State-changing methods (POST, PUT, PATCH, DELETE):
 *   - Read the `XSRF-TOKEN` cookie and the `X-XSRF-TOKEN` request header.
 *   - Reject with 403 if they are missing or do not match (timing-safe).
 *   - Skip `@Public()` endpoints — they are unauthenticated and do not
 *     need CSRF protection (no session cookie to exploit).
 *
 * Cookie attributes mirror auth.util.ts `setAuthCookies`:
 *   - secure: HTTPS-only in production
 *   - sameSite: 'lax' (consistent with auth cookies)
 *   - path: '/' (visible to all routes)
 *   - httpOnly: false (JS must read the value to echo it back)
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private static readonly COOKIE_NAME = 'XSRF-TOKEN';
  private static readonly HEADER_NAME = 'x-xsrf-token';
  private static readonly TOKEN_BYTES = 32;

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const method = req.method.toUpperCase();

    // Safe methods: issue the token cookie (idempotent — only set if missing).
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      this.ensureCsrfCookie(req, res);
      return true;
    }

    // State-changing methods: validate the token.
    const cookieToken = this.readCookie(req, CsrfGuard.COOKIE_NAME);
    const headerToken = req.headers[CsrfGuard.HEADER_NAME] as string | undefined;

    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    if (!this.safeCompare(cookieToken, headerToken)) {
      throw new ForbiddenException('CSRF token mismatch');
    }

    return true;
  }

  /**
   * Set the XSRF-TOKEN cookie if it is not already present on the request.
   * This avoids overwriting the token on every GET, which would invalidate
   * any in-flight state-changing requests that already read the old value.
   */
  private ensureCsrfCookie(req: Request, res: Response): void {
    const existing = this.readCookie(req, CsrfGuard.COOKIE_NAME);
    if (existing) return;

    const token = randomBytes(CsrfGuard.TOKEN_BYTES).toString('hex');
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(CsrfGuard.COOKIE_NAME, token, {
      httpOnly: false, // JS must read this
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }

  /**
   * Parse a single cookie value from the raw Cookie header.
   * Avoids depending on `cookie-parser` middleware.
   */
  private readCookie(req: Request, name: string): string | undefined {
    const header = req.headers.cookie;
    if (!header) return undefined;
    const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : undefined;
  }

  /**
   * Constant-time string comparison to prevent timing side-channel attacks.
   */
  private safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}
