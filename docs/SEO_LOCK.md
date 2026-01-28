# SEO Lock — Do Not Remove Verification and GA Tags

**CRITICAL:** The following SEO and analytics elements are required for production and must never be removed or renamed during refactors.

## 1. Google Search Console Verification

- **Meta tag (exact):**  
  `<meta name="google-site-verification" content="uNWMokv81E_cnHJl-FM-2QnAq3iQQ_uX2Kww-wZoWyA" />`
- **Source of truth:** `apps/web/lib/seo/constants.ts` → `GOOGLE_SITE_VERIFICATION`
- **Rendered in:** `apps/web/app/[locale]/layout.tsx` via `metadata.verification.google` (Next.js Metadata API)
- **Guards:** `scripts/check-seo-tags.ts`, `scripts/smoke-routes.ts` (CI)

## 2. Google Analytics 4 (GA4)

- **Measurement ID:** `G-EXFYWJWB5C`
- **Stream URL:** https://www.karasuemlak.net  
- **Stream name:** Karasu Emlak
- **Source of truth:** `apps/web/lib/seo/constants.ts` → `GA_MEASUREMENT_ID`
- **Rendered in:** `apps/web/app/[locale]/layout.tsx` via `GoogleAnalytics` component (`measurementId` prop)
- **Guards:** `scripts/check-seo-tags.ts`, `scripts/smoke-routes.ts` (CI)

## 3. Legacy Landing URLs (Indexed — Must Not 404)

These URLs are in the sitemap and may be indexed. They must always return **200** with correct content:

| Path | Purpose |
|------|--------|
| `/kiralik-daire` | Kiralık daire listing (propertyType=daire, status=kiralik) |
| `/satilik-daire` | Satılık daire listing (propertyType=daire, status=satilik) |
| `/karasu-kiralik-daire` | Karasu kiralık daire (Karasu + daire + kiralik) |
| `/karasu-satilik-daire` | Karasu satılık daire (Karasu + daire + satilik) |

- **Source of truth:** `apps/web/lib/seo/constants.ts` → `LEGACY_LANDING_PATHS`
- **Implementation:** Middleware rewrites `/path` → `/tr/path`. The static segment `app/tr/` requires explicit pages for these paths; they live under `app/tr/kiralik-daire/`, `app/tr/satilik-daire/`, `app/tr/karasu-kiralik-daire/`, `app/tr/karasu-satilik-daire/` and delegate to `app/[locale]/...` with `locale=tr`.
- **Guards:** `scripts/smoke-routes.ts` (CI), `pnpm smoke:web`

## Automated Checks

- **SEO tags in build output:** `pnpm tsx scripts/check-seo-tags.ts` (run after `pnpm build:web`; checks built HTML for verification meta and GA id).
- **Route regression (200 + tags in HTML):** `pnpm tsx scripts/smoke-routes.ts` (hits the 4 legacy URLs plus `/`, `/kiralik`, `/satilik`, `/blog` and asserts status 200 and required strings in body).

Do not remove or rename the verification/analytics constants or the legacy landing page files. Refactors that touch `app/[locale]/layout.tsx` or head management must preserve these tags and must pass the above scripts.
