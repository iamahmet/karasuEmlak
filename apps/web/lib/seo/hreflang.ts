import { routing } from '@/i18n/routing';

/**
 * Filters a `languages` map used by Next.js Metadata alternates so it only contains
 * currently active locales (plus optional `x-default`).
 *
 * This prevents publishing hreflang links for inactive locales (e.g. /en) which
 * would otherwise be redirected to / and can confuse indexing.
 */
export function pruneHreflangLanguages(languages: Record<string, string>) {
  const allowed = new Set<string>([...routing.locales, 'x-default']);
  const pruned: Record<string, string> = {};

  for (const [key, value] of Object.entries(languages)) {
    if (!value) continue;
    if (allowed.has(key)) pruned[key] = value;
  }

  // Ensure x-default exists and points to default locale URL.
  if (!pruned['x-default']) {
    const def = routing.defaultLocale;
    if (languages[def]) pruned['x-default'] = languages[def];
  }

  return pruned;
}

