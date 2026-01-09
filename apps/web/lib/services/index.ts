/**
 * External API Services
 * Centralized exports for all external API services
 */

export * from './weather';
export * from './currency';
export * from './geocoding';
export * from './quotes';
export * from './ip-geolocation';
export * from './holidays';
export * from './qr-code';
export * from './email-validation';
export * from './phone-validation';
export * from './timezone';
export * from './news';
export * from './seo-keywords';
export * from './serp-tracking';
export * from './backlinks';
export * from './content-optimization';
export * from './images';
export {
  getGoogleAutocompleteSuggestions,
  estimateKeywordDifficulty,
  estimateSearchVolume,
  analyzeKeyword,
  generateSEOTitleSuggestions,
  generateMetaDescriptionSuggestions,
  type SEOAnalysis,
} from './seo-enhanced';
export * from './social-sharing';
export {
  type ContentSuggestion,
  calculateReadabilityScore,
  analyzeKeywordDensity,
  analyzeContent,
  generateRelatedContentSuggestions,
  type SEOOptimization,
  optimizeContentForSEO,
} from './content-enrichment';
export * from './article-recommendations';
export * from './content-quality';
