import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://karasuemlak.net";

type AuditIssue = {
  id: string;
  category: string;
  title: string;
  status: "pass" | "warning" | "fail";
  description: string;
  impact: "high" | "medium" | "low";
  fix?: string;
};

async function runTechnicalAudit(): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  let id = 1;

  // 1. Robots.txt
  try {
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`, {
      headers: { "User-Agent": "KarasuEmlak-SEO-Audit/1.0" },
      next: { revalidate: 0 },
    });
    const robotsText = await robotsRes.text();

    if (!robotsRes.ok) {
      issues.push({
        id: String(id++),
        category: "Crawlability",
        title: "Robots.txt",
        status: "fail",
        description: `Robots.txt erişilemedi (${robotsRes.status})`,
        impact: "high",
        fix: "Robots.txt endpoint'inin çalıştığından emin olun",
      });
    } else if (!robotsText || robotsText.trim().length < 10) {
      issues.push({
        id: String(id++),
        category: "Crawlability",
        title: "Robots.txt",
        status: "warning",
        description: "Robots.txt boş veya çok kısa",
        impact: "high",
        fix: "Robots.txt'de User-agent kuralları ve sitemap referansı ekleyin",
      });
    } else {
      const hasSitemap = /sitemap/i.test(robotsText);
      const disallowsApi = /disallow:\s*\/api/i.test(robotsText);
      issues.push({
        id: String(id++),
        category: "Crawlability",
        title: "Robots.txt",
        status: hasSitemap && disallowsApi ? "pass" : "warning",
        description: hasSitemap
          ? `Robots.txt mevcut, sitemap referansı var${disallowsApi ? ", /api engelli" : ""}`
          : "Robots.txt mevcut ancak sitemap referansı eksik olabilir",
        impact: "high",
        fix: !hasSitemap ? "Sitemap URL'ini robots.txt'e ekleyin" : undefined,
      });
    }
  } catch (err: any) {
    issues.push({
      id: String(id++),
      category: "Crawlability",
      title: "Robots.txt",
      status: "fail",
      description: `Robots.txt kontrolü başarısız: ${err?.message || "Bilinmeyen hata"}`,
      impact: "high",
    });
  }

  // 2. Sitemap
  try {
    const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`, {
      headers: { "User-Agent": "KarasuEmlak-SEO-Audit/1.0" },
      next: { revalidate: 0 },
    });
    const sitemapText = await sitemapRes.text();

    if (!sitemapRes.ok) {
      issues.push({
        id: String(id++),
        category: "Indexing",
        title: "Sitemap",
        status: "fail",
        description: `Sitemap.xml erişilemedi (${sitemapRes.status})`,
        impact: "high",
        fix: "Sitemap endpoint'inin çalıştığından emin olun",
      });
    } else {
      const urlCount = (sitemapText.match(/<loc>/g) || []).length;
      const hasUrls = urlCount > 0;
      issues.push({
        id: String(id++),
        category: "Indexing",
        title: "Sitemap",
        status: hasUrls ? "pass" : "warning",
        description: hasUrls
          ? `Sitemap.xml mevcut, ${urlCount} URL referansı`
          : "Sitemap.xml mevcut ancak URL bulunamadı",
        impact: "high",
      });
    }
  } catch (err: any) {
    issues.push({
      id: String(id++),
      category: "Indexing",
      title: "Sitemap",
      status: "fail",
      description: `Sitemap kontrolü başarısız: ${err?.message || "Bilinmeyen hata"}`,
      impact: "high",
    });
  }

  // 3. HTTPS
  const isHttps = BASE_URL.startsWith("https://");
  issues.push({
    id: String(id++),
    category: "Security",
    title: "HTTPS",
    status: isHttps ? "pass" : "fail",
    description: isHttps
      ? "Site HTTPS üzerinden servis ediliyor"
      : "Site HTTPS kullanmıyor",
    impact: "high",
    fix: !isHttps ? "HTTPS yapılandırması yapın" : undefined,
  });

  // 4. Meta / Homepage
  try {
    const homeRes = await fetch(BASE_URL, {
      headers: { "User-Agent": "KarasuEmlak-SEO-Audit/1.0" },
      next: { revalidate: 0 },
    });
    const homeHtml = await homeRes.text();

    const hasTitle = /<title[^>]*>[\s\S]*?<\/title>/i.test(homeHtml);
    const hasMetaDesc = /<meta[^>]+name=["']description["'][^>]+content=/i.test(homeHtml);
    const hasOgImage = /<meta[^>]+property=["']og:image["'][^>]+content=/i.test(homeHtml);
    const hasCanonical = /<link[^>]+rel=["']canonical["'][^>]+href=/i.test(homeHtml);
    const hasSchema = /<script[^>]+type=["']application\/ld\+json["']/i.test(homeHtml);

    const metaScore = [hasTitle, hasMetaDesc, hasOgImage, hasCanonical, hasSchema].filter(Boolean).length;
    issues.push({
      id: String(id++),
      category: "On-Page",
      title: "Ana Sayfa Meta",
      status: metaScore >= 4 ? "pass" : metaScore >= 3 ? "warning" : "fail",
      description: `Title: ${hasTitle ? "✓" : "✗"}, Meta Desc: ${hasMetaDesc ? "✓" : "✗"}, OG Image: ${hasOgImage ? "✓" : "✗"}, Canonical: ${hasCanonical ? "✓" : "✗"}, Schema: ${hasSchema ? "✓" : "✗"}`,
      impact: "high",
      fix: !hasTitle ? "Title etiketi ekleyin" : !hasMetaDesc ? "Meta description ekleyin" : undefined,
    });
  } catch (err: any) {
    issues.push({
      id: String(id++),
      category: "On-Page",
      title: "Ana Sayfa Meta",
      status: "fail",
      description: `Ana sayfa kontrolü başarısız: ${err?.message || "Bilinmeyen hata"}`,
      impact: "high",
    });
  }

  return issues;
}

/**
 * Technical SEO Audit API
 * POST: Run actual technical SEO checks (robots, sitemap, meta, HTTPS)
 */
export async function POST(_request: NextRequest) {
  try {
    const issues = await runTechnicalAudit();

    return NextResponse.json({
      success: true,
      issues,
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to run audit" },
      { status: 500 }
    );
  }
}
