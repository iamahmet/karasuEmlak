/**
 * Health Check Endpoint (Admin)
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
      service: 'admin',
      port: 3001,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

