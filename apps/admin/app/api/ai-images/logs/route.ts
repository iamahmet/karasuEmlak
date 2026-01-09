/**
 * AI Images Logs API
 * Returns generation logs with pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const success = searchParams.get('success');
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();

    let query = supabase
      .from('ai_image_generation_logs')
      .select('*, media_assets(id, cloudinary_public_id, cloudinary_secure_url, title)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('generation_type', type);
    }

    if (success !== null) {
      query = query.eq('success', success === 'true');
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      logs: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching AI images logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

