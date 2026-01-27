#!/usr/bin/env tsx
/**
 * Smoke test for apps/web critical endpoints.
 * Run with dev server: pnpm dev:web (or start:web)
 * Then: BASE_URL=http://localhost:3000 pnpm tsx scripts/smoke-web.ts
 *
 * Fails if:
 * - status >= 500
 * - expectJson and content-type does not include application/json
 * - expectJson and body is not parseable JSON
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

const TRIM = 200;

interface Entry {
  name: string;
  method: "GET" | "POST";
  path: string;
  body?: string;
  expectJson: boolean;
}

const ENDPOINTS: Entry[] = [
  { name: "healthz", method: "GET", path: "/healthz", expectJson: true },
  { name: "api/health", method: "GET", path: "/api/health", expectJson: true },
  { name: "api/listings", method: "GET", path: "/api/listings?limit=2", expectJson: true },
  { name: "api/articles", method: "GET", path: "/api/articles?limit=2", expectJson: true },
  { name: "api/neighborhoods", method: "GET", path: "/api/neighborhoods", expectJson: true },
  { name: "api/faq", method: "GET", path: "/api/faq", expectJson: true },
  { name: "api/stats/listings", method: "GET", path: "/api/stats/listings", expectJson: true },
  { name: "api/notifications", method: "GET", path: "/api/notifications", expectJson: true },
  { name: "api/news", method: "GET", path: "/api/news?limit=2", expectJson: true },
  { name: "api/search/suggestions", method: "GET", path: "/api/search/suggestions?q=a", expectJson: true },
  { name: "api/pharmacies", method: "GET", path: "/api/pharmacies", expectJson: true },
  { name: "api/analytics/web-vitals GET", method: "GET", path: "/api/analytics/web-vitals", expectJson: true },
  {
    name: "api/analytics/web-vitals POST",
    method: "POST",
    path: "/api/analytics/web-vitals",
    body: JSON.stringify({ name: "FCP", value: 100, id: "smoke-1" }),
    expectJson: true,
  },
  { name: "api/dashboard/stats", method: "GET", path: "/api/dashboard/stats", expectJson: true },
  { name: "homepage", method: "GET", path: "/", expectJson: false },
];

async function run() {
  console.log("Smoke test for apps/web");
  console.log("BASE_URL:", BASE);
  console.log("");

  let failed = 0;

  for (const e of ENDPOINTS) {
    const url = `${BASE}${e.path}`;
    try {
      const res = await fetch(url, {
        method: e.method,
        headers: e.body ? { "Content-Type": "application/json" } : {},
        body: e.body,
      });
      const ct = res.headers.get("content-type") || "";
      const text = await res.text();
      const preview = text.slice(0, TRIM).replace(/\s+/g, " ");

      let ok = true;
      if (res.status >= 500) {
        console.log(`[FAIL] ${e.name}: HTTP ${res.status} (5xx)`);
        failed++;
        ok = false;
      }
      if (e.expectJson) {
        if (!ct.toLowerCase().includes("application/json")) {
          console.log(`[FAIL] ${e.name}: expected JSON, content-type=${ct.slice(0, 60)}`);
          failed++;
          ok = false;
        } else {
          try {
            JSON.parse(text);
          } catch {
            console.log(`[FAIL] ${e.name}: invalid JSON`);
            failed++;
            ok = false;
          }
        }
      }

      if (ok) {
        console.log(`[OK]   ${e.name}: ${res.status} | ${ct.slice(0, 40)} | ${preview.slice(0, 80)}...`);
      } else {
        console.log(`       → ${preview.slice(0, 120)}`);
      }
    } catch (err: any) {
      console.log(`[FAIL] ${e.name}: ${err?.message || err}`);
      failed++;
    }
  }

  console.log("");
  console.log(failed === 0 ? "All checks passed." : `Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
