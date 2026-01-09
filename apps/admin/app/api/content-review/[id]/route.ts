import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Determine table based on ID pattern or try both
    // For simplicity, try articles first, then news_articles
    let updateError = null;

    // Try articles table
    const { error: articleError } = await supabase
      .from('articles')
      .update({
        review_status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
        // reviewed_by would be set from auth context in production
      })
      .eq('id', id);

    if (articleError) {
      // Try news_articles table
      const { error: newsError } = await supabase
        .from('news_articles')
        .update({
          review_status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: notes || null,
        })
        .eq('id', id);

      if (newsError) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? 'Content approved' : 'Content rejected',
    });
  } catch (error: any) {
    console.error('Error reviewing content:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
