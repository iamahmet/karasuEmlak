import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { createContentVersion } from "@/lib/utils/version-control";
import { requireStaff } from "@/lib/auth/server";

/**
 * Single News Article API
 * GET: Get news article by ID
 * PUT: Update news article
 * DELETE: Soft delete news article
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    console.log(`[News API] Fetching news article with id: ${id}`);

    const { data, error } = await supabase
      .from("news_articles")
      .select("*")
      .eq("id", id)
      .is("deleted_at", null) // Exclude deleted articles
      .single();

    if (error) {
      console.error("[News API] Error fetching news article:", JSON.stringify(error, null, 2));
      
      // If not found, return 404
      if (error.code === "PGRST116" || error.message?.includes("No rows")) {
        return NextResponse.json(
          { success: false, error: "Haber bulunamadı" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn(`[News API] No data returned for id: ${id}`);
      return NextResponse.json(
        { success: false, error: "Haber bulunamadı" },
        { status: 404 }
      );
    }

    console.log(`[News API] Successfully fetched news article: ${data.title}`);

    return NextResponse.json({
      success: true,
      article: data,
    });
  } catch (error: any) {
    console.error("[News API] Get news article error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createServiceClient();

    console.log(`[News API] Updating news article with id: ${id}`);

    // Get current user for version tracking
    let userId: string | null = null;
    try {
      const user = await requireStaff();
      userId = user.id;
    } catch (error) {
      // If auth fails, continue without version tracking
      console.warn("[News API] Could not get user for version tracking");
    }

    // Get current article data for version snapshot
    const { data: currentArticle } = await supabase
      .from("news_articles")
      .select("*")
      .eq("id", id)
      .single();

    // Prepare update data - only include valid fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided and valid
    const allowedFields = [
      'title', 'slug', 'original_summary', 'emlak_analysis',
      'seo_title', 'seo_description', 'seo_keywords',
      'published', 'featured', 'published_at', 'scheduled_publish_at',
      'cover_image', 'og_image', 'source_url', 'source_domain',
      'quality_score', 'quality_issues'
    ];

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from("news_articles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[News API] Error updating news article:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      console.warn(`[News API] No data returned after update for id: ${id}`);
      return NextResponse.json(
        { success: false, error: "Haber güncellenemedi" },
        { status: 500 }
      );
    }

    // Create version snapshot if user is authenticated and content changed
    if (userId && currentArticle) {
      const hasSignificantChanges = 
        currentArticle.title !== data.title ||
        currentArticle.emlak_analysis !== data.emlak_analysis ||
        currentArticle.original_summary !== data.original_summary;

      if (hasSignificantChanges) {
        try {
          await createContentVersion({
            contentType: "news",
            contentId: id,
            data: data as Record<string, unknown>,
            userId,
            changeNote: body.changeNote || "İçerik güncellendi",
          });
        } catch (versionError) {
          // Don't fail the update if version creation fails
          console.error("[News API] Error creating version:", versionError);
        }
      }
    }

    console.log(`[News API] Successfully updated news article: ${data.title}`);

    // Automatically generate images from content suggestions (async, don't wait)
    const contentFields = ['emlak_analysis', 'content'];
    for (const field of contentFields) {
      const contentText = data[field as keyof typeof data] as string;
      if (contentText) {
        const { extractImageSuggestions } = await import('@/lib/utils/extract-image-suggestions');
        const suggestions = extractImageSuggestions(contentText);
        
        if (suggestions.length > 0) {
          // Trigger image generation asynchronously (don't block response)
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
          fetch(`${baseUrl}/api/news/${id}/generate-images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ field }),
          }).catch(err => {
            console.error(`[News API] Auto image generation failed for ${field}:`, err);
          });
          break; // Only process first field with suggestions
        }
      }
    }

    return NextResponse.json({
      success: true,
      article: data,
    });
  } catch (error: any) {
    console.error("[News API] Update news article error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("news_articles")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error deleting news article:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Delete news article error:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" },
      { status: 500 }
    );
  }
}

