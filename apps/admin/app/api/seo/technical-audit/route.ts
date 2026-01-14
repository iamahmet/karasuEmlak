import { NextRequest, NextResponse } from "next/server";
import { load } from "cheerio";

type CheerioAPI = ReturnType<typeof load>;

interface AuditIssue {
  id: string;
  category: string;
  title: string;
  status: "pass" | "warning" | "error";
  description: string;
  impact: "high" | "medium" | "low";
  fix?: string;
}

/**
 * Technical SEO Audit API
 * Performs real technical SEO checks on a given URL
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    let targetUrl: URL;
    try {
      targetUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const issues: AuditIssue[] = [];
    let score = 100;

    // 1. HTTPS Check
    const httpsIssue = checkHTTPS(targetUrl);
    issues.push(httpsIssue);
    if (httpsIssue.status !== "pass") score -= 15;

    // 2. Fetch the page
    let html: string;
    let $: CheerioAPI;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; KarasuSEOBot/1.0)",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        issues.push({
          id: "page-fetch",
          category: "Crawlability",
          title: "Sayfa Erişimi",
          status: "error",
          description: `Sayfa yüklenemedi: HTTP ${response.status}`,
          impact: "high",
          fix: "Sayfanın erişilebilir olduğundan emin olun",
        });
        score -= 30;
      } else {
        html = await response.text();
        $ = load(html);

        // 3. Meta Tags Check
        const metaIssues = checkMetaTags($);
        issues.push(...metaIssues);
        metaIssues.forEach(issue => {
          if (issue.status === "error") score -= 10;
          else if (issue.status === "warning") score -= 5;
        });

        // 4. Heading Structure Check
        const headingIssues = checkHeadings($);
        issues.push(...headingIssues);
        headingIssues.forEach(issue => {
          if (issue.status === "error") score -= 10;
          else if (issue.status === "warning") score -= 5;
        });

        // 5. Image Alt Tags Check
        const imageIssues = checkImages($);
        issues.push(...imageIssues);
        imageIssues.forEach(issue => {
          if (issue.status === "error") score -= 8;
          else if (issue.status === "warning") score -= 4;
        });

        // 6. Mobile Viewport Check
        const viewportIssue = checkViewport($);
        issues.push(viewportIssue);
        if (viewportIssue.status !== "pass") score -= 10;

        // 7. Canonical URL Check
        const canonicalIssue = checkCanonical($, url);
        issues.push(canonicalIssue);
        if (canonicalIssue.status !== "pass") score -= 5;

        // 8. Schema Markup Check
        const schemaIssue = checkSchema($);
        issues.push(schemaIssue);
        if (schemaIssue.status !== "pass") score -= 5;

        // 9. Internal Links Check
        const linkIssue = checkLinks($, targetUrl);
        issues.push(linkIssue);
        if (linkIssue.status !== "pass") score -= 5;
      }
    } catch (error: any) {
      issues.push({
        id: "page-fetch-error",
        category: "Crawlability",
        title: "Sayfa Erişimi",
        status: "error",
        description: `Sayfa yüklenirken hata: ${error.message}`,
        impact: "high",
        fix: "Sunucu yanıt vermiyor veya zaman aşımı oluştu",
      });
      score -= 30;
    }

    // 10. Check robots.txt
    const robotsIssue = await checkRobotsTxt(targetUrl);
    issues.push(robotsIssue);
    if (robotsIssue.status !== "pass") score -= 5;

    // 11. Check sitemap
    const sitemapIssue = await checkSitemap(targetUrl);
    issues.push(sitemapIssue);
    if (sitemapIssue.status !== "pass") score -= 5;

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      success: true,
      url,
      score,
      issues,
      summary: {
        total: issues.length,
        passed: issues.filter(i => i.status === "pass").length,
        warnings: issues.filter(i => i.status === "warning").length,
        errors: issues.filter(i => i.status === "error").length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to run audit" },
      { status: 500 }
    );
  }
}

function checkHTTPS(url: URL): AuditIssue {
  if (url.protocol === "https:") {
    return {
      id: "https",
      category: "Security",
      title: "HTTPS",
      status: "pass",
      description: "Site HTTPS üzerinden güvenli şekilde sunuluyor",
      impact: "high",
    };
  }
  return {
    id: "https",
    category: "Security",
    title: "HTTPS",
    status: "error",
    description: "Site HTTP üzerinden sunuluyor, HTTPS kullanılmıyor",
    impact: "high",
    fix: "SSL sertifikası alın ve HTTPS'e geçin",
  };
}

function checkMetaTags($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  // Title check
  const title = $("title").text().trim();
  if (!title) {
    issues.push({
      id: "title-missing",
      category: "Meta Tags",
      title: "Sayfa Başlığı",
      status: "error",
      description: "Sayfa başlığı (title) bulunamadı",
      impact: "high",
      fix: "<title> etiketi ekleyin",
    });
  } else if (title.length < 30) {
    issues.push({
      id: "title-short",
      category: "Meta Tags",
      title: "Sayfa Başlığı",
      status: "warning",
      description: `Başlık çok kısa (${title.length} karakter). Önerilen: 30-60 karakter`,
      impact: "medium",
      fix: "Başlığı daha açıklayıcı yapın",
    });
  } else if (title.length > 60) {
    issues.push({
      id: "title-long",
      category: "Meta Tags",
      title: "Sayfa Başlığı",
      status: "warning",
      description: `Başlık çok uzun (${title.length} karakter). Önerilen: 30-60 karakter`,
      impact: "medium",
      fix: "Başlığı kısaltın",
    });
  } else {
    issues.push({
      id: "title",
      category: "Meta Tags",
      title: "Sayfa Başlığı",
      status: "pass",
      description: `Başlık uygun uzunlukta (${title.length} karakter)`,
      impact: "high",
    });
  }

  // Meta description check
  const description = $('meta[name="description"]').attr("content")?.trim();
  if (!description) {
    issues.push({
      id: "description-missing",
      category: "Meta Tags",
      title: "Meta Açıklama",
      status: "error",
      description: "Meta description bulunamadı",
      impact: "high",
      fix: '<meta name="description" content="..."> ekleyin',
    });
  } else if (description.length < 70) {
    issues.push({
      id: "description-short",
      category: "Meta Tags",
      title: "Meta Açıklama",
      status: "warning",
      description: `Meta description çok kısa (${description.length} karakter). Önerilen: 70-160 karakter`,
      impact: "medium",
      fix: "Açıklamayı daha detaylı yapın",
    });
  } else if (description.length > 160) {
    issues.push({
      id: "description-long",
      category: "Meta Tags",
      title: "Meta Açıklama",
      status: "warning",
      description: `Meta description çok uzun (${description.length} karakter). Önerilen: 70-160 karakter`,
      impact: "medium",
      fix: "Açıklamayı kısaltın",
    });
  } else {
    issues.push({
      id: "description",
      category: "Meta Tags",
      title: "Meta Açıklama",
      status: "pass",
      description: `Meta description uygun uzunlukta (${description.length} karakter)`,
      impact: "high",
    });
  }

  return issues;
}

function checkHeadings($: CheerioAPI): AuditIssue[] {
  const issues: AuditIssue[] = [];

  const h1Count = $("h1").length;
  if (h1Count === 0) {
    issues.push({
      id: "h1-missing",
      category: "Headings",
      title: "H1 Başlığı",
      status: "error",
      description: "Sayfada H1 başlığı bulunamadı",
      impact: "high",
      fix: "Her sayfada bir adet H1 başlığı bulunmalı",
    });
  } else if (h1Count > 1) {
    issues.push({
      id: "h1-multiple",
      category: "Headings",
      title: "H1 Başlığı",
      status: "warning",
      description: `Sayfada ${h1Count} adet H1 başlığı var. Önerilen: 1 adet`,
      impact: "medium",
      fix: "Tek bir H1 başlığı kullanın",
    });
  } else {
    issues.push({
      id: "h1",
      category: "Headings",
      title: "H1 Başlığı",
      status: "pass",
      description: "Sayfada tek bir H1 başlığı mevcut",
      impact: "high",
    });
  }

  return issues;
}

function checkImages($: CheerioAPI): AuditIssue[] {
  const images = $("img");
  const totalImages = images.length;
  let missingAlt = 0;

  images.each((_, img) => {
    const alt = $(img).attr("alt");
    if (!alt || alt.trim() === "") {
      missingAlt++;
    }
  });

  if (totalImages === 0) {
    return [{
      id: "images",
      category: "Images",
      title: "Görsel Optimizasyonu",
      status: "pass",
      description: "Sayfada görsel bulunmuyor",
      impact: "low",
    }];
  }

  if (missingAlt === 0) {
    return [{
      id: "images-alt",
      category: "Images",
      title: "Görsel Alt Metinleri",
      status: "pass",
      description: `Tüm görsellerin (${totalImages}) alt metni mevcut`,
      impact: "medium",
    }];
  }

  const percentage = Math.round((missingAlt / totalImages) * 100);
  return [{
    id: "images-alt-missing",
    category: "Images",
    title: "Görsel Alt Metinleri",
    status: percentage > 50 ? "error" : "warning",
    description: `${totalImages} görselden ${missingAlt} tanesinde alt metin eksik (%${percentage})`,
    impact: "medium",
    fix: "Tüm görsellere açıklayıcı alt metin ekleyin",
  }];
}

function checkViewport($: CheerioAPI): AuditIssue {
  const viewport = $('meta[name="viewport"]').attr("content");
  if (!viewport) {
    return {
      id: "viewport-missing",
      category: "Mobile",
      title: "Viewport Meta Etiketi",
      status: "error",
      description: "Viewport meta etiketi bulunamadı",
      impact: "high",
      fix: '<meta name="viewport" content="width=device-width, initial-scale=1"> ekleyin',
    };
  }
  return {
    id: "viewport",
    category: "Mobile",
    title: "Viewport Meta Etiketi",
    status: "pass",
    description: "Viewport meta etiketi mevcut - Mobil uyumlu",
    impact: "high",
  };
}

function checkCanonical($: CheerioAPI, currentUrl: string): AuditIssue {
  const canonical = $('link[rel="canonical"]').attr("href");
  if (!canonical) {
    return {
      id: "canonical-missing",
      category: "Indexing",
      title: "Canonical URL",
      status: "warning",
      description: "Canonical URL tanımlanmamış",
      impact: "medium",
      fix: '<link rel="canonical" href="..."> ekleyin',
    };
  }
  return {
    id: "canonical",
    category: "Indexing",
    title: "Canonical URL",
    status: "pass",
    description: `Canonical URL tanımlı: ${canonical}`,
    impact: "medium",
  };
}

function checkSchema($: CheerioAPI): AuditIssue {
  const schemas = $('script[type="application/ld+json"]');
  if (schemas.length === 0) {
    return {
      id: "schema-missing",
      category: "Structured Data",
      title: "Schema Markup",
      status: "warning",
      description: "Yapılandırılmış veri (JSON-LD) bulunamadı",
      impact: "medium",
      fix: "Article, Organization veya diğer ilgili schema'ları ekleyin",
    };
  }
  return {
    id: "schema",
    category: "Structured Data",
    title: "Schema Markup",
    status: "pass",
    description: `${schemas.length} adet yapılandırılmış veri mevcut`,
    impact: "medium",
  };
}

function checkLinks($: CheerioAPI, baseUrl: URL): AuditIssue {
  const links = $("a[href]");
  let internalLinks = 0;
  let externalLinks = 0;
  let brokenLinks = 0;

  links.each((_, link) => {
    const href = $(link).attr("href");
    if (!href) return;

    try {
      const linkUrl = new URL(href, baseUrl.origin);
      if (linkUrl.hostname === baseUrl.hostname) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      // Relative URL or invalid
      if (href.startsWith("/") || href.startsWith("#")) {
        internalLinks++;
      }
    }
  });

  if (internalLinks < 3) {
    return {
      id: "links-low",
      category: "Links",
      title: "İç Bağlantılar",
      status: "warning",
      description: `Sayfada az sayıda iç bağlantı var (${internalLinks} adet)`,
      impact: "medium",
      fix: "Daha fazla ilgili sayfalara iç bağlantı ekleyin",
    };
  }

  return {
    id: "links",
    category: "Links",
    title: "Sayfa Bağlantıları",
    status: "pass",
    description: `${internalLinks} iç, ${externalLinks} dış bağlantı mevcut`,
    impact: "medium",
  };
}

async function checkRobotsTxt(url: URL): Promise<AuditIssue> {
  try {
    const robotsUrl = `${url.origin}/robots.txt`;
    const response = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const content = await response.text();
      const hasSitemap = content.toLowerCase().includes("sitemap:");
      return {
        id: "robots",
        category: "Crawlability",
        title: "Robots.txt",
        status: "pass",
        description: hasSitemap
          ? "Robots.txt mevcut ve sitemap referansı içeriyor"
          : "Robots.txt mevcut",
        impact: "medium",
      };
    }

    return {
      id: "robots-missing",
      category: "Crawlability",
      title: "Robots.txt",
      status: "warning",
      description: "Robots.txt dosyası bulunamadı",
      impact: "medium",
      fix: "Robots.txt dosyası oluşturun",
    };
  } catch {
    return {
      id: "robots-error",
      category: "Crawlability",
      title: "Robots.txt",
      status: "warning",
      description: "Robots.txt kontrol edilemedi",
      impact: "low",
    };
  }
}

async function checkSitemap(url: URL): Promise<AuditIssue> {
  try {
    const sitemapUrl = `${url.origin}/sitemap.xml`;
    const response = await fetch(sitemapUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const content = await response.text();
      const urlCount = (content.match(/<url>/g) || []).length;
      return {
        id: "sitemap",
        category: "Indexing",
        title: "Sitemap.xml",
        status: "pass",
        description: urlCount > 0
          ? `Sitemap mevcut ve ${urlCount} URL içeriyor`
          : "Sitemap mevcut",
        impact: "high",
      };
    }

    return {
      id: "sitemap-missing",
      category: "Indexing",
      title: "Sitemap.xml",
      status: "warning",
      description: "Sitemap.xml dosyası bulunamadı",
      impact: "medium",
      fix: "XML sitemap oluşturun ve robots.txt'e ekleyin",
    };
  } catch {
    return {
      id: "sitemap-error",
      category: "Indexing",
      title: "Sitemap.xml",
      status: "warning",
      description: "Sitemap kontrol edilemedi",
      impact: "low",
    };
  }
}
