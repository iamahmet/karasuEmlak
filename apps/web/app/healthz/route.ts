/**
 * Health Check Endpoint
 * 
 * Returns instantly - no database, no fetch, no blocking operations
 * Used by monitoring, load balancers, and dev health checks
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Use edge runtime for fastest response

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: Date.now(),
      service: 'web',
      port: 3000,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

