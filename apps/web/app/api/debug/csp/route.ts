import { headers } from 'next/headers';
import { buildCSP, getAllowedConnectDomains } from '@/lib/security/csp';
import { NextResponse } from 'next/server';

/**
 * CSP Debug Endpoint (Development Only)
 * 
 * Returns:
 * - Current nonce
 * - CSP header string
 * - Allowed domains for connect-src
 * 
 * Usage: GET /api/debug/csp
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const headersList = await headers();
    const nonce = headersList.get('x-nonce');
    const cspHeader = headersList.get('content-security-policy');
    
    // Build CSP with current nonce
    const csp = buildCSP({
      nonce: nonce || '',
      isDev: true,
    });
    
    // Get allowed domains
    const allowedConnectDomains = getAllowedConnectDomains(true);
    
    return NextResponse.json({
      nonce: nonce || 'NOT SET',
      cspHeader: cspHeader || 'NOT SET',
      computedCSP: csp,
      allowedConnectDomains,
      directives: {
        scriptSrc: csp.includes("'nonce-") ? 'Has nonce' : 'Missing nonce',
        connectSrc: allowedConnectDomains.length,
        isDev: process.env.NODE_ENV === 'development',
      },
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get CSP info',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
