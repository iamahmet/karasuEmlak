# 404/500 Endpoint Map and Fixes

## Summary of fixes

### (a) Analytics JSON — web-vitals

| Item | Change |
|------|--------|
| **Route** | `app/api/analytics/web-vitals/route.ts` |
| **Fixes** | Handler wrapped in try/catch. Always returns JSON or 204. On error: `200` + `{ ok: false, error, requestId }`. Invalid payload (Zod): `204`. |
| **Zod** | `WebVitalsPayloadSchema`: requires `value` (number) and `name` or `metric`. |
| **Client** | `lib/analytics/report-web-vital.ts`: `reportWebVitalToApi()`. Uses `res.text()` then checks `content-type` before any `JSON.parse`. If not `application/json`, logs in dev and returns. Used by `WebVitals.tsx`, `enhanced-monitoring.ts`, `monitoring.ts`. |

### (b) Routing / baseURL / locale

| Item | Change |
|------|--------|
| **API and locale** | Middleware: `pathname.startsWith('/api')` → `NextResponse.next()`. `/api/*` is never prefixed with locale. |
| **Matcher** | `(?!api|_next|_vercel|.*\..*)` so `/api/*` is not run through intl. |
| **Base URL** | `lib/urls.ts`: `getBaseUrl()` (server). Use for canonical, sitemap, OG. Client: use **relative** `/api/...` (e.g. `fetch("/api/health")`). |
| **Internal server→self** | For server-side `fetch(`${base}/api/...`)` prefer `getBaseUrl()` or `NEXT_PUBLIC_SITE_URL`. Avoid hardcoded `localhost:3000`. |

### (c) Supabase schema and PostgREST

| Item | Change |
|------|--------|
| **PGRST205 / stale cache** | `lib/supabase/with-postgrest-retry.ts`: `withPostgRESTRetry(fn)`. Retries once after 2s on PGRST205 or “schema cache is stale”. Use for critical server reads. |
| **Reload (local)** | `pnpm supabase:reload-postgrest` → `scripts/supabase/reload-postgrest.ts`. Tries RPC `pgrst_reload_schema`, then NOTIFY. For **local**: `pnpm supabase:stop` then `pnpm supabase:start` to restart PostgREST. |
| **Reload (remote)** | If RPC/NOTIFY fails: Supabase Dashboard → SQL Editor → `NOTIFY pgrst, 'reload schema';` |
| **Verify schema** | `pnpm db:verify-schema` → `scripts/db/verify-schema.ts`. Checks: articles, listings, authors, news_articles, neighborhoods, seo_events, pharmacies, notifications, categories. Exits 1 on MISSING or STALE. |
| **Full introspection** | `pnpm db:verify` → `scripts/db/introspect-postgrest.ts`. Broader list including `seo_events`. |

---

## Smoke test

```bash
pnpm dev:web   # in one terminal
BASE_URL=http://localhost:3000 pnpm smoke:web
```

Expect: all `[OK]` for the 15 endpoints. Fail if: 5xx, or `expectJson` but `content-type` not `application/json`, or invalid JSON.

---

## Endpoints covered by smoke

| Endpoint | Method | Expect JSON |
|----------|--------|-------------|
| /healthz | GET | yes |
| /api/health | GET | yes |
| /api/listings?limit=2 | GET | yes |
| /api/articles?limit=2 | GET | yes |
| /api/neighborhoods | GET | yes |
| /api/faq | GET | yes |
| /api/stats/listings | GET | yes |
| /api/notifications | GET | yes |
| /api/news?limit=2 | GET | yes |
| /api/search/suggestions?q=a | GET | yes |
| /api/pharmacies | GET | yes |
| /api/analytics/web-vitals | GET | yes |
| /api/analytics/web-vitals | POST | yes |
| /api/dashboard/stats | GET | yes |
| / | GET | no (HTML) |

---

## Known schema-dependent endpoints

- **api/notifications** — PGRST205 / PGRST202 / “schema cache” / “could not find the table” return 200 with `{ notifications: [] }` (no 500).
- **api/faq** — uses `qa_entries`; if missing or PGRST205 returns 200 with `data: []`.
- **qa_entries** — optional for `db:verify-schema`; add to `CRITICAL` in `scripts/db/verify-schema.ts` if required.

## Vercel

- **CRON_SECRET**: trim whitespace; use `printf` when adding. No `echo`.
- **Required (apps/web)**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (or `VERCEL_URL`), and any used by APIs (Resend, etc.).

---

## Commits (suggested grouping)

1. **Analytics JSON**: web-vitals route (Zod, requestId, 204, ok/error); `report-web-vital.ts`; WebVitals, enhanced-monitoring, monitoring.
2. **Routing / baseURL / locale**: `lib/urls.ts`; middleware/API behavior confirmed; doc updates.
3. **Supabase**: `with-postgrest-retry.ts`; `reload-postgrest` remote/local notes; `verify-schema.ts`; `seo_events` in introspect/reload; `reload-supabase-schema` fix.
