/**
 * SEO Crawl Script - Phase 1 Technical SEO
 * Fetches sitemap URLs + key routes, validates indexability
 * Outputs SEO_CRAWL_REPORT.md; fails CI on critical issues
 *
 * Usage: pnpm seo:crawl [--base-url=https://www.karasuemlak.net] [--limit=50]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';

const BASE_URL = process.env.SEO_CRAWL_BASE_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://www.karasuemlak.net';

const LIMIT = parseInt(process.env.SEO_CRAWL_LIMIT || '80', 10);

const GSC_VERIFICATION = 'uNWMokv81E_cnHJl-FM-2QnAq3iQQ_uX2Kww-wZoWyA';
const GA4_ID = 'G-EXFYWJWB5C';

interface CrawlResult {
  url: string;
  status: number;
  ok: boolean;
  issues: string[];
  checks: {
    canonical?: string;
    canonicalSelfRef?: boolean;
    title?: string;
    titleLength?: number;
    metaDesc?: string;
    metaDescLength?: number;
    gscMeta?: boolean;
    ga4?: boolean;
    noindex?: boolean;
    hasSchema?: boolean;
    hasHreflang?: boolean;
  };
}

async function fetchSitemapUrls(baseUrl: string): Promise<string[]> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  try {
    const res = await fetch(sitemapUrl);
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = await parseStringPromise(xml);
    const urls: string[] = [];
    const urlset = parsed?.urlset?.url;
    if (Array.isArray(urlset)) {
      for (const u of urlset) {
        const loc = u.loc?.[0];
        if (loc && typeof loc === 'string') urls.push(loc);
      }
    }
    return urls.slice(0, LIMIT);
  } catch (e) {
    console.warn('[crawl] Sitemap fetch failed:', (e as Error).message);
    return [];
  }
}

function getKeyRoutes(baseUrl: string): string[] {
  return [
    '/',
    '/satilik',
    '/kiralik',
    '/karasu',
    '/karasu-satilik-daire',
    '/karasu-kiralik-daire',
    '/sapanca',
    '/kocaali',
    '/blog',
    '/blog/ramazan-2026',
    '/satilik-daire',
    '/kiralik-daire',
    '/hakkimizda',
    '/iletisim',
  ].map((p) => `${baseUrl}${p}`);
}

async function crawlUrl(url: string): Promise<CrawlResult> {
  const result: CrawlResult = {
    url,
    status: 0,
    ok: false,
    issues: [],
    checks: {},
  };

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KarasuEmlak-SEO-Crawler/1.0' },
      redirect: 'follow',
    });
    result.status = res.status;
    result.ok = res.ok;

    if (!res.ok) {
      result.issues.push(`HTTP ${res.status}`);
      return result;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const canonical = $('link[rel="canonical"]').attr('href');
    result.checks.canonical = canonical || undefined;
    const expectedCanonical = url.replace(/\/$/, '') || url;
    result.checks.canonicalSelfRef = !!canonical && canonical.replace(/\/$/, '') === expectedCanonical.replace(/\/$/, '');
    if (!result.checks.canonicalSelfRef && canonical) {
      result.issues.push(`Canonical mismatch: ${canonical}`);
    }
    if (!canonical) result.issues.push('Missing canonical');

    const title = $('title').text();
    result.checks.title = title?.slice(0, 80) || undefined;
    result.checks.titleLength = title?.length ?? 0;
    if (!title || title.length < 10) result.issues.push('Title too short or missing');
    if (title && title.length > 60) result.issues.push(`Title long (${title.length} chars)`);

    const metaDesc = $('meta[name="description"]').attr('content');
    result.checks.metaDesc = metaDesc?.slice(0, 100) || undefined;
    result.checks.metaDescLength = metaDesc?.length ?? 0;
    if (!metaDesc || metaDesc.length < 50) result.issues.push('Meta description missing or short');
    if (metaDesc && metaDesc.length > 160) result.issues.push(`Meta desc long (${metaDesc.length} chars)`);

    const gscMeta = $(`meta[name="google-site-verification"][content="${GSC_VERIFICATION}"]`).length > 0;
    result.checks.gscMeta = gscMeta;
    if (!gscMeta) result.issues.push('GSC verification meta missing');

    result.checks.ga4 = html.includes(GA4_ID);
    if (!result.checks.ga4) result.issues.push('GA4 measurement ID missing');

    const noindex = $('meta[name="robots"]').attr('content')?.toLowerCase().includes('noindex') ?? false;
    result.checks.noindex = noindex;
    if (noindex) result.issues.push('noindex detected');

    const schemaScripts = $('script[type="application/ld+json"]');
    result.checks.hasSchema = schemaScripts.length > 0;
    if (!result.checks.hasSchema) result.issues.push('No JSON-LD schema');

    const hreflang = $('link[rel="alternate"][hreflang]');
    result.checks.hasHreflang = hreflang.length > 0;
  } catch (e) {
    result.issues.push(`Fetch error: ${(e as Error).message}`);
  }

  return result;
}

async function main() {
  const baseUrl = BASE_URL.replace(/\/$/, '');
  console.log(`\n🔍 SEO Crawl: ${baseUrl} (limit: ${LIMIT})\n`);

  let urls = await fetchSitemapUrls(baseUrl);
  if (urls.length === 0) {
    urls = getKeyRoutes(baseUrl);
    console.log('   Using key routes (sitemap empty or failed)\n');
  } else {
    const keyRoutes = getKeyRoutes(baseUrl);
    const keySet = new Set(keyRoutes);
    for (const u of keyRoutes) {
      if (!urls.includes(u)) urls.unshift(u);
    }
    urls = [...new Set(urls)].slice(0, LIMIT);
  }

  const results: CrawlResult[] = [];
  for (let i = 0; i < urls.length; i++) {
    process.stdout.write(`   [${i + 1}/${urls.length}] ${new URL(urls[i]).pathname || '/'}\r`);
    const r = await crawlUrl(urls[i]);
    results.push(r);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  const critical = results.filter(
    (r) =>
      !r.ok ||
      r.issues.some(
        (i) =>
          i.includes('404') ||
          i.includes('500') ||
          i.includes('noindex') ||
          i.includes('GSC verification meta')
      )
  );
  const failed = results.filter((r) => !r.ok);
  const warnings = results.filter((r) => r.ok && r.issues.length > 0);

  const report = [
    `# SEO Crawl Report`,
    `Generated: ${new Date().toISOString()}`,
    `Base URL: ${baseUrl}`,
    `URLs checked: ${results.length}`,
    ``,
    `## Summary`,
    `- ✅ OK: ${results.length - failed.length - warnings.length}`,
    `- ⚠️ Warnings: ${warnings.length}`,
    `- ❌ Failed: ${failed.length}`,
    `- 🚨 Critical: ${critical.length}`,
    ``,
    `## Critical Issues`,
    ...(critical.length > 0
      ? critical.map((r) => `- ${r.url}: ${r.issues.join('; ')}`)
      : ['- None']),
    ``,
    `## Failed URLs`,
    ...(failed.length > 0 ? failed.map((r) => `- ${r.url} (${r.status})`) : ['- None']),
    ``,
    `## Sample Warnings`,
    ...warnings.slice(0, 15).map((r) => `- ${r.url}: ${r.issues.join('; ')}`),
  ].join('\n');

  const reportPath = path.join(process.cwd(), 'SEO_CRAWL_REPORT.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n\n📄 Report: ${reportPath}\n`);

  if (critical.length > 0) {
    console.error(`\n❌ ${critical.length} critical issue(s) - CI should fail\n`);
    process.exit(1);
  }
  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} URL(s) failed (4xx/5xx)\n`);
    process.exit(1);
  }

  console.log('✅ Crawl passed (no critical issues)\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
