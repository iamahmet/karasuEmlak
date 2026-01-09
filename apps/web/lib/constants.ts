/**
 * Application Constants
 * Centralized constants to avoid magic numbers and strings
 */

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  HOMEPAGE_DATA: 3000,
  LOCALE_MESSAGES: 2000,
  API_ROUTES: 10000,
  IMAGE_LOAD: 5000,
} as const;

// Limits
export const LIMITS = {
  LISTINGS_PER_PAGE: 18,
  ARTICLES_PER_PAGE: 12,
  NEWS_PER_PAGE: 10,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_SEARCH_RESULTS: 100,
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  CONTACT_FORM: { limit: 5, window: '10 m' },
  NEWSLETTER_SUBSCRIBE: { limit: 10, window: '1 h' },
  KVKK_APPLICATION: { limit: 3, window: '1 h' },
  LISTING_CREATE: { limit: 3, window: '24 h' },
  AI_IMAGE_GENERATION: { limit: 10, window: '1 h' },
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  STATIC_PAGES: 3600, // 1 hour
  DYNAMIC_CONTENT: 300, // 5 minutes
  API_RESPONSES: 60, // 1 minute
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 18,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Image Sizes
export const IMAGE_SIZES = {
  THUMBNAIL: { width: 300, height: 200 },
  CARD: { width: 400, height: 300 },
  HERO: { width: 1920, height: 1080 },
  LISTING_DETAIL: { width: 1200, height: 800 },
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Animation Durations (in milliseconds)
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const;

// Reading Time
export const READING_TIME = {
  WORDS_PER_MINUTE: 200,
} as const;
