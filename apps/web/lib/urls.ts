import { headers } from "next/headers";

/**
 * Server-side base URL for canonical links, sitemaps, OG, etc.
 * Prefer NEXT_PUBLIC_SITE_URL; fallback to host + x-forwarded-proto.
 * Client: always use relative URLs for /api/* (e.g. fetch("/api/health")).
 */
export async function getBaseUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (env) {
    const u = env.startsWith("http") ? env : `https://${env}`;
    return u.replace(/\/$/, "");
  }
  try {
    const h = await headers();
    const host = h.get("host") || "localhost:3000";
    const proto = h.get("x-forwarded-proto") || "http";
    return `${proto}://${host}`;
  } catch {
    return "https://karasuemlak.net";
  }
}
