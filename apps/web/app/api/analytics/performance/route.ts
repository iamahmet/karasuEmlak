import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';

/**
 * Performance Metrics API
 * Stores performance metrics for analysis
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 100 requests per minute per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'analytics-performance',
    limit: 100,
    window: '1 m',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await request.json();
    const { metricName, value, unit, ...context } = body;

    // Store in database (if table exists)
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        metric_name: metricName,
        value,
        unit: unit || 'ms',
        context: context || {},
        created_at: new Date().toISOString(),
      });

    if (error) {
      // Table might not exist, that's okay
      console.error('Error storing performance metric:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Performance metrics API error:', error);
    return NextResponse.json(
      { error: 'Failed to store performance metric' },
      { status: 500 }
    );
  }
}
