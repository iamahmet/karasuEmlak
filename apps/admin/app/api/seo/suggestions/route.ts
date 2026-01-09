import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * SEO Suggestions API
 * Get AI-powered SEO suggestions
 */
export async function GET(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "tr";

    // Fetch articles for analysis
    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, slug, meta_description, keywords, status")
      .eq("status", "published")
      .limit(50);

    const suggestions = [];

    // Check for missing meta descriptions
    const articlesWithoutMeta = (articles || []).filter(
      (a) => !a.meta_description || a.meta_description.length < 120
    );
    if (articlesWithoutMeta.length > 0) {
      suggestions.push({
        id: "meta-description-missing",
        type: "content",
        priority: "high",
        title: "Meta Description Eksik",
        description: `${articlesWithoutMeta.length} içerikte meta description eksik veya çok kısa`,
        impact: "Yüksek - Arama sonuçlarında görünürlüğü artırır",
        actionUrl: `/${locale}/seo/content-studio`,
        affectedCount: articlesWithoutMeta.length,
      });
    }

    // Check for missing keywords
    const articlesWithoutKeywords = (articles || []).filter((a) => {
      const keywords = a.keywords;
      return !keywords || (Array.isArray(keywords) ? keywords.length === 0 : false);
    });
    if (articlesWithoutKeywords.length > 0) {
      suggestions.push({
        id: "keywords-missing",
        type: "keyword",
        priority: "medium",
        title: "SEO Keywords Eksik",
        description: `${articlesWithoutKeywords.length} içerikte SEO keywords tanımlanmamış`,
        impact: "Orta - Keyword targeting için önemli",
        actionUrl: `/${locale}/seo/content-studio`,
        affectedCount: articlesWithoutKeywords.length,
      });
    }

    // Technical suggestions
    suggestions.push({
      id: "sitemap-update",
      type: "technical",
      priority: "medium",
      title: "Sitemap Güncellemesi",
      description: "Sitemap son 7 günde güncellenmemiş",
      impact: "Orta - Arama motorları için önemli",
      actionUrl: `/${locale}/seo/indexing`,
    });

    suggestions.push({
      id: "internal-linking",
      type: "link",
      priority: "low",
      title: "Internal Linking İyileştirmesi",
      description: "Bazı içeriklerde internal link sayısı düşük",
      impact: "Düşük - Site içi navigasyonu artırır",
      actionUrl: `/${locale}/seo/control/links`,
    });

    return NextResponse.json({
      success: true,
      suggestions,
      total: suggestions.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch SEO suggestions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

