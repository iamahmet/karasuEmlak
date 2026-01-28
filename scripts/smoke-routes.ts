#!/usr/bin/env tsx
/**
 * Route regression smoke test — Ensures legacy indexed URLs return 200 and contain SEO tags.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 pnpm tsx scripts/smoke-routes.ts
 *   pnpm run smoke:routes  (from root)
 *
 * See: docs/SEO_LOCK.md, LEGACY_LANDING_PATHS in apps/web/lib/seo/constants.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const GOOGLE_SITE_VERIFICATION = 'uNWMokv81E_cnHJl-FM-2QnAq3iQQ_uX2Kww-wZoWyA';
const GA_MEASUREMENT_ID = 'G-EXFYWJWB5C';

const LEGACY_PATHS = [
  '/kiralik-daire',
  '/satilik-daire',
  '/karasu-kiralik-daire',
  '/karasu-satilik-daire',
];

const KEY_PATHS = ['/', '/kiralik', '/satilik', '/blog', '/karasu', '/satilik-ev', '/kiralik-ev', '/satilik-villa', '/karasu-satilik-ev'];

const PATHS_TO_TEST = [...LEGACY_PATHS, ...KEY_PATHS];

async function testPath(path: string): Promise<{ ok: boolean; status: number; msg: string }> {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const html = await res.text();
    const status = res.status;

    if (status !== 200) {
      return { ok: false, status, msg: `HTTP ${status}` };
    }

    const hasVerification =
      html.includes('google-site-verification') && html.includes(GOOGLE_SITE_VERIFICATION);
    const hasGA = html.includes(GA_MEASUREMENT_ID);

    if (!hasVerification) {
      return { ok: false, status, msg: 'Missing google-site-verification in HTML' };
    }
    if (!hasGA) {
      return { ok: false, status, msg: `Missing "${GA_MEASUREMENT_ID}" in HTML` };
    }

    return { ok: true, status, msg: 'OK' };
  } catch (err: unknown) {
    return {
      ok: false,
      status: 0,
      msg: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  console.log('🧪 Smoke: Legacy routes + SEO tags');
  console.log(`   BASE_URL: ${BASE_URL}\n`);

  let failed = 0;
  for (const path of PATHS_TO_TEST) {
    const { ok, status, msg } = await testPath(path);
    if (ok) {
      console.log(`✅ ${path} → ${status} (verification + GA present)`);
    } else {
      console.log(`❌ ${path} → ${msg}`);
      failed++;
    }
  }

  console.log(`\n   ${failed === 0 ? 'All passed.' : `${failed} failed.`}`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
