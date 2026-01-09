/**
 * Cookie Types and Categories
 * KVKK and GDPR compliant cookie classification
 */

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'functional';

export interface CookieInfo {
  name: string;
  category: CookieCategory;
  purpose: string;
  duration: string;
  provider: string;
  providerUrl?: string;
  dataCollected: string[];
  isThirdParty: boolean;
}

/**
 * Cookie Inventory - All cookies used on the site
 */
export const COOKIE_INVENTORY: CookieInfo[] = [
  // Necessary Cookies (Always Active)
  {
    name: 'cookie-consent',
    category: 'necessary',
    purpose: 'Kullanıcının çerez tercihlerini saklamak için kullanılır.',
    duration: '1 yıl',
    provider: 'Karasu Emlak',
    dataCollected: ['Çerez tercihleri'],
    isThirdParty: false,
  },
  {
    name: 'theme-preference',
    category: 'necessary',
    purpose: 'Kullanıcının tema tercihini (açık/koyu mod) saklamak için kullanılır.',
    duration: 'Kalıcı',
    provider: 'Karasu Emlak',
    dataCollected: ['Tema tercihi'],
    isThirdParty: false,
  },
  {
    name: 'favorites',
    category: 'necessary',
    purpose: 'Kullanıcının favori ilanlarını saklamak için kullanılır.',
    duration: 'Kalıcı',
    provider: 'Karasu Emlak',
    dataCollected: ['Favori ilan ID\'leri'],
    isThirdParty: false,
  },
  {
    name: 'comparison',
    category: 'necessary',
    purpose: 'Kullanıcının karşılaştırma listesini saklamak için kullanılır.',
    duration: 'Oturum',
    provider: 'Karasu Emlak',
    dataCollected: ['Karşılaştırma listesi'],
    isThirdParty: false,
  },

  // Analytics Cookies (Requires Consent)
  {
    name: '_ga',
    category: 'analytics',
    purpose: 'Google Analytics tarafından kullanıcıları ayırt etmek için kullanılır.',
    duration: '2 yıl',
    provider: 'Google Analytics',
    providerUrl: 'https://analytics.google.com',
    dataCollected: ['Anonim kullanıcı ID', 'Ziyaret sayısı', 'İlk ziyaret zamanı'],
    isThirdParty: true,
  },
  {
    name: '_ga_*',
    category: 'analytics',
    purpose: 'Google Analytics 4 tarafından kullanıcıları ve oturumları ayırt etmek için kullanılır.',
    duration: '2 yıl',
    provider: 'Google Analytics',
    providerUrl: 'https://analytics.google.com',
    dataCollected: ['Anonim kullanıcı ID', 'Oturum bilgileri'],
    isThirdParty: true,
  },
  {
    name: '_gid',
    category: 'analytics',
    purpose: 'Google Analytics tarafından kullanıcıları ayırt etmek için kullanılır.',
    duration: '24 saat',
    provider: 'Google Analytics',
    providerUrl: 'https://analytics.google.com',
    dataCollected: ['Anonim kullanıcı ID'],
    isThirdParty: true,
  },
  {
    name: '_gat',
    category: 'analytics',
    purpose: 'Google Analytics tarafından istek hızını sınırlamak için kullanılır.',
    duration: '1 dakika',
    provider: 'Google Analytics',
    providerUrl: 'https://analytics.google.com',
    dataCollected: ['İstek hızı'],
    isThirdParty: true,
  },
  {
    name: 'clarity.ms',
    category: 'analytics',
    purpose: 'Microsoft Clarity tarafından kullanıcı davranışlarını analiz etmek için kullanılır.',
    duration: '1 yıl',
    provider: 'Microsoft Clarity',
    providerUrl: 'https://clarity.microsoft.com',
    dataCollected: ['Sayfa görüntülemeleri', 'Tıklama verileri', 'Scroll derinliği', 'Oturum kayıtları'],
    isThirdParty: true,
  },
  {
    name: '_vercel_analytics',
    category: 'analytics',
    purpose: 'Vercel Analytics tarafından performans metriklerini toplamak için kullanılır.',
    duration: '1 yıl',
    provider: 'Vercel',
    providerUrl: 'https://vercel.com/analytics',
    dataCollected: ['Sayfa görüntülemeleri', 'Performans metrikleri', 'Web Vitals'],
    isThirdParty: true,
  },
];

/**
 * Get cookies by category
 */
export function getCookiesByCategory(category: CookieCategory): CookieInfo[] {
  return COOKIE_INVENTORY.filter(cookie => cookie.category === category);
}

/**
 * Get third-party cookies
 */
export function getThirdPartyCookies(): CookieInfo[] {
  return COOKIE_INVENTORY.filter(cookie => cookie.isThirdParty);
}

/**
 * Get necessary cookies (always active)
 */
export function getNecessaryCookies(): CookieInfo[] {
  return getCookiesByCategory('necessary');
}

/**
 * Get analytics cookies
 */
export function getAnalyticsCookies(): CookieInfo[] {
  return getCookiesByCategory('analytics');
}

/**
 * Cookie category labels in Turkish
 */
export const COOKIE_CATEGORY_LABELS: Record<CookieCategory, string> = {
  necessary: 'Zorunlu Çerezler',
  analytics: 'Analitik Çerezler',
  marketing: 'Pazarlama Çerezleri',
  functional: 'İşlevsel Çerezler',
};

/**
 * Cookie category descriptions
 */
export const COOKIE_CATEGORY_DESCRIPTIONS: Record<CookieCategory, string> = {
  necessary: 'Web sitesinin temel işlevlerini sağlamak için gerekli çerezler. Bu çerezler olmadan site düzgün çalışmaz.',
  analytics: 'Web sitesinin nasıl kullanıldığını anlamak için kullanılan çerezler. Bu çerezler sayesinde site performansını iyileştirebiliriz.',
  marketing: 'Size özel reklamlar göstermek ve pazarlama kampanyalarını optimize etmek için kullanılan çerezler.',
  functional: 'Kullanıcı tercihlerini hatırlamak ve gelişmiş özellikler sunmak için kullanılan çerezler.',
};

