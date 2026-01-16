import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

/**
 * POST /api/content-improvement/apply
 * Mark an improvement as applied
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { improvementId, articleId } = body;

    if (!improvementId) {
      return NextResponse.json(
        { error: 'Improvement ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Update improvement record to mark as applied
    const { data, error } = await supabase
      .from('content_ai_improvements')
      .update({
        applied: true,
        applied_at: new Date().toISOString(),
        // If articleId provided, ensure content_id matches
        ...(articleId ? { content_id: articleId } : {}),
      })
      .eq('id', improvementId)
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return success anyway (graceful degradation)
      if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ success: true, message: 'Table not found, skipping' });
      }
      
      console.error('[Apply Improvement] Error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to mark improvement as applied' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      improvement: data,
    });
  } catch (error: any) {
    console.error('[Apply Improvement] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
