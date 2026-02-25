#!/usr/bin/env tsx
/**
 * Verify required DB objects for apps/web. Uses service role.
 * Exits 0 if all exist and visible; 1 if any missing or stale.
 * Run in CI or prebuild: pnpm db:verify-schema
 *
 * For STALE (PGRST205): run pnpm supabase:reload-postgrest
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

const envPaths = [
  resolve(process.cwd(), ".env.local"),
  resolve(process.cwd(), "apps/web/.env.local"),
  resolve(__dirname, "../../.env.local"),
];
for (const p of envPaths) {
  try {
    dotenv.config({ path: p });
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) break;
  } catch {}
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const CRITICAL = [
  "articles",
  "listings",
  "authors",
  "news_articles",
  "neighborhoods",
  "seo_events",
  "content_comments",
  "pharmacies",
  "notifications",
  "categories",
] as const;

type Status = "ok" | "missing" | "stale";

async function check(table: string): Promise<Status> {
  const { error } = await supabase.from(table).select("id").limit(0);
  if (!error) return "ok";
  const code = (error as { code?: string }).code;
  const msg = (error as { message?: string }).message || "";
  if (code === "PGRST205" || code === "PGRST202" || /schema cache is stale/i.test(msg)) return "stale";
  if (code === "PGRST116" || code === "42P01" || /does not exist/i.test(msg)) return "missing";
  return "stale";
}

async function main() {
  const missing: string[] = [];
  const stale: string[] = [];
  for (const t of CRITICAL) {
    const s = await check(t);
    if (s === "missing") missing.push(t);
    else if (s === "stale") stale.push(t);
  }
  if (missing.length) console.log("MISSING:", missing.join(", "));
  if (stale.length) {
    console.log("STALE (run pnpm supabase:reload-postgrest):", stale.join(", "));
  }
  if (missing.length || stale.length) process.exit(1);
  console.log("All critical tables present and visible.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
