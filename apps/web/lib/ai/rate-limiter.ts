/**
 * Rate Limiter for AI Image Generation
 * Prevents excessive API calls and cost overruns
 */

import { createServiceClient } from '@karasu/lib/supabase/service';

export interface RateLimitConfig {
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  maxCostPerDay: number; // in USD
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerHour: 20,
  maxRequestsPerDay: 100,
  maxCostPerDay: 10.0, // $10 per day max
};

// DALL-E 3 pricing (as of 2024)
const DALL_E_3_PRICING = {
  '1024x1024': { standard: 0.04, hd: 0.08 },
  '1792x1024': { standard: 0.08, hd: 0.12 },
  '1024x1792': { standard: 0.08, hd: 0.12 },
};

/**
 * Calculate cost for image generation
 */
export function calculateImageCost(
  size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024',
  quality: 'standard' | 'hd' = 'hd'
): number {
  return DALL_E_3_PRICING[size][quality];
}

/**
 * Check rate limits
 */
export async function checkRateLimit(
  config: RateLimitConfig = DEFAULT_CONFIG
): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
  const supabase = createServiceClient();
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  try {
    // Check hourly limit
    const { count: hourlyCount, error: hourlyError } = await supabase
      .from('ai_image_generation_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo.toISOString());

    if (hourlyError) {
      console.error('Rate limit check error:', hourlyError);
      return { allowed: true }; // Allow on error
    }

    if (hourlyCount && hourlyCount >= config.maxRequestsPerHour) {
      return {
        allowed: false,
        reason: `Hourly limit exceeded (${config.maxRequestsPerHour} requests/hour)`,
        retryAfter: 3600, // 1 hour in seconds
      };
    }

    // Check daily limit
    const { count: dailyCount, error: dailyError } = await supabase
      .from('ai_image_generation_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneDayAgo.toISOString());

    if (dailyError) {
      console.error('Rate limit check error:', dailyError);
      return { allowed: true }; // Allow on error
    }

    if (dailyCount && dailyCount >= config.maxRequestsPerDay) {
      return {
        allowed: false,
        reason: `Daily limit exceeded (${config.maxRequestsPerDay} requests/day)`,
        retryAfter: 86400, // 24 hours in seconds
      };
    }

    // Check daily cost
    const { data: dailyLogs } = await supabase
      .from('ai_image_generation_logs')
      .select('cost')
      .gte('created_at', oneDayAgo.toISOString());

    const dailyCost = dailyLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;

    if (dailyCost >= config.maxCostPerDay) {
      return {
        allowed: false,
        reason: `Daily cost limit exceeded ($${config.maxCostPerDay}/day)`,
        retryAfter: 86400,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow on error to prevent blocking
    return { allowed: true };
  }
}

/**
 * Log image generation for rate limiting and cost tracking
 */
export async function logImageGeneration(params: {
  type: string;
  size: string;
  quality: string;
  cost: number;
  success: boolean;
  error?: string;
  mediaAssetId?: string;
}): Promise<void> {
  const supabase = createServiceClient();

  try {
    await supabase
      .from('ai_image_generation_logs')
      .insert({
        generation_type: params.type,
        image_size: params.size,
        image_quality: params.quality,
        cost: params.cost,
        success: params.success,
        error_message: params.error,
        media_asset_id: params.mediaAssetId,
      });
  } catch (error) {
    console.error('Failed to log image generation:', error);
    // Don't throw - logging failure shouldn't break the flow
  }
}

