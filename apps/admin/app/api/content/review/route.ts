/**
 * Content Review API
 * POST /api/content/review - Submit content for review
 * POST /api/content/approve - Approve content
 * POST /api/content/reject - Reject content
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { checkContentQuality } from '@karasu/lib/content/quality-gate';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/lib/api/error-handler';
import { getRequestId } from '@/lib/api/middleware';
// import { requireStaff } from '@/lib/auth/server';

type ContentType = 'article' | 'news';

interface ReviewRequest {
  contentType: ContentType;
  contentId: string;
  notes?: string;
}

/**
 * Submit content for review
 */
async function handleSubmitReview(request: NextRequest) {
  const requestId = getRequestId(request);
  // const user = await requireStaff();
  const supabase = createServiceClient();
  
  const body: ReviewRequest = await request.json();
  const { contentType, contentId, notes } = body;

  if (!contentType || !contentId) {
    return createErrorResponse(
      requestId,
      'VALIDATION_ERROR',
      'contentType and contentId are required',
      undefined,
      400
    );
  }

  const tableName = contentType === 'article' ? 'articles' : 'news_articles';

  // Fetch content
  const { data: content, error: fetchError } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', contentId)
    .single();

  if (fetchError || !content) {
    return createErrorResponse(
      requestId,
      'NOT_FOUND',
      'Content not found',
      undefined,
      404
    );
  }

  // Run quality check
  const qualityCheck = checkContentQuality({
    title: content.title || '',
    content: content.content || content.original_summary || content.description_long || '',
    excerpt: content.excerpt || content.original_summary || '',
    meta_title: content.seo_title || content.title || '',
    meta_description: content.seo_description || content.meta_description || '',
    slug: content.slug || '',
  });

  // Update content with review status and quality score
  const { data: updated, error: updateError } = await supabase
    .from(tableName)
    .update({
      review_status: 'pending_review',
      quality_score: qualityCheck.score,
      quality_issues: qualityCheck.issues,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId)
    .select()
    .single();

  if (updateError) {
    return createErrorResponse(
      requestId,
      'UPDATE_ERROR',
      'Failed to submit for review',
      updateError,
      500
    );
  }

  return createSuccessResponse(requestId, {
    content: updated,
    qualityScore: qualityCheck.score,
    qualityPassed: qualityCheck.passed,
    issues: qualityCheck.issues,
  });
}

/**
 * Approve content
 */
async function handleApprove(request: NextRequest) {
  const requestId = getRequestId(request);
  // const user = await requireStaff();
  const supabase = createServiceClient();
  
  const body: ReviewRequest = await request.json();
  const { contentType, contentId, notes } = body;

  if (!contentType || !contentId) {
    return createErrorResponse(
      requestId,
      'VALIDATION_ERROR',
      'contentType and contentId are required',
      undefined,
      400
    );
  }

  const tableName = contentType === 'article' ? 'articles' : 'news_articles';

  // Update content
  const updateData: any = {
    review_status: 'approved',
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (notes) {
    updateData.review_notes = notes;
  }

  // If quality score is low, don't auto-publish
  const { data: content } = await supabase
    .from(tableName)
    .select('quality_score')
    .eq('id', contentId)
    .single();

  // Only auto-publish if quality score >= 70
  const { data: contentData } = await supabase
    .from(tableName)
    .select('quality_score, published_at')
    .eq('id', contentId)
    .single();

  if (contentData?.quality_score >= 70) {
    if (tableName === 'articles') {
      updateData.status = 'published';
      updateData.is_published = true;
      if (!contentData?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    } else {
      updateData.published = true;
      if (!contentData?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from(tableName)
    .update(updateData)
    .eq('id', contentId)
    .select()
    .single();

  if (updateError) {
    return createErrorResponse(
      requestId,
      'UPDATE_ERROR',
      'Failed to approve content',
      updateError,
      500
    );
  }

  return createSuccessResponse(requestId, {
    content: updated,
    published: contentData?.quality_score >= 70,
  });
}

/**
 * Reject content
 */
async function handleReject(request: NextRequest) {
  const requestId = getRequestId(request);
  // const user = await requireStaff();
  const supabase = createServiceClient();
  
  const body: ReviewRequest & { reason: string } = await request.json();
  const { contentType, contentId, reason, notes } = body;

  if (!contentType || !contentId || !reason) {
    return createErrorResponse(
      requestId,
      'VALIDATION_ERROR',
      'contentType, contentId, and reason are required',
      undefined,
      400
    );
  }

  const tableName = contentType === 'article' ? 'articles' : 'news_articles';

  const reviewNotes = notes ? `${reason}\n\n${notes}` : reason;

  const { data: updated, error: updateError } = await supabase
    .from(tableName)
    .update({
      review_status: 'rejected',
      review_notes: reviewNotes,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId)
    .select()
    .single();

  if (updateError) {
    return createErrorResponse(
      requestId,
      'UPDATE_ERROR',
      'Failed to reject content',
      updateError,
      500
    );
  }

  return createSuccessResponse(requestId, { content: updated });
}

/**
 * Get pending reviews
 */
async function handleGetPending(request: NextRequest) {
  const requestId = getRequestId(request);
  // const user = await requireStaff();
  const supabase = createServiceClient();
  
  const searchParams = request.nextUrl.searchParams;
  const contentType = searchParams.get('type') as ContentType | null;
  const limit = parseInt(searchParams.get('limit') || '10');

  const results: any[] = [];

  if (!contentType || contentType === 'article') {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, title, slug, review_status, quality_score, created_at, updated_at')
      .eq('review_status', 'pending_review')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (articles) {
      results.push(...articles.map(a => ({ ...a, contentType: 'article' })));
    }
  }

  if (!contentType || contentType === 'news') {
    const { data: news } = await supabase
      .from('news_articles')
      .select('id, title, slug, review_status, quality_score, created_at, updated_at')
      .eq('review_status', 'pending_review')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (news) {
      results.push(...news.map(n => ({ ...n, contentType: 'news' })));
    }
  }

  return createSuccessResponse(requestId, {
    pending: results.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ),
    count: results.length,
  });
}

export const POST = withErrorHandling(async (request: NextRequest) => {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'approve') {
    return handleApprove(request);
  } else if (action === 'reject') {
    return handleReject(request);
  } else {
    return handleSubmitReview(request);
  }
});

export const GET = withErrorHandling(handleGetPending);
