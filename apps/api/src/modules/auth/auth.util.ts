import type { Response } from 'express';
import type { ConfigService } from '@nestjs/config';

/**
 * Parse the CORS_ORIGINS env var into a list of allowed origins.
 * CORS_ORIGINS is a comma-separated string with no transform (see configuration.ts).
 */
export function getAllowedOrigins(configService: ConfigService): string[] {
  return (configService.get<string>('CORS_ORIGINS') || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Validate a post-OAuth redirect target. The OAuth callback only honors:
 *   1. Relative paths starting with '/' (and not '//' which is protocol-relative)
 *   2. Absolute URLs whose origin is in the CORS_ORIGINS allow-list
 *
 * Rejects:
 *   - Protocol-relative URLs ('//evil.com/...')
 *   - javascript: and data: schemes
 *   - Any origin not in the allow-list
 *
 * Used to prevent the OAuth open-redirect attack where an attacker crafts a
 * state parameter pointing to evil.com and steals the callback's tokens.
 */
export function isAllowedRedirect(redirect: unknown, allowedOrigins: string[]): boolean {
  if (typeof redirect !== 'string' || redirect.length === 0) return false;
  // Relative path: must start with a single '/'
  if (redirect.startsWith('/') && !redirect.startsWith('//')) return true;
  // Absolute URL: must have a parseable origin that matches the allow-list
  try {
    const url = new URL(redirect);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    return allowedOrigins.includes(url.origin);
  } catch {
    return false;
  }
}

/**
 * Pick a redirect target from a candidate, falling back to a default path on
 * the first allowed origin. The default path is '/auth/callback' which the
 * frontends already handle.
 */
export function resolveRedirect(
  candidate: unknown,
  allowedOrigins: string[],
  fallbackOrigin: string,
  fallbackPath = '/auth/callback',
): string {
  if (isAllowedRedirect(candidate, allowedOrigins)) {
    return candidate as string;
  }
  return `${fallbackOrigin}${fallbackPath}`;
}

/**
 * Set the auth tokens as httpOnly cookies on the response. The frontend
 * reads them implicitly on the next API call (browsers attach httpOnly
 * cookies automatically; the api-client must use credentials: 'include').
 *
 * Cookie attributes:
 *   - httpOnly: not readable from JS (XSS-safe)
 *   - secure: only over HTTPS in production (prevents MITM downgrade)
 *   - sameSite: 'lax' so the cookie is sent on the cross-site OAuth redirect
 *     (top-level GET navigation). 'strict' would block the callback entirely.
 *   - path: '/' so all API routes see the cookie
 *
 * In production the cookie name gets a __Secure- prefix to bind it to HTTPS.
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  isProduction: boolean,
): void {
  const baseOpts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  };
  const accessName = isProduction ? '__Secure-accessToken' : 'accessToken';
  const refreshName = isProduction ? '__Secure-refreshToken' : 'refreshToken';
  // 15 minutes for access token, 30 days for refresh token (matches JWT_EXPIRY defaults).
  res.cookie(accessName, accessToken, { ...baseOpts, maxAge: 15 * 60 * 1000 });
  res.cookie(refreshName, refreshToken, { ...baseOpts, maxAge: 30 * 24 * 60 * 60 * 1000 });
}
