/**
 * Search Analytics API
 * Tracks search queries and results
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/clients';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, resultsCount, filters, timestamp } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // In production, save to analytics table
    // For now, just log
    if (process.env.NODE_ENV === 'development') {
      console.log('[Search Analytics]', {
        query,
        resultsCount,
        filters,
        timestamp,
      });
    }

    let saved = false;
    try {
      const supabase = createServiceClient();
      const parsedTimestamp = timestamp ? new Date(timestamp) : new Date();
      const trackedAt = Number.isNaN(parsedTimestamp.getTime())
        ? new Date().toISOString()
        : parsedTimestamp.toISOString();
      const normalizedResultsCount =
        typeof resultsCount === 'number' && Number.isFinite(resultsCount) ? resultsCount : null;

      const { error } = await supabase.from('search_analytics').insert({
        query: query.trim(),
        results_count: normalizedResultsCount,
        filters: filters ?? null,
        timestamp: trackedAt,
      });

      if (!error) {
        saved = true;
      } else {
        const errorMessage = error.message?.toLowerCase() || '';
        const missingTable =
          error.code === '42P01' ||
          error.code === 'PGRST205' ||
          errorMessage.includes('could not find the table') ||
          errorMessage.includes('relation "search_analytics" does not exist');

        if (!missingTable) {
          console.warn('Failed to persist search analytics:', error);
        }
      }
    } catch (persistError) {
      // Do not break user search flows if analytics infra/env is missing.
      if (process.env.NODE_ENV === 'development') {
        console.warn('Search analytics persistence skipped:', persistError);
      }
    }

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to track search' },
      { status: 500 }
    );
  }
}
