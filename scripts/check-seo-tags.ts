#!/usr/bin/env tsx
/**
 * SEO Tag Guard — Ensures verification meta and GA4 are present in built/live HTML.
 * Run after build or against a live URL. Fails if tags are missing.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 pnpm tsx scripts/check-seo-tags.ts
 *   BASE_URL=https://www.karasuemlak.net pnpm tsx scripts/check-seo-tags.ts
 *   pnpm run check:seo-tags  (from root; uses BASE_URL or http://localhost:3000)
 *
 * See: docs/SEO_LOCK.md
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const GOOGLE_SITE_VERIFICATION = 'uNWMokv81E_cnHJl-FM-2QnAq3iQQ_uX2Kww-wZoWyA';
const GA_MEASUREMENT_ID = 'G-EXFYWJWB5C';

async function main() {
  console.log('🔒 SEO Tag Guard');
  console.log(`   BASE_URL: ${BASE_URL}\n`);

  let html: string;
  try {
    const res = await fetch(BASE_URL, { redirect: 'follow' });
    if (!res.ok) {
      console.error(`❌ Fetch failed: HTTP ${res.status}`);
      process.exit(1);
    }
    html = await res.text();
  } catch (err: unknown) {
    console.error('❌ Fetch error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const hasVerification =
    html.includes('google-site-verification') && html.includes(GOOGLE_SITE_VERIFICATION);
  const hasGA = html.includes(GA_MEASUREMENT_ID);

  if (!hasVerification) {
    console.error(
      `❌ Missing or wrong google-site-verification meta. Expected content="${GOOGLE_SITE_VERIFICATION}"`
    );
    process.exit(1);
  }
  if (!hasGA) {
    console.error(`❌ Missing GA4 measurement ID in HTML. Expected "${GA_MEASUREMENT_ID}"`);
    process.exit(1);
  }

  console.log('✅ google-site-verification meta present');
  console.log('✅ GA4 measurement ID present');
  console.log('\n   SEO tags OK.');
}

main();
