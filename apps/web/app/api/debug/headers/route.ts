import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * GET /api/debug/headers
 * Development-only endpoint to inspect response headers
 * Useful for debugging CSP and security headers
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const headersList = await headers();
  const headerEntries: Record<string, string> = {};

  // Get all security-related headers
  const securityHeaders = [
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'strict-transport-security',
    'x-dns-prefetch-control',
    'x-xss-protection',
    'permissions-policy',
    'x-nonce',
  ];

  securityHeaders.forEach((headerName) => {
    const value = headersList.get(headerName);
    if (value) {
      headerEntries[headerName] = value;
    }
  });

  return NextResponse.json(
    {
      environment: process.env.NODE_ENV,
      headers: headerEntries,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
