import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";
// import { requireStaff } from "@/lib/auth/server";

/**
 * Articles API
 * Create and manage articles directly in articles table
 * This provides a simpler workflow than content_items -> articles
 */

async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const limit = parseInt(searchParams.get("limit") || "100");
  const offset = parseInt(searchParams.get("offset") || "0");

  // Admin API: ALWAYS use service role client
  // RLS is NOT for admin logic - service role bypasses RLS
  const supabase = createServiceClient();

  let result;
  if (slug) {
    result = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .single();
  } else {
    result = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
  }

  const { data, error } = result;

  if (error) {
    // If table doesn't exist, return empty array
    if (error.code === "PGRST116" || error.code === "42P01") {
      return createSuccessResponse(requestId, { articles: [], total: 0 });
    }
    throw error;
  }

  return createSuccessResponse(requestId, {
    articles: slug ? [data] : (data || []),
    total: slug ? 1 : (data?.length || 0),
  });
}

export const GET = withErrorHandling(handleGet);

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  // Development mode: Skip auth check
  // await requireStaff();

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
  // RLS is NOT for admin logic - service role bypasses RLS
  const supabase = createServiceClient();

  // Get current user
  let userId;
  if (process.env.NODE_ENV === "development") {
    const { data: mockUser } = await supabase.auth.getUser();
    userId = mockUser?.user?.id || null;
  } else {
    // const user = await requireStaff();
    // userId = user.id;
    userId = null;
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

  // Check if article with same slug exists (for updates)
  const { data: existing } = await supabase
    .from("articles")
    .select("id, published_at")
    .eq("slug", slug)
    .maybeSingle();

  const articleData: any = {
    title,
    slug,
    excerpt: excerpt || null,
    content,
    featured_image: featuredImage || null,
    category_id: finalCategoryId,
    category_slug: categorySlug || null,
    author_id: userId,
    author: author || "Karasu Emlak",
    views: 0,
    status: isPublished ? 'published' : 'draft',
    meta_description: metaDescription || null,
    keywords: seoKeywords ? (Array.isArray(seoKeywords) ? seoKeywords : seoKeywords.split(",").map((k: string) => k.trim())) : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Set published_at if publishing
  if (isPublished) {
    articleData.published_at = new Date().toISOString();
  }

  let article;
  if (existing) {
    // Update existing article
    const { data: updated, error: updateError } = await supabase
      .from("articles")
      .update(articleData)
      .eq("id", existing.id)
      .select(`
        *,
        category:categories(id, name, slug, description)
      `)
      .single();

    if (updateError) {
      throw updateError;
    }

    article = updated;
  } else {
    // Create new article
    const { data: created, error: insertError } = await supabase
      .from("articles")
      .insert(articleData)
      .select(`
        *,
        category:categories(id, name, slug, description)
      `)
      .single();

    if (insertError) {
      throw insertError;
    }

    article = created;
  }

  return createSuccessResponse(requestId, { article });
}

export const POST = withErrorHandling(handlePost);

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
