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

These URLs are in the sitemap and may be indexed. They must always return **200** with correct content. Each has an `app/tr/<path>/page.tsx` that delegates to `app/[locale]/<path>/page.tsx` with `locale=tr`.

**Property-type & location pages (ev, villa, yazlık, arsa, daire, Karasu, Kocaali):**

- `/kiralik-daire`, `/satilik-daire`, `/kiralik-ev`, `/satilik-ev`, `/kiralik-villa`, `/satilik-villa`, `/satilik-yazlik`, `/satilik-arsa`
- `/karasu`, `/karasu-satilik-ev`, `/karasu-kiralik-ev`, `/karasu-satilik-daire`, `/karasu-kiralik-daire`, `/karasu-satilik-villa`, `/karasu-satilik-yazlik`
- `/karasu-satilik-ev-fiyatlari`, `/karasu-emlak-rehberi`, `/karasu-denize-yakin-satilik-ev`, `/karasu-yatirimlik-satilik-ev`, `/karasu-merkez-satilik-ev`, `/karasu-mustakil-satilik-ev`, `/karasu-emlak-ofisi`, `/karasu-vs-kocaali-satilik-ev`, `/karasu-vs-kocaali-yatirim`, `/karasu-vs-kocaali-yasam`, `/karasu-yatirimlik-gayrimenkul`, `/karasu-denize-sifir-satilik-daire`, `/karasu-asansorlu-satilik-daire`, `/karasu-ucuz-satilik-daire`, `/karasu-satilik-evler`, `/karasu-deprem`, `/karasu-mahalleler`, `/karasuspor`
- `/kocaali-satilik-ev`, `/kocaali-satilik-ev-fiyatlari`, `/kocaali-emlak-rehberi`, `/kocaali-yatirimlik-gayrimenkul`
- `/sakarya-emlak-yatirim-rehberi`

- **Source of truth:** `apps/web/lib/seo/constants.ts` → `LEGACY_LANDING_PATHS`
- **Implementation:** Middleware rewrites `/path` → `/tr/path`. The static segment `app/tr/` requires explicit pages; each lives under `app/tr/<path>/page.tsx` and delegates to `app/[locale]/<path>/page.tsx` with `locale=tr`.
- **Guards:** `scripts/smoke-routes.ts` (CI), `pnpm smoke:web`

## Automated Checks

- **SEO tags:** `pnpm tsx scripts/check-seo-tags.ts` (checks HTML for verification meta and GA id).
- **Route regression:** `pnpm tsx scripts/smoke-routes.ts` (hits legacy URLs + `/`, `/kiralik`, `/satilik`, `/blog`; asserts 200 and SEO tags in body).

Do not remove or rename the verification/analytics constants or the legacy landing page files. Refactors that touch `app/[locale]/layout.tsx` or head management must preserve these tags and must pass the above scripts.
