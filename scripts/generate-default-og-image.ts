#!/usr/bin/env tsx
/**
 * Generate default site OG image and write to `apps/web/public/og-image.jpg`.
 *
 * Why: Many pages use `${siteConfig.url}/og-image.jpg` as a safe fallback. This file must exist.
 *
 * Run:
 *   pnpm tsx scripts/generate-default-og-image.ts
 */

import { mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';

const OUT_JPG = resolve(process.cwd(), 'apps/web/public/og-image.jpg');
const OUT_PNG = resolve(process.cwd(), 'apps/web/public/og-image.png');
const TMP_DIR = resolve(process.cwd(), '.tmp/og');
const TMP_PNG = resolve(TMP_DIR, 'og-image.png');

function buildHtml() {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      :root {
        --bg1: #061329;
        --bg2: #0b2a4a;
        --accent: #006AFF;
        --accent2: #00A862;
        --text: #f8fafc;
        --muted: rgba(248,250,252,0.82);
      }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 1200px; height: 630px; }
      body {
        background:
          radial-gradient(820px 480px at 12% 25%, rgba(0,106,255,0.34), transparent 60%),
          radial-gradient(760px 420px at 88% 78%, rgba(0,168,98,0.22), transparent 60%),
          linear-gradient(135deg, var(--bg1), var(--bg2));
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, "Noto Sans";
        color: var(--text);
        position: relative;
        overflow: hidden;
      }
      .grain {
        position: absolute; inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.18'/%3E%3C/svg%3E");
        opacity: .28;
        mix-blend-mode: overlay;
        pointer-events: none;
      }
      .wrap {
        height: 100%;
        padding: 64px 72px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        font-weight: 800;
        letter-spacing: .2px;
      }
      .logo {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        background: linear-gradient(135deg, rgba(0,106,255,0.95), rgba(0,168,98,0.85));
        box-shadow: 0 14px 34px rgba(0,0,0,0.28);
      }
      .kicker {
        margin-top: 18px;
        color: rgba(248,250,252,0.88);
        font-weight: 700;
        letter-spacing: .18em;
        text-transform: uppercase;
        font-size: 13px;
      }
      h1 {
        margin: 10px 0 0 0;
        font-size: 60px;
        line-height: 1.06;
        letter-spacing: -0.02em;
        text-wrap: balance;
        max-width: 920px;
      }
      .sub {
        margin-top: 18px;
        font-size: 20px;
        line-height: 1.45;
        color: var(--muted);
        max-width: 860px;
      }
      .bottom {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        color: rgba(248,250,252,0.78);
        font-weight: 600;
        font-size: 15px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.14);
        backdrop-filter: blur(10px);
      }
      .url {
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(0,0,0,0.18);
        border: 1px solid rgba(255,255,255,0.10);
      }
      .dot {
        width: 8px; height: 8px; border-radius: 999px;
        background: var(--accent);
        box-shadow: 0 0 0 6px rgba(0,106,255,0.18);
      }
    </style>
  </head>
  <body>
    <div class="grain"></div>
    <div class="wrap">
      <div>
        <div class="brand">
          <div class="logo"></div>
          <div>Karasu Emlak</div>
        </div>
        <div class="kicker">Sakarya • Karasu</div>
        <h1>Satilik ve Kiralik Ilanlar, Rehberler ve Piyasa Notlari</h1>
        <div class="sub">Daire, villa, yazlik ve arsa ilanlari. Karasu ve cevresi icin pratik emlak rehberi.</div>
      </div>
      <div class="bottom">
        <div class="pill"><span class="dot"></span><span>www.karasuemlak.net</span></div>
        <div class="url">/satilik  •  /kiralik  •  /blog</div>
      </div>
    </div>
  </body>
</html>`;
}

async function main() {
  if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });

  await page.setContent(buildHtml(), { waitUntil: 'load' });
  await page.waitForTimeout(50);
  await page.screenshot({ path: TMP_PNG, type: 'png', fullPage: false });
  await browser.close();

  // Keep PNG too (useful for debugging and some scrapers).
  execSync(`cp \"${TMP_PNG}\" \"${OUT_PNG}\"`);

  // Convert to JPG for backwards compatibility with existing meta references.
  execSync(`sips -s format jpeg \"${TMP_PNG}\" --out \"${OUT_JPG}\" >/dev/null`);

  console.log(`[og-image] wrote ${OUT_JPG}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

