import { NextResponse, type NextRequest } from 'next/server';

/**
 * Server-side route protection for the admin portal.
 * See apps/web-student/middleware.ts for design notes.
 */

const PUBLIC_PREFIXES = [
  '/auth',
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

const PUBLIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|svg|webp|gif|css|js|woff2?|ttf|map)$/i;

const PROTECTED_PREFIXES = [
  '/dashboard',
];

const COOKIE_NAMES = ['accessToken', '__Secure-accessToken'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    PUBLIC_EXTENSIONS.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (!PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const hasToken = COOKIE_NAMES.some((name) => req.cookies.get(name)?.value);
  if (hasToken) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = '/auth/login';
  loginUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
