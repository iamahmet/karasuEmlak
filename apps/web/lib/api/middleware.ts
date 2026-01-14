import { NextRequest } from 'next/server';

export function getRequestId(request: NextRequest): string {
  return (
    request.headers.get('x-request-id') ||
    request.headers.get('x-vercel-id') ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const localeMatch = pathname.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)/);
  return localeMatch ? localeMatch[1] : 'tr';
}
