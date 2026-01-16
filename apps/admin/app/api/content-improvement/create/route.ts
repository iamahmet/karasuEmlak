import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * POST /api/content-improvement/create
 * Create an improvement record (for cases where improvement was done but not tracked)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      content_type,
      content_id,
      field = 'content',
      original_content,
      improved_content,
      quality_analysis,
      improvement_result,
      applied = false,
    } = body;

    if (!content_type || !content_id || !original_content || !improved_content) {
      return NextResponse.json(
        { error: 'content_type, content_id, original_content, and improved_content are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Create improvement record
    const { data, error } = await supabase
      .from('content_ai_improvements')
      .insert({
        content_type,
        content_id,
        field,
        status: applied ? 'completed' : 'pending',
        original_content,
        improved_content,
        quality_analysis: quality_analysis || null,
        improvement_result: improvement_result || null,
        progress: applied ? 100 : 0,
        progress_message: applied ? 'Uygulandı' : 'Beklemede',
        applied: applied || false,
        applied_at: applied ? new Date().toISOString() : null,
        completed_at: applied ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return success anyway (graceful degradation)
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ success: true, message: 'Table not found, skipping' });
      }
      
      console.error('[Create Improvement] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create improvement record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      improvement: data,
    });
  } catch (error: any) {
    console.error('[Create Improvement] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
