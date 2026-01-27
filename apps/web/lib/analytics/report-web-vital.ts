/**
 * Safe client-side reporter for /api/analytics/web-vitals.
 * - Uses res.text() then checks content-type before any JSON.parse.
 * - If content-type is not application/json, logs in dev and returns (no throw).
 * - Never throws; analytics are non-critical.
 */
import { safeJsonParse } from '@/lib/utils/safeJsonParse';

export function reportWebVitalToApi(payload: Record<string, unknown>): void {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  fetch("/api/analytics/web-vitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then(async (res) => {
      if (!res.ok) return;
      const ct = res.headers.get("content-type") || "";
      if (!ct.toLowerCase().includes("application/json")) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[WebVitals] response not JSON, content-type:", ct.slice(0, 50));
        }
        return;
      }
      const text = await res.text();
      safeJsonParse(text, null, { context: 'report-web-vital', dedupeKey: 'report-web-vital' });
    })
    .catch(() => {
      // network or other; ignore
    });
}
