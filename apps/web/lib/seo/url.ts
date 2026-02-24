const DEFAULT_SITE_URL = 'https://www.karasuemlak.net';

function normalizeSiteUrl(value?: string | null): string {
  const candidate = (value || '').trim() || DEFAULT_SITE_URL;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return DEFAULT_SITE_URL;
    }
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrl(siteUrl?: string | null): string {
  return normalizeSiteUrl(siteUrl || process.env.NEXT_PUBLIC_SITE_URL);
}

export function isValidHttpUrl(value: unknown): value is string {
  if (!value || typeof value !== 'string') return false;

  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function toAbsoluteSiteUrl(pathOrUrl: string, siteUrl?: string | null): string {
  const base = getSiteUrl(siteUrl);
  const value = (pathOrUrl || '').trim();

  if (!value) {
    return base;
  }

  if (/^https?:\/\//i.test(value) && isValidHttpUrl(value)) {
    return value;
  }

  try {
    return new URL(value.startsWith('/') ? value : `/${value}`, `${base}/`).toString();
  } catch {
    return base;
  }
}

export function getOgLocale(locale: string): string {
  switch (locale) {
    case 'en':
      return 'en_US';
    case 'et':
      return 'et_EE';
    case 'ru':
      return 'ru_RU';
    case 'ar':
      return 'ar_SA';
    case 'tr':
    default:
      return 'tr_TR';
  }
}

export function getSchemaLanguage(locale: string): string {
  switch (locale) {
    case 'en':
      return 'en-US';
    case 'et':
      return 'et-EE';
    case 'ru':
      return 'ru-RU';
    case 'ar':
      return 'ar-SA';
    case 'tr':
    default:
      return 'tr-TR';
  }
}
