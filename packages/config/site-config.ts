/**
 * Site-wide configuration
 * Centralized configuration for the entire application
 */

export const siteConfig = {
  name: 'Karasu Emlak',
  description: 'Karasu emlak danışmanlığı - Satılık ve kiralık gayrimenkul ilanları',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karasuemlak.net',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/karasuemlak',
    github: 'https://github.com/iamahmet/karasuEmlak',
  },
  // NAP (Name, Address, Phone)
  nap: {
    name: 'Karasu Emlak',
    address: 'Merkez Mahallesi, Atatürk Caddesi No:123, 54500 Karasu / Sakarya',
    phone: '+905466395461',
    email: 'info@karasuemlak.net',
  },
  // Supported locales
  locales: ['tr', 'en', 'et', 'ru', 'ar'] as const,
  defaultLocale: 'tr' as const,
  // RTL languages
  rtlLocales: ['ar'] as const,
} as const;

export type Locale = (typeof siteConfig.locales)[number];
export type RtlLocale = (typeof siteConfig.rtlLocales)[number];

