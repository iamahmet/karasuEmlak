/**
 * AI Images Stats API
 * Returns statistics about AI image generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

export async function GET(_req: NextRequest) {
  try {
    const supabase = createServiceClient();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get hourly stats
    const { count: hourlyCount } = await supabase
      .from('ai_image_generation_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo.toISOString());

    // Get daily stats
    const { data: dailyLogs } = await supabase
      .from('ai_image_generation_logs')
      .select('cost, success, generation_type')
      .gte('created_at', oneDayAgo.toISOString());

    // Get weekly stats
    const { data: weeklyLogs } = await supabase
      .from('ai_image_generation_logs')
      .select('cost, success')
      .gte('created_at', oneWeekAgo.toISOString());

    // Get monthly stats
    const { data: monthlyLogs } = await supabase
      .from('ai_image_generation_logs')
      .select('cost, success')
      .gte('created_at', oneMonthAgo.toISOString());

    // Get media assets stats
    const { count: totalAIImages } = await supabase
      .from('media_assets')
      .select('*', { count: 'exact', head: true })
      .eq('ai_generated', true);

    const { data: mostUsedImages } = await supabase
      .from('media_assets')
      .select('id, cloudinary_public_id, cloudinary_secure_url, title, usage_count, generation_cost, created_at')
      .eq('ai_generated', true)
      .order('usage_count', { ascending: false, nullsFirst: false })
      .limit(10);

    // Calculate stats
    const dailyCost = dailyLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
    const dailySuccess = dailyLogs?.filter(log => log.success).length || 0;
    const dailyFailed = (dailyLogs?.length || 0) - dailySuccess;

    const weeklyCost = weeklyLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
    const monthlyCost = monthlyLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;

    // Group by type
    const byType = dailyLogs?.reduce((acc, log) => {
      const type = log.generation_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      success: true,
      stats: {
        hourly: {
          count: hourlyCount || 0,
        },
        daily: {
          count: dailyLogs?.length || 0,
          success: dailySuccess,
          failed: dailyFailed,
          cost: dailyCost,
          byType,
        },
        weekly: {
          count: weeklyLogs?.length || 0,
          cost: weeklyCost,
        },
        monthly: {
          count: monthlyLogs?.length || 0,
          cost: monthlyCost,
        },
        media: {
          total: totalAIImages || 0,
          mostUsed: mostUsedImages || [],
        },
      },
    });
  } catch (error) {
    console.error('Error fetching AI images stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

