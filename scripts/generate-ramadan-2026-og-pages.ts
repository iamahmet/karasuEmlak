/**
 * Generate branded OG images for key Ramadan 2026 pages (hub + tools) (non-AI template)
 *
 * Default: dry-run (generate local PNGs only)
 * Use --apply to upload to Cloudinary.
 *
 * Usage:
 *   pnpm tsx scripts/generate-ramadan-2026-og-pages.ts
 *   pnpm tsx scripts/generate-ramadan-2026-og-pages.ts --apply
 */

import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import * as dotenv from 'dotenv';
import { chromium } from 'playwright';
import { getCloudinaryClient } from '../packages/lib/cloudinary/client';

dotenv.config({ path: '.env.local' });

const OUT_DIR = resolve(process.cwd(), '.tmp/ramadan-2026-og-pages');

type OgPage = {
  publicId: string; // Cloudinary public_id
  title: string;
  subtitle: string;
  urlPath: string;
};

const PAGES: OgPage[] = [
  {
    publicId: 'og/ramazan-2026/hub',
    title: 'Ramazan 2026 Karasu Rehberleri',
    subtitle: 'İçerik Merkezi',
    urlPath: '/blog/ramazan-2026',
  },
  {
    publicId: 'og/ramazan-2026/karasu-ramazan-imsakiyesi',
    title: 'Sakarya Karasu Ramazan İmsakiyesi 2026',
    subtitle: 'İmsak ve İftar Vakitleri',
    urlPath: '/karasu/ramazan-imsakiyesi',
  },
  {
    publicId: 'og/ramazan-2026/karasu-iftara-kac-dakika-kaldi',
    title: 'Karasu İftara Kaç Dakika Kaldı?',
    subtitle: 'Canlı Geri Sayım',
    urlPath: '/karasu/iftara-kac-dakika-kaldi',
  },
];

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function buildHtml(params: { title: string; subtitle: string; urlPath: string }) {
  const title = escapeHtml(params.title);
  const subtitle = escapeHtml(params.subtitle);
  const urlPath = escapeHtml(params.urlPath);

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
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans";
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
        font-weight: 700;
        font-size: 14px;
        backdrop-filter: blur(10px);
      }
      .center { max-width: 1280px; }
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
        font-weight: 700;
        font-size: 16px;
      }
      .url {
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(0,0,0,0.18);
        border: 1px solid rgba(255,255,255,0.10);
      }
      .tag { display: inline-flex; gap: 10px; align-items: center; }
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
        <div class="sub">Paylaşım kartları için optimize OG görsel.</div>
      </div>

      <div class="bottom">
        <div class="tag"><span class="dot"></span><span>Rehber • Araç</span></div>
        <div class="url">karasuemlak.net${urlPath}</div>
      </div>
    </div>
  </body>
</html>`;
}

async function main() {
  const apply = process.argv.includes('--apply');
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1792, height: 1024, deviceScaleFactor: 2 } });

  const cloudinary = apply ? getCloudinaryClient() : null;

  let generated = 0;
  let uploaded = 0;

  for (const p of PAGES) {
    const html = buildHtml({ title: p.title, subtitle: p.subtitle, urlPath: p.urlPath });
    const outPath = resolve(OUT_DIR, `${p.publicId.replaceAll('/', '__')}.png`);

    await page.setContent(html, { waitUntil: 'load' });
    await page.waitForTimeout(50);
    await page.screenshot({ path: outPath, type: 'png', fullPage: false });
    generated++;
    console.log(`[ramadan-og] Generated ${outPath}`);

    if (!apply || !cloudinary) continue;

    // Ensure stable public_id including folder path.
    const folder = p.publicId.split('/').slice(0, -1).join('/');
    const public_id = p.publicId.split('/').slice(-1)[0];

    const res = await cloudinary.uploader.upload(outPath, {
      resource_type: 'image',
      folder,
      public_id,
      tags: ['ramazan-2026', 'og', 'template'],
      overwrite: true,
    });
    uploaded++;
    console.log(`[ramadan-og] Uploaded ${res.public_id}`);
  }

  await browser.close();
  console.log(`[ramadan-og] Done. generated=${generated}, uploaded=${uploaded}, mode=${apply ? 'APPLY' : 'DRY-RUN'}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

