import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';

/**
 * Custom Events API
 * Stores custom events for analysis
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 100 requests per minute per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'analytics-events',
    limit: 100,
    window: '1 m',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await request.json();
    const { eventName, ...properties } = body;

    // Store in database (if table exists)
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('custom_events')
      .insert({
        event_name: eventName,
        properties: properties || {},
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Table might not exist, that's okay
      console.error('Error storing custom event:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Custom events API error:', error);
    return NextResponse.json(
      { error: 'Failed to store custom event' },
      { status: 500 }
    );
  }
}
