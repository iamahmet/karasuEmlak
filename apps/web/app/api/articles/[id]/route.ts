import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";
// import { requireStaff } from "@/lib/auth/server";

/**
 * Article API - Get/Update/Delete by ID
 * Admin API: Uses service role to bypass RLS
 */

async function handleGet(
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  if (!context?.params) {
    return createErrorResponse(requestId, "BAD_REQUEST", "Missing params", undefined, 400);
  }
  const { id } = await context.params;

  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();

  // Fetch article without category join to avoid PGRST200 error
  const { data: article, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching article:", error);
    if (error.code === "PGRST116" || error.message?.includes("No rows")) {
      return createErrorResponse(requestId, "NOT_FOUND", "Makale bulunamadı", undefined, 404);
    }
    // Log other errors for debugging
    console.error("Unexpected error fetching article:", error);
    throw error;
  }

  if (!article) {
    return createErrorResponse(requestId, "NOT_FOUND", "Makale bulunamadı", undefined, 404);
  }

  // Fetch category separately if category_id exists
  let category = null;
  if (article.category_id) {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("id, name, slug, description")
      .eq("id", article.category_id)
      .single();
    category = categoryData;
  }

  // Attach category to article
  const articleWithCategory = {
    ...article,
    category: category ? {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description
    } : undefined
  };

  return createSuccessResponse(requestId, { article: articleWithCategory });
}

export const GET = withErrorHandling(handleGet);

async function handlePut(
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  if (!context?.params) {
    return createErrorResponse(requestId, "BAD_REQUEST", "Missing params", undefined, 400);
  }
  const { id } = await context.params;
  const body = await request.json();
  const {
    title,
    slug,
    excerpt,
    content,
    categorySlug,
    categoryId,
    author,
    featuredImage,
    isPublished,
    isFeatured,
    isBreaking,
    metaDescription,
    seoKeywords,
  } = body;

  if (!title || !slug || !content) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Başlık, slug ve içerik gereklidir",
      undefined,
      400
    );
  }

  // Admin API: ALWAYS use service role client
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error(`[${requestId}] Failed to create Supabase service client:`, error);
    return createErrorResponse(
      requestId,
      "SUPABASE_CONFIG_ERROR",
      "Supabase yapılandırması eksik. Lütfen SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY environment variable'larını kontrol edin.",
      error.message,
      500
    );
  }

    // Find category by slug or ID
    let finalCategoryId = categoryId || null;
    if (categorySlug && !finalCategoryId) {
      const { data: category } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .single();
      
      if (category) {
        finalCategoryId = category.id;
      }
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    // Check if article exists
    const { data: existing } = await supabase
      .from("articles")
      .select("id, published_at")
      .eq("id", id)
      .single();

    if (!existing) {
      return createErrorResponse(requestId, "NOT_FOUND", "Makale bulunamadı", undefined, 404);
    }

    const updateData: any = {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      featured_image: featuredImage || null,
      category_id: finalCategoryId,
      category_slug: categorySlug || null,
      author: author || "Karasu Emlak",
      reading_time: readingTime,
      status: isPublished ? 'published' : 'draft', // Web app uses 'status' column
      is_published: isPublished || false, // Keep for backward compatibility
      is_featured: isFeatured || false,
      is_breaking: isBreaking || false,
      meta_description: metaDescription || null,
      seo_keywords: seoKeywords ? (Array.isArray(seoKeywords) ? seoKeywords.join(", ") : seoKeywords) : null,
      updated_at: new Date().toISOString(),
    };

    // Set published_at if publishing for the first time
    if (isPublished && !existing.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    // Update article with retry logic for 503 errors
    let updatedArticle;
    let error;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      const result = await supabase
        .from("articles")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();
      
      updatedArticle = result.data;
      error = result.error;
      
      // If no error, break
      if (!error) {
        break;
      }
      
      // If 503 or connection error, retry with exponential backoff
      if (
        error.code === "PGRST301" || // Service unavailable
        error.message?.includes("503") ||
        error.message?.includes("Service Unavailable") ||
        error.message?.includes("connection") ||
        error.message?.includes("timeout")
      ) {
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000); // Exponential backoff, max 5s
          console.warn(`[${requestId}] Article update failed with 503, retrying (${retryCount}/${maxRetries}) after ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // For other errors, throw immediately
      throw error;
    }

    if (error) {
      // After all retries failed
      console.error(`[${requestId}] Article update failed after ${maxRetries} retries:`, error);
      return createErrorResponse(
        requestId,
        "SERVICE_UNAVAILABLE",
        "Veritabanı bağlantısı kurulamadı. Lütfen birkaç saniye sonra tekrar deneyin.",
        error.message,
        503
      );
    }

    // Fetch category separately if category_id exists
    let category = null;
    if (updatedArticle?.category_id) {
      const { data: categoryData } = await supabase
        .from("categories")
        .select("id, name, slug, description")
        .eq("id", updatedArticle.category_id)
        .single();
      category = categoryData;
    }

    // Attach category to article
    const data = {
      ...updatedArticle,
      category: category ? {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      } : undefined
    };

    if (error) {
      throw error;
    }

    return createSuccessResponse(requestId, { article: data });
}

export const PUT = withErrorHandling(handlePut);

async function handleDelete(
  _request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(_request);
  if (!context?.params) {
    return createErrorResponse(requestId, "BAD_REQUEST", "Missing params", undefined, 400);
  }
  const { id } = await context.params;

    // Use service role client for admin operations
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse(requestId, { success: true });
}

export const DELETE = withErrorHandling(handleDelete);

/**
 * Calculate reading time in minutes
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  // Remove HTML tags and count words
  const textContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = textContent.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute)); // Minimum 1 minute
}

