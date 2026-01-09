import { siteConfig, type RtlLocale } from '@karasu-emlak/config';

/**
 * Check if a locale is RTL (Right-to-Left)
 */
export function isRTL(locale: string): boolean {
  return (siteConfig.rtlLocales as readonly string[]).includes(locale);
}

/**
 * Get text direction for a locale
 */
export function getTextDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Get HTML dir attribute for a locale
 */
export function getDirAttribute(locale: string): string {
  return getTextDirection(locale);
}

