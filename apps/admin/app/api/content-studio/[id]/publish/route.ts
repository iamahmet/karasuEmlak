import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { canPublishContent, checkContentQuality } from "@karasu/lib/content/quality-gate";
import { logAuditEvent } from "@karasu/lib/audit";
import { publishContent } from "@karasu/lib/content/publishing";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";

/**
 * Content Studio Publish API
 * Admin API: Uses service role to bypass RLS
 */
async function handlePost(
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  if (!context?.params) {
    return createErrorResponse(requestId, "BAD_REQUEST", "Missing params", undefined, 400);
  }
  // Development mode: Skip auth check
  // await requireStaff();
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();
  const { id } = await context.params;
  const body = await request.json();
  const { locale } = body;

  // Get content item
  const { data: contentItem } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .single();

  if (!contentItem) {
    return createErrorResponse(
      requestId,
      "RESOURCE_NOT_FOUND",
      "Content not found",
      undefined,
      404
    );
  }

  // Get content locale data
  const { data: contentLocale } = await supabase
    .from("content_locales")
    .select("*")
    .eq("content_item_id", id)
    .eq("locale", locale)
    .single();

  if (!contentLocale) {
    return createErrorResponse(
      requestId,
      "RESOURCE_NOT_FOUND",
      "Content locale not found.",
      undefined,
      404
    );
  }

  // Check if can publish
  const canPublish = canPublishContent({
    title: contentLocale.title,
    content: contentLocale.content,
    slug: contentItem.slug,
  });
  
  if (!canPublish) {
    // Get quality check for detailed error
    const qualityCheck = checkContentQuality({
      title: contentLocale.title,
      content: contentLocale.content,
      excerpt: contentLocale.excerpt,
      meta_title: contentLocale.meta_title,
      meta_description: contentLocale.meta_description,
      slug: contentItem.slug,
    });
    
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Content does not meet quality requirements for publishing",
      { qualityCheck },
      400
    );
  }

  // Get current user for publishing
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return createErrorResponse(
      requestId,
      "UNAUTHORIZED",
      "Unauthorized",
      undefined,
      401
    );
  }

  // Publish content item
  await publishContent(id, user.id);

  // Update content locale status
  await supabase
    .from("content_locales")
    .update({ translation_status: "published" })
    .eq("content_item_id", id)
    .eq("locale", locale);

  // Log audit event
  await logAuditEvent({
    type: 'content.published',
    user_id: user.id,
    resource_type: 'content_item',
    resource_id: id,
    metadata: { locale, contentItemId: id },
  });

  // Sync published content to web app (invalidate cache)
  try {
    const { syncToWebApp } = await import("@/lib/web-app/sync");
    await syncToWebApp({ 
      type: 'content', 
      resourceId: id, 
      locale 
    });
  } catch (error) {
    // Non-critical error, log but don't fail
  }

  return createSuccessResponse(requestId, {
    contentItemId: id,
    message: "Content published successfully",
  });
}

export const POST = withErrorHandling(handlePost);
