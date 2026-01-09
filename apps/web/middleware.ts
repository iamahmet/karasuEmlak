import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse, NextRequest } from 'next/server';
import { buildCSP, generateNonce } from './lib/security/csp';
import { createServerClient } from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Generate nonce for CSP (per-request, cryptographically secure)
  const nonce = generateNonce();
  
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
  
  // IMPORTANT: Use original request for intl middleware to preserve cookies
  // Supabase needs cookies to work properly, so we can't modify the request
  // Instead, we'll add nonce to request headers via NextResponse.next()
  const intlResponse = intlMiddleware(request);
  
  // Handle redirects from intl middleware
  if (intlResponse instanceof NextResponse) {
    // If redirect, add security headers and return
    if (intlResponse.status >= 300 && intlResponse.status < 400) {
      const csp = buildCSP({
        nonce,
        isDev: process.env.NODE_ENV === 'development',
      });
      intlResponse.headers.set('Content-Security-Policy', csp);
      intlResponse.headers.set('X-Frame-Options', 'DENY');
      intlResponse.headers.set('X-Content-Type-Options', 'nosniff');
      intlResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      if (process.env.NODE_ENV === 'production') {
        intlResponse.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }
      return intlResponse;
    }
    
    // Clone response to add security headers
    const response = intlResponse.clone();
    
    // Build CSP with nonce
    const csp = buildCSP({
      nonce,
      isDev: process.env.NODE_ENV === 'development',
    });
    
    // Set CSP header (overwrites any existing CSP)
    response.headers.set('Content-Security-Policy', csp);
    
    // Set other security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // HSTS only in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return response;
  }
  
  // Fallback: create new response if intl middleware returns something unexpected
  // IMPORTANT: Add nonce to request headers so server components can access it
  // This preserves cookies while adding nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  
  // Build CSP with nonce
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
  // Match only internationalized pathnames
  // Exclude API routes, static files, and Next.js internals
  // With localePrefix: "as-needed", /listings/new will work as /tr/listings/new automatically
  // Include /admin routes to handle them before intl middleware
  matcher: [
    '/',
    '/admin',
    '/admin/:path*',
    '/(tr|en|et|ru|ar)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

