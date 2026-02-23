/**
 * Schema Validation Script - Phase 2 Structured Data
 * Validates JSON-LD presence and structure on key pages
 *
 * Usage: pnpm seo:validate-schema [--base-url=https://www.karasuemlak.net]
 */

import * as cheerio from 'cheerio';

const BASE_URL = process.env.SEO_CRAWL_BASE_URL || process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://www.karasuemlak.net';

const REQUIRED_SCHEMAS = ['WebSite', 'Organization', 'BreadcrumbList'] as const;
const PAGE_SCHEMAS: Record<string, string[]> = {
  '/': ['WebSite', 'Organization'],
  '/satilik': ['ItemList', 'BreadcrumbList'],
  '/kiralik': ['ItemList', 'BreadcrumbList'],
  '/blog': ['ItemList', 'BreadcrumbList'],
};

interface SchemaCheck {
  url: string;
  found: string[];
  missing: string[];
  invalid: string[];
  ok: boolean;
}

async function validatePage(url: string, expectedTypes: string[]): Promise<SchemaCheck> {
  const check: SchemaCheck = { url, found: [], missing: [], invalid: [], ok: true };

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'KarasuEmlak-SEO-Validator/1.0' },
    });
    if (!res.ok) {
      check.missing = expectedTypes;
      check.ok = false;
      return check;
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    const scripts = $('script[type="application/ld+json"]');

    const foundTypes = new Set<string>();
    scripts.each((_, el) => {
      try {
        const json = $(el).html();
        if (!json) return;
        const data = JSON.parse(json);
        const items = Array.isArray(data) ? data : [data];
        for (const item of items) {
          const type = item['@type'];
          if (type) foundTypes.add(type);
        }
      } catch {
        check.invalid.push('parse error');
      }
    });

    check.found = [...foundTypes];
    for (const t of expectedTypes) {
      if (!foundTypes.has(t)) check.missing.push(t);
    }
    check.ok = check.missing.length === 0 && check.invalid.length === 0;
  } catch (e) {
    check.missing = expectedTypes;
    check.ok = false;
  }

  return check;
}

async function main() {
  const baseUrl = BASE_URL.replace(/\/$/, '');
  console.log(`\n🔍 Schema Validation: ${baseUrl}\n`);

  const allExpected = [...new Set(REQUIRED_SCHEMAS)];
  const checks: SchemaCheck[] = [];

  for (const [path, types] of Object.entries(PAGE_SCHEMAS)) {
    const url = `${baseUrl}${path}`;
    const expected = [...new Set([...allExpected, ...types])];
    const c = await validatePage(url, expected);
    checks.push(c);
    const icon = c.ok ? '✅' : '❌';
    console.log(`   ${icon} ${path}: found [${c.found.join(', ')}]${c.missing.length ? ` missing [${c.missing.join(', ')}]` : ''}`);
  }

  const failed = checks.filter((c) => !c.ok);
  if (failed.length > 0) {
    console.error(`\n❌ ${failed.length} page(s) failed schema validation\n`);
    process.exit(1);
  }

  console.log('\n✅ Schema validation passed\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
