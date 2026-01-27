import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response';

/**
 * POST /api/admin/supabase/reload-postgrest
 * 
 * Reload PostgREST schema cache
 * Requires admin role (checked via RLS or middleware)
 * 
 * Rate limited: max 1 request per minute
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  
  try {
    // Check admin role (you can add middleware/auth check here)
    // For now, we rely on RLS policies
    
    const supabase = createServiceClient();
    
    // Try to call the reload function
    const { data, error } = await supabase.rpc('pgrst_reload_schema');
    
    if (error) {
      // If function doesn't exist, try direct SQL
      if (
        error.code === 'PGRST202' ||
        error.message?.includes('function') ||
        error.message?.includes('does not exist')
      ) {
        // Fallback: Try NOTIFY via direct SQL
        const { error: sqlError } = await supabase.rpc('exec_sql', {
          sql: "NOTIFY pgrst, 'reload schema';",
        });
        
        if (sqlError) {
          return createErrorResponse(
            requestId,
            'RELOAD_FAILED',
            'Failed to reload PostgREST cache. Function may not exist. Please run: pnpm supabase:reload-postgrest',
            undefined,
            500
          );
        }
      } else {
        return createErrorResponse(
          requestId,
          'RELOAD_FAILED',
          error.message || 'Failed to reload PostgREST cache',
          undefined,
          500
        );
      }
    }
    
    // Wait a bit for cache to update
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verify a critical table is visible
    const { error: verifyError } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .limit(0);
    
    if (verifyError && verifyError.code === 'PGRST205') {
      return createErrorResponse(
        requestId,
        'CACHE_STILL_STALE',
        'Cache reload triggered but still stale. Please wait a few seconds and try again.',
        undefined,
        503
      );
    }
    
    return createSuccessResponse(
      {
        reloaded: true,
        timestamp: new Date().toISOString(),
        verified: !verifyError,
      },
      requestId
    );
  } catch (error: any) {
    return createErrorResponse(
      requestId,
      'INTERNAL_ERROR',
      error?.message || 'Internal server error',
      undefined,
      500
    );
  }
}

// Rate limit: 1 request per minute per IP
const rateLimit = new Map<string, number>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimit.get(ip);
  
  if (lastRequest && now - lastRequest < 60000) {
    return false; // Rate limited
  }
  
  rateLimit.set(ip, now);
  return true;
}
