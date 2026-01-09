/**
 * Rate Limiting Utility
 * Uses Upstash Redis for distributed rate limiting
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

interface RateLimitOptions {
  identifier: string;
  limit?: number;
  window?: string; // e.g., "10 s", "1 m", "1 h"
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Fallback in-memory rate limiter for development
class InMemoryRateLimiter {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  async limit(identifier: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const key = identifier;
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      // New window
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: now + windowMs,
      };
    }

    if (record.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: record.resetAt,
      };
    }

    record.count++;
    return {
      success: true,
      limit,
      remaining: limit - record.count,
      reset: record.resetAt,
    };
  }
}

const inMemoryLimiter = new InMemoryRateLimiter();

/**
 * Rate limit check
 * 
 * @param options - Rate limit options
 * @returns Rate limit result
 */
export async function rateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { identifier, limit = 10, window = '10 s' } = options;

  // Parse window string (e.g., "10 s" -> 10000ms)
  const windowMs = parseWindow(window);

  // Try to use Upstash Redis if available
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit');
      const { Redis } = await import('@upstash/redis');

      // Parse window string to Duration format for Upstash
      const windowMatch = window.match(/^(\d+)\s*(s|m|h|d)$/);
      if (!windowMatch) {
        throw new Error(`Invalid window format: ${window}`);
      }
      const windowValue = parseInt(windowMatch[1], 10);
      const windowUnit = windowMatch[2];
      
      // Convert to Duration object
      const duration: { seconds?: number; minutes?: number; hours?: number; days?: number } = {};
      if (windowUnit === 's') duration.seconds = windowValue;
      else if (windowUnit === 'm') duration.minutes = windowValue;
      else if (windowUnit === 'h') duration.hours = windowValue;
      else if (windowUnit === 'd') duration.days = windowValue;

      const ratelimit = new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(limit, duration as any),
      });

      const result = await ratelimit.limit(identifier);
      return {
        success: result.success,
        limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      console.warn('Upstash Redis not available, falling back to in-memory limiter:', error);
    }
  }

  // Fallback to in-memory limiter
  return inMemoryLimiter.limit(identifier, limit, windowMs);
}

/**
 * Parse window string to milliseconds
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid window format: ${window}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

/**
 * Rate limit wrapper for Next.js API routes
 */
export async function withRateLimit(
  request: NextRequest,
  options: { identifier: string; limit?: number; window?: string }
): Promise<{ success: boolean; response?: NextResponse; remaining?: number }> {
  const { identifier, limit = 10, window = '10 s' } = options;
  
  // Get client IP
  const clientIP = getClientIP(request);
  const rateLimitKey = `${identifier}:${clientIP}`;

  const result = await rateLimit({
    identifier: rateLimitKey,
    limit,
    window,
  });

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      ),
    };
  }

  return {
    success: true,
    remaining: result.remaining,
  };
}
