import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildCSP, generateNonce } from './lib/security/csp';

const intlMiddleware = createMiddleware(routing);

// Locale prefix'ler: sadece tr aktif; en, et, ru, ar 404 vermesin diye varsayılana yönlendir
const INACTIVE_LOCALE_PREFIX = /^\/(en|et|ru|ar)(\/|$)/;
// Root-level, locale'siz çalışması gereken yollar
const NON_LOCALIZED_PATHS = ['/healthz', '/offline'];

// Next.js v16+ uses the `proxy.ts` convention (node runtime). Keep name as `proxy`.
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Generate nonce for CSP (per-request, cryptographically secure)
  const nonce = generateNonce();

  // Aktif olmayan locale ile başlayan yolları varsayılan locale path'ine yönlendir (404 önleme)
  if (routing.locales.length === 1 && INACTIVE_LOCALE_PREFIX.test(pathname)) {
    const newPath = pathname.replace(INACTIVE_LOCALE_PREFIX, '/') || '/';
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url, 307);
  }

  // Check if request is coming from admin subdomain
  // If yes, redirect to admin subdomain (admin app handles it)
  const isAdminSubdomain =
    process.env.NODE_ENV === 'development'
      ? hostname.includes('localhost:3001') || hostname.includes('127.0.0.1:3001')
      : hostname.startsWith('admin.') || hostname.includes('.admin.');

  // If admin subdomain, redirect to admin app (in production)
  // In development, admin runs on port 3001 separately
  if (isAdminSubdomain && process.env.NODE_ENV === 'production') {
    // Admin subdomain should be handled by separate admin app
    // This middleware should not process admin subdomain requests
    // But if it does, let it pass through (admin app will handle it)
  }

  // Block /admin routes on main domain - redirect to admin subdomain
  const adminRoutePattern = /^\/(tr|en|et|ru|ar)?\/?admin(\/|$)/;
  const isAdminRoute = adminRoutePattern.test(pathname);

  if (isAdminRoute && !isAdminSubdomain) {
    // Redirect to admin subdomain
    const adminDomain = process.env.NEXT_PUBLIC_ADMIN_URL ||
      (process.env.NODE_ENV === 'development'
        ? 'http://localhost:3001'
        : 'https://admin.karasuemlak.net');

    // Extract locale from pathname or default to 'tr'
    const localeMatch = pathname.match(/^\/(tr|en|et|ru|ar)/);
    const locale = localeMatch ? localeMatch[1] : 'tr';

    // Remove locale prefix from pathname for admin app
    const adminPath = pathname.replace(/^\/(tr|en|et|ru|ar)\/admin/, '/tr').replace(/^\/admin/, '/tr');
    const adminUrl = new URL(adminPath, adminDomain);

    const response = NextResponse.redirect(adminUrl);
    // Add security headers
    const csp = buildCSP({ nonce, isDev: process.env.NODE_ENV === 'development' });
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    return response;
  }

  // Skip middleware for API routes, static files, and Next.js internals
  if (pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next();
  }

  // healthz/offline gibi locale'siz servis yolları
  const isNonLocalizedPath = NON_LOCALIZED_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );
  if (isNonLocalizedPath) {
    return NextResponse.next();
  }

  // For single-language site: rewrite /satilik -> /tr/satilik internally
  // This allows clean URLs without /tr prefix while keeping next-intl structure
  const hasLocalePrefix = /^\/(tr|en|et|ru|ar)(\/|$)/.test(pathname);

  if (!hasLocalePrefix) {
    // Rewrite to /tr/... for internal routing
    // This bypasses next-intl middleware to avoid conflicts
    const url = request.nextUrl.clone();
    url.pathname = `/tr${pathname === '/' ? '' : pathname}`;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('x-next-intl-locale', 'tr');

    const rewrite = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });

    rewrite.cookies.set('NEXT_LOCALE', 'tr');

    return rewrite;
  }

  // For paths with locale prefix (like /tr/...), use next-intl middleware
  // But only if it's not the default locale to avoid redirect loops
  if (hasLocalePrefix && !pathname.startsWith('/tr')) {
    const intlResponse = await intlMiddleware(request);

    if (intlResponse instanceof NextResponse) {
      const isRewrite = intlResponse.status === 200 &&
        (intlResponse.headers.get('x-middleware-rewrite') !== null ||
          intlResponse.headers.get('x-nextjs-rewrite') !== null);
      const isRedirect = intlResponse.status >= 300 && intlResponse.status < 400;

      // Redirect: güvenlik başlıkları ekle; rewrite/next ise DOKUNMA (bazı durumlarda route match'i bozuyor).
      if (isRedirect) {
        const response = intlResponse.clone();
        const csp = buildCSP({
          nonce,
          isDev: process.env.NODE_ENV === 'development',
        });
        response.headers.set('Content-Security-Policy', csp);
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        if (process.env.NODE_ENV === 'production') {
          response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        response.headers.set('X-DNS-Prefetch-Control', 'on');
        response.headers.set('X-XSS-Protection', '1; mode=block');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        return response;
      }

      return intlResponse;
    }
  }

  // For /tr/... paths, just add security headers and pass through
  const finalRequestHeaders = new Headers(request.headers);
  finalRequestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: finalRequestHeaders,
    },
  });

  const csp = buildCSP({
    nonce,
    isDev: process.env.NODE_ENV === 'development',
  });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  // Match all pathnames except API routes, static files, and Next.js internals
  // With localePrefix: "never", URLs have no prefix (e.g., /satilik, /kiralik)
  // Include /admin routes to handle them before intl middleware
  matcher: [
    '/',
    '/admin',
    '/admin/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
