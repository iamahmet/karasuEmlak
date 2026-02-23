import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";
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
    console.error(`[${requestId}] Error fetching article:`, error);
    
    // Handle schema cache stale errors
    if (
      error.code === "PGRST205" ||
      error.code === "PGRST202" ||
      error.message?.toLowerCase().includes("schema cache") ||
      error.message?.toLowerCase().includes("not found in the schema cache")
    ) {
      return createErrorResponse(
        requestId,
        "POSTGREST_SCHEMA_STALE",
        "PostgREST schema cache is stale. Run: pnpm supabase:reload-postgrest",
        {
          code: error.code,
          suggestion: "Run: pnpm supabase:reload-postgrest",
        },
        503
      );
    }
    
    // Handle not found errors
    if (error.code === "PGRST116" || error.message?.includes("No rows")) {
      return createErrorResponse(requestId, "NOT_FOUND", "Makale bulunamadı", undefined, 404);
    }
    
    // Log other errors for debugging
    console.error(`[${requestId}] Unexpected error fetching article:`, error);
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

  // Allow partial updates (e.g., only content from improvement page)
  // If only content is provided, fetch existing article data
  if (!content && !title && !slug) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "En az bir alan güncellenmelidir",
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

    // Check if article exists and get current data
    const { data: existing, error: fetchError } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return createErrorResponse(requestId, "NOT_FOUND", "Makale bulunamadı", undefined, 404);
    }

    // Use existing values if not provided (for partial updates)
    const finalTitle = title || existing.title;
    const finalSlug = slug || existing.slug;
    const finalContent = content || existing.content || "";
    const finalExcerpt = excerpt !== undefined ? excerpt : existing.excerpt;
    const finalAuthor = author || existing.author || "Karasu Emlak";

    // Calculate reading time only if content changed
    // If content is provided, recalculate; otherwise use existing or calculate from existing content
    let readingTime: number;
    if (content) {
      // Content was updated, recalculate
      readingTime = calculateReadingTime(finalContent);
    } else {
      // Content not updated, use existing reading_time or calculate from existing content
      readingTime = existing.reading_time || calculateReadingTime(existing.content || "");
    }

    const updateData: any = {
      title: finalTitle,
      slug: finalSlug,
      excerpt: finalExcerpt,
      content: finalContent,
      featured_image: featuredImage !== undefined ? featuredImage : existing.featured_image,
      category_id: finalCategoryId !== undefined ? finalCategoryId : existing.category_id,
      category_slug: categorySlug !== undefined ? categorySlug : existing.category_slug,
      author: finalAuthor,
      reading_time: readingTime,
      updated_at: new Date().toISOString(),
    };

    // Only update status fields if provided
    if (isPublished !== undefined) {
      updateData.status = isPublished ? 'published' : 'draft';
      updateData.is_published = isPublished;
    } else {
      updateData.status = existing.status || 'draft';
      updateData.is_published = existing.is_published || false;
    }

    if (isFeatured !== undefined) {
      updateData.is_featured = isFeatured;
    } else {
      updateData.is_featured = existing.is_featured || false;
    }

    if (isBreaking !== undefined) {
      updateData.is_breaking = isBreaking;
    } else {
      updateData.is_breaking = existing.is_breaking || false;
    }

    if (metaDescription !== undefined) {
      updateData.meta_description = metaDescription;
    } else {
      updateData.meta_description = existing.meta_description;
    }

    if (seoKeywords !== undefined) {
      updateData.seo_keywords = Array.isArray(seoKeywords) ? seoKeywords.join(", ") : seoKeywords;
    } else {
      updateData.seo_keywords = existing.seo_keywords;
    }

    // Set published_at if publishing for the first time
    if (isPublished !== undefined && isPublished && !existing.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    // Update article with retry logic for 503/schema cache errors
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
      
      // Detect PostgREST schema cache staleness (PGRST205, PGRST202)
      const isSchemaCacheStale = 
        error.code === "PGRST205" ||
        error.code === "PGRST202" ||
        error.message?.toLowerCase().includes("schema cache") ||
        error.message?.toLowerCase().includes("schema_cache") ||
        error.message?.toLowerCase().includes("could not find the table") ||
        error.message?.toLowerCase().includes("not found in the schema cache");

      // Detect connection/service unavailable errors
      const isServiceUnavailable = 
        error.code === "PGRST301" ||
        error.code === "PGRST301" ||
        error.message?.includes("503") ||
        error.message?.includes("Service Unavailable") ||
        error.message?.includes("connection") ||
        error.message?.includes("timeout") ||
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("ETIMEDOUT");

      // If schema cache stale or service unavailable, retry with exponential backoff
      if (isSchemaCacheStale || isServiceUnavailable) {
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000); // Exponential backoff, max 5s
          const errorType = isSchemaCacheStale ? "schema cache stale" : "service unavailable";
          console.warn(`[${requestId}] Article update failed (${errorType}), retrying (${retryCount}/${maxRetries}) after ${delay}ms...`, {
            code: error.code,
            message: error.message,
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      // For schema cache stale errors after retries, return specific error
      if (isSchemaCacheStale) {
        console.error(`[${requestId}] PostgREST schema cache stale after ${maxRetries} retries:`, {
          code: error.code,
          message: error.message,
        });
        return createErrorResponse(
          requestId,
          "POSTGREST_SCHEMA_STALE",
          "PostgREST schema cache is stale. Run: pnpm supabase:reload-postgrest",
          {
            code: error.code,
            message: error.message,
            suggestion: "Run: pnpm supabase:reload-postgrest or click 'Reload Schema Cache' button",
            retries: retryCount,
          },
          503
        );
      }
      
      // For other errors, throw immediately
      console.error(`[${requestId}] Article update failed with non-retryable error:`, error);
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

    // Note: error check removed - if we reach here, update was successful
    // The error variable from retry loop is already handled above

    // Notify search engines when publishing (async, don't wait)
    if (isPublished && data?.slug) {
      const webUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
      const blogPath = `/blog/${data.slug}`;
      fetch(`${webUrl.replace(/\/$/, "")}/api/seo/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [blogPath] }),
      }).catch((err) => console.warn("[Articles API] SEO notify failed:", err));
    }

    // Automatically generate images from content suggestions (async, don't wait)
    if (content && data?.id) {
      const { extractImageSuggestions } = await import('@/lib/utils/extract-image-suggestions');
      const suggestions = extractImageSuggestions(content);
      
      if (suggestions.length > 0) {
        // Trigger image generation asynchronously (don't block response)
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        fetch(`${baseUrl}/api/articles/${data.id}/generate-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ field: 'content' }),
        }).catch(err => {
          console.error('[Articles API] Auto image generation failed:', err);
        });
      }
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
function calculateReadingTime(content: string | null | undefined): number {
  if (!content || typeof content !== 'string') {
    return 1; // Default to 1 minute for empty content
  }
  
  const wordsPerMinute = 200;
  // Remove HTML tags and count words
  const textContent = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = textContent.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute)); // Minimum 1 minute
}

