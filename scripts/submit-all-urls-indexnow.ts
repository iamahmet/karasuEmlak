#!/usr/bin/env npx tsx
/**
 * Submit All Published URLs to IndexNow + Sitemap Ping
 * Run: npx tsx scripts/submit-all-urls-indexnow.ts
 */

import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });
config({ path: path.resolve(process.cwd(), "apps/web/.env.local") });
config({ path: path.resolve(process.cwd(), "apps/admin/.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || "81247120299b0627693409d15e8a8300";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function main() {
  console.log("=== IndexNow + Sitemap Ping Script ===\n");
  console.log("Site URL:", SITE_URL);
  console.log("IndexNow Key:", INDEXNOW_KEY.substring(0, 8) + "...");

  // 1. Fetch all published articles from Supabase
  console.log("\n[1/4] Fetching published articles...");
  const articlesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/articles?status=eq.published&select=slug,published_at&order=published_at.desc`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!articlesRes.ok) {
    console.error("Failed to fetch articles:", articlesRes.status, await articlesRes.text());
    process.exit(1);
  }

  const articles: Array<{ slug: string; published_at: string }> = await articlesRes.json();
  console.log(`Found ${articles.length} published articles`);

  // 2. Build URL list
  const blogUrls = articles.map((a) => `/blog/${a.slug}`);

  const staticUrls = [
    "/",
    "/satilik",
    "/kiralik",
    "/karasu",
    "/blog",
    "/satilik-daire",
    "/satilik-villa",
    "/satilik-yazlik",
    "/satilik-ev",
    "/satilik-arsa",
    "/kiralik-daire",
    "/kiralik-ev",
    "/kiralik-villa",
    "/karasu-satilik-daire",
    "/karasu-satilik-villa",
    "/karasu-satilik-yazlik",
    "/karasu-kiralik-daire",
    "/karasu-kiralik-ev",
    "/karasu-satilik-ev",
    "/karasu-satilik-ev-fiyatlari",
    "/karasu-emlak-rehberi",
    "/karasu-yatirimlik-gayrimenkul",
    "/karasu-deprem",
    "/karasu-ucuz-satilik-daire",
    "/karasu-denize-sifir-satilik-daire",
    "/karasu-asansorlu-satilik-daire",
    "/hakkimizda",
    "/iletisim",
    "/sss",
    "/yatirim-hesaplayici",
    "/kredi-hesaplayici",
  ];

  const allUrls = [...staticUrls, ...blogUrls];
  const absoluteUrls = allUrls.map((u) => `${SITE_URL.replace(/\/$/, "")}${u}`);

  console.log(`Total URLs to submit: ${absoluteUrls.length}`);

  // 3. Submit to IndexNow (max 10000 per batch)
  console.log("\n[2/4] Submitting to IndexNow...");
  const host = new URL(SITE_URL).hostname;
  const batchSize = 500;

  let totalSubmitted = 0;
  for (let i = 0; i < absoluteUrls.length; i += batchSize) {
    const batch = absoluteUrls.slice(i, i + batchSize);
    try {
      const res = await fetch("https://api.indexnow.org/IndexNow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host,
          key: INDEXNOW_KEY,
          keyLocation: `${SITE_URL.replace(/\/$/, "")}/${INDEXNOW_KEY}.txt`,
          urlList: batch,
        }),
      });

      if (res.ok || res.status === 200 || res.status === 202) {
        totalSubmitted += batch.length;
        console.log(`  Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} URLs submitted (${res.status})`);
      } else {
        const text = await res.text();
        console.warn(`  Batch ${Math.floor(i / batchSize) + 1}: Failed (${res.status}) - ${text}`);
      }
    } catch (err: any) {
      console.warn(`  Batch ${Math.floor(i / batchSize) + 1}: Error -`, err.message);
    }
  }
  console.log(`IndexNow: ${totalSubmitted}/${absoluteUrls.length} URLs submitted`);

  // 4. Ping sitemap to Google and Bing
  console.log("\n[3/4] Pinging sitemap to search engines...");
  const sitemapUrl = `${SITE_URL.replace(/\/$/, "")}/sitemap.xml`;
  const pingEndpoints = [
    { name: "Google", url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
    { name: "Bing", url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
  ];

  for (const endpoint of pingEndpoints) {
    try {
      const res = await fetch(endpoint.url);
      console.log(`  ${endpoint.name}: ${res.ok ? "OK" : res.status}`);
    } catch (err: any) {
      console.warn(`  ${endpoint.name}: Failed -`, err.message);
    }
  }

  // 5. Summary
  console.log("\n[4/4] Summary");
  console.log("=".repeat(50));
  console.log(`Static pages submitted:  ${staticUrls.length}`);
  console.log(`Blog articles submitted: ${blogUrls.length}`);
  console.log(`Total URLs:              ${absoluteUrls.length}`);
  console.log(`IndexNow submitted:      ${totalSubmitted}`);
  console.log(`Sitemap pinged:          Google + Bing`);
  console.log("=".repeat(50));
  console.log("\nDone! Search engines will crawl these URLs faster now.");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
