/**
 * SEO & Analytics Constants — IMMUTABLE
 *
 * DO NOT REMOVE OR RENAME. These values are required for:
 * - Google Search Console verification (meta tag)
 * - Google Analytics 4 measurement
 *
 * See: docs/SEO_LOCK.md
 * CI: scripts/check-seo-tags.ts, scripts/smoke-routes.ts
 */

/** Google Search Console verification meta content. Must appear in <head> on all public pages. */
export const GOOGLE_SITE_VERIFICATION =
  'uNWMokv81E_cnHJl-FM-2QnAq3iQQ_uX2Kww-wZoWyA';

/** GA4 Measurement ID. Stream: https://www.karasuemlak.net, Name: Karasu Emlak */
export const GA_MEASUREMENT_ID = 'G-EXFYWJWB5C';

/** Legacy / indexed URLs that must always return 200. Used by smoke-routes and sitemap. */
export const LEGACY_LANDING_PATHS = [
  '/kiralik-daire',
  '/satilik-daire',
  '/karasu-kiralik-daire',
  '/karasu-satilik-daire',
] as const;
