/**
 * Generate branded OG/featured images for Ramadan 2026 articles (non-AI template)
 *
 * - Renders a consistent, professional PNG via Playwright (1792x1024).
 * - Uploads to Cloudinary with stable IDs.
 * - Updates `articles.featured_image` (and `featured_image_id` when possible).
 *
 * Default: dry-run (generate images only, no uploads/DB writes)
 * Use --apply to upload + update DB.
 *
 * Usage:
 *   pnpm tsx scripts/generate-ramadan-2026-images.ts
 *   pnpm tsx scripts/generate-ramadan-2026-images.ts --apply
 */

import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as dotenv from 'dotenv';
import { chromium } from 'playwright';
import { createServiceClient } from '../packages/lib/supabase/service';
import { getCloudinaryClient } from '../packages/lib/cloudinary/client';

dotenv.config({ path: '.env.local' });

const OUT_DIR = resolve(process.cwd(), '.tmp/ramadan-2026-images');

const RAMADAN_2026_SLUGS = [
  'ramazan-2026-karasu-rehberi',
  'sakarya-karasu-ramazan-imsakiyesi-2026',
  'karasu-iftara-kac-dakika-kaldi',
  'ramazan-bayrami-2026-karasu-tatil-yazlik-rehberi',
  'ramazan-2026-karasu-kiralik-ev-ipuclari',
  'ramazan-oncesi-tasinma-checklist-karasu',
  'ramazan-karasu-yazlik-kiralama-bayram-2026',
  'karasu-ramazan-sahil-aksam-plani',
  'ramazan-2026-karasu-ev-gezerken-sorular',
  'karasu-ramazan-2026-kiralik-daire-mi-ev-mi',
  'ramazan-bayrami-2026-karasu-trafik-park',
  'ramazanda-kiraci-mutfak-duzeni-iftar-sahur',
];

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildHtml(params: { title: string; subtitle: string; slug: string }) {
  const title = escapeHtml(params.title);
  const subtitle = escapeHtml(params.subtitle);
  const slug = escapeHtml(params.slug);

  // Keep content within safe area for 1200x630 crop (centered).
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --bg1: #061329;
        --bg2: #0b2a4a;
        --accent: #006AFF;
        --accent2: #00A862;
        --text: #f8fafc;
        --muted: rgba(248,250,252,0.78);
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 1792px; height: 1024px; }
      body {
        background:
          radial-gradient(1200px 700px at 15% 30%, rgba(0,106,255,0.30), transparent 60%),
          radial-gradient(900px 520px at 85% 75%, rgba(0,168,98,0.20), transparent 60%),
          linear-gradient(135deg, var(--bg1), var(--bg2));
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
        color: var(--text);
        position: relative;
        overflow: hidden;
      }
      .grain {
        position: absolute; inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");
        opacity: .35;
        mix-blend-mode: overlay;
        pointer-events: none;
      }
      .wrap {
        position: relative;
        height: 100%;
        padding: 84px 92px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        font-weight: 800;
        letter-spacing: .2px;
      }
      .logo {
        width: 44px;
        height: 44px;
        border-radius: 14px;
        background: linear-gradient(135deg, rgba(0,106,255,0.95), rgba(0,168,98,0.85));
        box-shadow: 0 12px 30px rgba(0,0,0,0.25);
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.14);
        color: var(--muted);
        font-weight: 600;
        font-size: 14px;
        backdrop-filter: blur(10px);
      }
      .center {
        max-width: 1280px;
      }
      .kicker {
        color: rgba(248,250,252,0.85);
        font-weight: 700;
        letter-spacing: .18em;
        text-transform: uppercase;
        font-size: 14px;
        margin-bottom: 16px;
      }
      h1 {
        margin: 0;
        font-size: 74px;
        line-height: 1.05;
        letter-spacing: -0.02em;
        text-wrap: balance;
        max-width: 1200px;
      }
      .sub {
        margin-top: 22px;
        font-size: 22px;
        line-height: 1.45;
        color: var(--muted);
        max-width: 980px;
      }
      .bottom {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 24px;
        color: rgba(248,250,252,0.78);
        font-weight: 600;
        font-size: 16px;
      }
      .url {
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(0,0,0,0.18);
        border: 1px solid rgba(255,255,255,0.10);
      }
      .tag {
        display: inline-flex;
        gap: 10px;
        align-items: center;
      }
      .dot {
        width: 8px; height: 8px; border-radius: 999px;
        background: var(--accent);
        box-shadow: 0 0 0 6px rgba(0,106,255,0.18);
      }
      .shape {
        position: absolute;
        right: -220px;
        top: -220px;
        width: 560px;
        height: 560px;
        border-radius: 160px;
        background: radial-gradient(circle at 30% 30%, rgba(0,106,255,0.35), rgba(0,106,255,0.05) 60%, transparent 70%);
        transform: rotate(18deg);
        filter: blur(0.2px);
        opacity: 0.9;
      }
    </style>
  </head>
  <body>
    <div class="grain"></div>
    <div class="shape"></div>
    <div class="wrap">
      <div class="top">
        <div class="brand">
          <div class="logo"></div>
          <div>Karasu Emlak</div>
        </div>
        <div class="pill">Ramazan 2026 • Karasu, Sakarya</div>
      </div>

      <div class="center">
        <div class="kicker">${subtitle}</div>
        <h1>${title}</h1>
        <div class="sub">Pratik rehberler, kontrol listeleri ve güncel vakit bağlantıları.</div>
      </div>

      <div class="bottom">
        <div class="tag"><span class="dot"></span><span>Blog • Rehber</span></div>
        <div class="url">karasuemlak.net/blog/${slug}</div>
      </div>
    </div>
  </body>
</html>`;
}

async function main() {
  const apply = process.argv.includes('--apply');

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const supabase = createServiceClient();

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, category')
    .eq('status', 'published')
    .in('slug', RAMADAN_2026_SLUGS);

  if (error) throw error;
  const bySlug = new Map((articles || []).map((a: any) => [a.slug, a]));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1792, height: 1024, deviceScaleFactor: 2 } });

  const cloudinary = apply ? getCloudinaryClient() : null;

  let generated = 0;
  let uploaded = 0;
  let updated = 0;

  for (const slug of RAMADAN_2026_SLUGS) {
    const a = bySlug.get(slug);
    if (!a) {
      console.warn(`[ramadan-images] Missing article in DB: ${slug}`);
      continue;
    }

    const subtitle = a.category || 'Rehber';
    const html = buildHtml({ title: a.title, subtitle, slug });
    const outPath = resolve(OUT_DIR, `${slug}.png`);

    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(50);
    await page.screenshot({ path: outPath, type: 'png', fullPage: false });
    generated++;
    console.log(`[ramadan-images] Generated ${outPath}`);

    if (!apply || !cloudinary) continue;

    const uploadResult = await cloudinary.uploader.upload(outPath, {
      resource_type: 'image',
      folder: 'articles/ramazan-2026',
      public_id: slug,
      tags: ['ramazan-2026', 'article', 'og', 'featured', 'template'],
      overwrite: true,
    });
    uploaded++;
    console.log(`[ramadan-images] Uploaded ${uploadResult.public_id}`);

    // Track media asset (best effort)
    let mediaAssetId: string | null = null;
    try {
      const { data: mediaAsset, error: mediaErr } = await supabase
        .from('media_assets')
        .upsert(
          {
            cloudinary_public_id: uploadResult.public_id,
            cloudinary_url: uploadResult.url,
            cloudinary_secure_url: uploadResult.secure_url,
            asset_type: 'blog_image',
            entity_type: 'article',
            entity_id: a.id,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
            bytes: uploadResult.bytes,
            alt_text: a.title,
            alt_text_generated: false,
            title: a.title,
            ai_generated: false,
            usage_count: 1,
            last_used_at: new Date().toISOString(),
            // Optional normalized columns (if present)
            provider: 'cloudinary',
            public_id: uploadResult.public_id,
            secure_url: uploadResult.secure_url,
          } as any,
          { onConflict: 'cloudinary_public_id' }
        )
        .select('id')
        .single();

      if (mediaErr) throw mediaErr;
      mediaAssetId = mediaAsset?.id || null;
    } catch (e: any) {
      console.warn(`[ramadan-images] media_assets upsert skipped: ${e?.message || e}`);
    }

    const updatePayload: any = {
      featured_image: uploadResult.public_id,
      updated_at: new Date().toISOString(),
    };
    if (mediaAssetId) updatePayload.featured_image_id = mediaAssetId;

    const { error: upErr } = await supabase.from('articles').update(updatePayload).eq('id', a.id);
    if (upErr) throw upErr;
    updated++;
  }

  await browser.close();

  console.log(
    `[ramadan-images] Done. generated=${generated}, uploaded=${uploaded}, updatedArticles=${updated}, mode=${apply ? 'APPLY' : 'DRY-RUN'}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
