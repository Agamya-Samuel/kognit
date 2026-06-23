import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side route protection.
 *
 * Without this, protected routes are protected only by the client-side
 * `useEffect` in the dashboard layout. That has two problems:
 *   1. The full client JS bundle is downloaded and executed for
 *      unauthenticated users before they get redirected (waste + flash of
 *      loading state).
 *   2. Crawlers / preview bots see the unauthenticated HTML for protected
 *      pages — they don't run client-side auth checks.
 *
 * This middleware short-circuits both problems: it runs on the server before
 * the HTML is sent and either lets the request through (cookie present) or
 * 302-redirects to /auth/login (cookie absent).
 *
 * Note: this is a *presence* check on the cookie, not a JWT validation.
 * An expired or tampered cookie will still pass the middleware and the
 * client-side auth check will then trigger a token refresh or logout.
 * That's fine — the goal here is to keep crawlers and JS-disabled clients
 * out of protected HTML, not to enforce token validity at the edge.
 */

// Paths the middleware should NOT intercept.
const PUBLIC_PREFIXES = [
  '/auth',
  '/api', // API routes do their own auth
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

// Public static asset extensions.
const PUBLIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff2?|ttf|map)$/i;

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/courses',
  '/assignments',
  '/certificates',
  '/community',
  '/jobs',
  '/my-courses',
  '/notifications',
  '/placement',
  '/profile',
  '/submissions',
  '/verify-email',
];

const COOKIE_NAMES = ['accessToken', '__Secure-accessToken'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip public paths.
  if (
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    PUBLIC_EXTENSIONS.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Only intercept the protected prefixes; everything else (e.g. landing
  // pages) is also public.
  if (!PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Look for the access-token cookie (dev or __Secure- production variant).
  const hasToken = COOKIE_NAMES.some((name) => req.cookies.get(name)?.value);
  if (hasToken) {
    return NextResponse.next();
  }

  // Redirect to login with the original path so the user comes back after auth.
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/auth/login';
  loginUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(loginUrl);
}

// Restrict the middleware to protected paths so we don't run on every asset.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
