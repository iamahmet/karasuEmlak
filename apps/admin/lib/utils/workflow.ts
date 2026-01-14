/**
 * Workflow Management Utility
 * İçerik review ve approval sürecini yönetmek için
 */

import { createServiceClient } from "@karasu/lib/supabase/service";

export type ContentType = "article" | "news" | "listing" | "page";

export type WorkflowStatus = "draft" | "review" | "approved" | "rejected" | "published" | "archived" | "changes_requested";

export type ReviewStatus = "pending" | "approved" | "rejected" | "changes_requested";

export interface ContentReview {
  id: string;
  content_type: ContentType;
  content_id: string;
  reviewer_id: string | null;
  assigned_by: string | null;
  status: ReviewStatus;
  notes: string | null;
  review_data: Record<string, unknown> | null;
  created_at: string;
  reviewed_at: string | null;
  completed_at: string | null;
}

export interface AssignReviewParams {
  contentType: ContentType;
  contentId: string;
  reviewerId: string;
  assignedBy: string;
  notes?: string;
}

export interface SubmitReviewParams {
  reviewId: string;
  status: ReviewStatus;
  notes?: string;
  reviewerId: string;
}

/**
 * Assign content for review
 */
export async function assignForReview(params: AssignReviewParams): Promise<ContentReview | null> {
  try {
    const supabase = createServiceClient();

    // Update content status to 'review'
    const tableName = getTableName(params.contentType);
    if (tableName) {
      await supabase
        .from(tableName)
        .update({
          status: "review",
          assigned_reviewer_id: params.reviewerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.contentId);
    }

    // Create review record
    const { data: review, error } = await supabase
      .from("content_reviews")
      .insert({
        content_type: params.contentType,
        content_id: params.contentId,
        reviewer_id: params.reviewerId,
        assigned_by: params.assignedBy,
        status: "pending",
        notes: params.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to assign for review:", error);
      return null;
    }

    return review as ContentReview;
  } catch (error) {
    console.error("Error assigning for review:", error);
    return null;
  }
}

/**
 * Submit review (approve/reject/request changes)
 */
export async function submitReview(params: SubmitReviewParams): Promise<ContentReview | null> {
  try {
    const supabase = createServiceClient();

    // Get review
    const { data: review, error: fetchError } = await supabase
      .from("content_reviews")
      .select("*")
      .eq("id", params.reviewId)
      .single();

    if (fetchError || !review) {
      console.error("Review not found:", fetchError);
      return null;
    }

    // Verify reviewer
    if (review.reviewer_id !== params.reviewerId) {
      console.error("Reviewer mismatch");
      return null;
    }

    // Update review
    const now = new Date().toISOString();
    const { data: updatedReview, error: updateError } = await supabase
      .from("content_reviews")
      .update({
        status: params.status,
        notes: params.notes || review.notes,
        reviewed_at: now,
        completed_at: params.status !== "pending" ? now : null,
      })
      .eq("id", params.reviewId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to submit review:", updateError);
      return null;
    }

    // Update content status based on review
    const tableName = getTableName(review.content_type as ContentType);
    if (tableName) {
      let newStatus: WorkflowStatus = "draft";

      if (params.status === "approved") {
        newStatus = "approved";
      } else if (params.status === "rejected") {
        newStatus = "rejected";
      } else if (params.status === "changes_requested") {
        newStatus = "changes_requested";
      }

      await supabase
        .from(tableName)
        .update({
          status: newStatus,
          review_notes: params.notes || null,
          updated_at: now,
        })
        .eq("id", review.content_id);
    }

    return updatedReview as ContentReview;
  } catch (error) {
    console.error("Error submitting review:", error);
    return null;
  }
}

/**
 * Get pending reviews for a reviewer
 */
export async function getPendingReviews(reviewerId: string): Promise<ContentReview[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("content_reviews")
      .select("*")
      .eq("reviewer_id", reviewerId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to get pending reviews:", error);
      return [];
    }

    return (data || []) as ContentReview[];
  } catch (error) {
    console.error("Error getting pending reviews:", error);
    return [];
  }
}

/**
 * Get reviews for a content item
 */
export async function getContentReviews(
  contentType: ContentType,
  contentId: string
): Promise<ContentReview[]> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("content_reviews")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to get content reviews:", error);
      return [];
    }

    return (data || []) as ContentReview[];
  } catch (error) {
    console.error("Error getting content reviews:", error);
    return [];
  }
}

/**
 * Get current review for content
 */
export async function getCurrentReview(
  contentType: ContentType,
  contentId: string
): Promise<ContentReview | null> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("content_reviews")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No review found
        return null;
      }
      console.error("Failed to get current review:", error);
      return null;
    }

    return data as ContentReview;
  } catch (error) {
    console.error("Error getting current review:", error);
    return null;
  }
}

/**
 * Publish content (after approval)
 */
export async function publishContent(
  contentType: ContentType,
  contentId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    const tableName = getTableName(contentType);
    if (!tableName) {
      return false;
    }

    const { error } = await supabase
      .from(tableName)
      .update({
        status: "published",
        published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", contentId);

    if (error) {
      console.error("Failed to publish content:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error publishing content:", error);
    return false;
  }
}

/**
 * Get content by status
 */
export async function getContentByStatus(
  contentType: ContentType,
  status: WorkflowStatus,
  limit: number = 50
): Promise<unknown[]> {
  try {
    const supabase = createServiceClient();

    const tableName = getTableName(contentType);
    if (!tableName) {
      return [];
    }

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("status", status)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Failed to get content by status:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error getting content by status:", error);
    return [];
  }
}

/**
 * Helper: Get table name from content type
 */
function getTableName(contentType: ContentType): string | null {
  const tableMap: Record<ContentType, string> = {
    article: "articles",
    news: "news",
    listing: "listings",
    page: "pages",
  };

  return tableMap[contentType] || null;
}
