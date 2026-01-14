import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface SEOIssue {
  type: "error" | "warning" | "info";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  fix?: string;
}

interface SEOMetrics {
  titleLength: number;
  metaDescriptionLength: number;
  h1Count: number;
  h2Count: number;
  h3Count: number;
  imageCount: number;
  imagesWithAlt: number;
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  readabilityScore: number;
}

/**
 * SEO Analyzer API
 * Performs real SEO analysis on a given URL
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the page
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; KarasuSEOBot/1.0)",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          error: `Sayfa yüklenemedi: HTTP ${response.status}`,
        });
      }

      html = await response.text();
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: `Sayfa yüklenirken hata: ${error.message}`,
      });
    }

    const $ = cheerio.load(html);
    const issues: SEOIssue[] = [];
    let score = 100;

    // Extract metrics
    const title = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";
    const h1Elements = $("h1");
    const h2Elements = $("h2");
    const h3Elements = $("h3");
    const images = $("img");
    const links = $("a[href]");

    // Count words in body text
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();
    const wordCount = bodyText.split(" ").filter(word => word.length > 0).length;

    // Count images with alt
    let imagesWithAlt = 0;
    images.each((_, img) => {
      const alt = $(img).attr("alt");
      if (alt && alt.trim()) imagesWithAlt++;
    });

    // Count internal/external links
    let internalLinks = 0;
    let externalLinks = 0;
    links.each((_, link) => {
      const href = $(link).attr("href");
      if (!href) return;
      try {
        const linkUrl = new URL(href, targetUrl.origin);
        if (linkUrl.hostname === targetUrl.hostname) {
          internalLinks++;
        } else {
          externalLinks++;
        }
      } catch {
        if (href.startsWith("/") || href.startsWith("#")) {
          internalLinks++;
        }
      }
    });

    // Calculate readability (simple formula)
    const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0;
    const readabilityScore = Math.max(0, Math.min(100, 100 - (avgWordsPerSentence - 15) * 3));

    const metrics: SEOMetrics = {
      titleLength: title.length,
      metaDescriptionLength: metaDescription.length,
      h1Count: h1Elements.length,
      h2Count: h2Elements.length,
      h3Count: h3Elements.length,
      imageCount: images.length,
      imagesWithAlt,
      internalLinks,
      externalLinks,
      wordCount,
      readabilityScore: Math.round(readabilityScore),
    };

    // Analyze Title
    if (!title) {
      issues.push({
        type: "error",
        title: "Sayfa Başlığı Eksik",
        description: "Bu sayfada title etiketi bulunamadı",
        impact: "high",
        fix: "30-60 karakter arası bir başlık ekleyin",
      });
      score -= 15;
    } else if (title.length < 30) {
      issues.push({
        type: "warning",
        title: "Başlık Çok Kısa",
        description: `Başlık ${title.length} karakter. Önerilen: 30-60 karakter`,
        impact: "medium",
        fix: "Başlığı daha açıklayıcı yapın",
      });
      score -= 8;
    } else if (title.length > 60) {
      issues.push({
        type: "warning",
        title: "Başlık Çok Uzun",
        description: `Başlık ${title.length} karakter. Önerilen: 30-60 karakter`,
        impact: "medium",
        fix: "Başlığı kısaltın, arama sonuçlarında kesilecektir",
      });
      score -= 5;
    }

    // Analyze Meta Description
    if (!metaDescription) {
      issues.push({
        type: "error",
        title: "Meta Description Eksik",
        description: "Bu sayfada meta description tanımlanmamış",
        impact: "high",
        fix: "70-160 karakter arası açıklayıcı bir meta description ekleyin",
      });
      score -= 12;
    } else if (metaDescription.length < 70) {
      issues.push({
        type: "warning",
        title: "Meta Description Çok Kısa",
        description: `Meta description ${metaDescription.length} karakter. Önerilen: 70-160 karakter`,
        impact: "medium",
        fix: "Açıklamayı daha detaylı yapın",
      });
      score -= 6;
    } else if (metaDescription.length > 160) {
      issues.push({
        type: "warning",
        title: "Meta Description Çok Uzun",
        description: `Meta description ${metaDescription.length} karakter. Önerilen: 70-160 karakter`,
        impact: "medium",
        fix: "Açıklamayı kısaltın, arama sonuçlarında kesilecektir",
      });
      score -= 4;
    }

    // Analyze H1
    if (h1Elements.length === 0) {
      issues.push({
        type: "error",
        title: "H1 Başlığı Eksik",
        description: "Sayfada H1 başlığı bulunamadı",
        impact: "high",
        fix: "Her sayfada bir adet H1 başlığı olmalı",
      });
      score -= 10;
    } else if (h1Elements.length > 1) {
      issues.push({
        type: "warning",
        title: "Birden Fazla H1",
        description: `Sayfada ${h1Elements.length} adet H1 var`,
        impact: "medium",
        fix: "Tek bir H1 başlığı kullanın",
      });
      score -= 5;
    }

    // Analyze Images
    const missingAltCount = images.length - imagesWithAlt;
    if (missingAltCount > 0) {
      const percentage = Math.round((missingAltCount / images.length) * 100);
      issues.push({
        type: percentage > 50 ? "error" : "warning",
        title: "Görsel Alt Metinleri Eksik",
        description: `${images.length} görselden ${missingAltCount} tanesinde alt metin yok`,
        impact: percentage > 50 ? "high" : "medium",
        fix: "Tüm görsellere açıklayıcı alt text ekleyin",
      });
      score -= percentage > 50 ? 10 : 5;
    }

    // Analyze Content Length
    if (wordCount < 300) {
      issues.push({
        type: "warning",
        title: "İçerik Çok Kısa",
        description: `Sayfa ${wordCount} kelime içeriyor. Önerilen: en az 300 kelime`,
        impact: "medium",
        fix: "Daha kapsamlı ve değerli içerik ekleyin",
      });
      score -= 8;
    }

    // Analyze Internal Links
    if (internalLinks < 3) {
      issues.push({
        type: "info",
        title: "Az İç Bağlantı",
        description: `Sayfada ${internalLinks} iç bağlantı var`,
        impact: "low",
        fix: "İlgili sayfalara daha fazla iç bağlantı ekleyin",
      });
      score -= 3;
    }

    // Check Canonical
    const canonical = $('link[rel="canonical"]').attr("href");
    if (!canonical) {
      issues.push({
        type: "info",
        title: "Canonical URL Eksik",
        description: "Sayfa için canonical URL tanımlanmamış",
        impact: "low",
        fix: "Duplicate content sorunlarını önlemek için canonical URL ekleyin",
      });
      score -= 2;
    }

    // Check Schema
    const schemaScripts = $('script[type="application/ld+json"]');
    if (schemaScripts.length === 0) {
      issues.push({
        type: "info",
        title: "Yapılandırılmış Veri Eksik",
        description: "Sayfada JSON-LD schema markup bulunamadı",
        impact: "low",
        fix: "Article, Organization gibi uygun schema'lar ekleyin",
      });
      score -= 3;
    }

    // Check Open Graph
    const ogTitle = $('meta[property="og:title"]').attr("content");
    const ogDescription = $('meta[property="og:description"]').attr("content");
    const ogImage = $('meta[property="og:image"]').attr("content");

    if (!ogTitle || !ogDescription) {
      issues.push({
        type: "info",
        title: "Open Graph Etiketleri Eksik",
        description: "Sosyal medya paylaşımları için OG etiketleri eksik",
        impact: "low",
        fix: "og:title, og:description ve og:image etiketlerini ekleyin",
      });
      score -= 2;
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    // Add positive findings
    if (issues.length === 0) {
      issues.push({
        type: "info",
        title: "Harika!",
        description: "Sayfanızda önemli bir SEO sorunu bulunamadı",
        impact: "low",
      });
    }

    return NextResponse.json({
      success: true,
      analysis: {
        url,
        score,
        title: title || "(Başlık yok)",
        metaDescription: metaDescription || "(Açıklama yok)",
        issues,
        metrics,
        openGraph: {
          title: ogTitle || null,
          description: ogDescription || null,
          image: ogImage || null,
        },
        canonical: canonical || null,
        schemaCount: schemaScripts.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to analyze URL" },
      { status: 500 }
    );
  }
}
