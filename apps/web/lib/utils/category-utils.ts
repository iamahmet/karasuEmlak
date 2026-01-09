/**
 * Category utility functions for blog categories
 * Handles category name normalization and slug generation
 */

/**
 * Standard blog categories
 */
export const STANDARD_CATEGORIES = [
  'Yatırım',
  'Sağlık',
  'Emlak',
  'Rehber',
  'Piyasa Analizi',
  'Mahalle Rehberi',
  'Haberler',
] as const;

export type StandardCategory = typeof STANDARD_CATEGORIES[number];

/**
 * Normalize category name (trim, capitalize first letter)
 */
export function normalizeCategoryName(category: string | null | undefined): string | null {
  if (!category) return null;
  
  // Trim whitespace
  const trimmed = category.trim();
  if (!trimmed) return null;
  
  // Capitalize first letter, lowercase rest
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

/**
 * Generate slug from category name
 */
export function categoryToSlug(category: string | null | undefined): string {
  if (!category) return '';
  
  return category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-ğüşıöç]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert slug back to category name
 * Tries to match against standard categories first, then does fuzzy matching
 */
export function slugToCategoryName(slug: string): string | null {
  if (!slug) return null;
  
  const normalizedSlug = slug.toLowerCase().trim().replace(/%20/g, '-');
  
  // First, try exact match with standard categories
  for (const category of STANDARD_CATEGORIES) {
    if (categoryToSlug(category) === normalizedSlug) {
      return category;
    }
  }
  
  // Try case-insensitive match
  for (const category of STANDARD_CATEGORIES) {
    if (category.toLowerCase() === normalizedSlug.replace(/-/g, ' ')) {
      return category;
    }
  }
  
  // If no exact match, try to reconstruct from slug
  // Capitalize first letter of each word
  const reconstructed = normalizedSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Check if reconstructed matches a standard category
  for (const category of STANDARD_CATEGORIES) {
    if (category.toLowerCase() === reconstructed.toLowerCase()) {
      return category;
    }
  }
  
  return reconstructed;
}

/**
 * Check if category matches (case-insensitive)
 */
export function categoriesMatch(category1: string | null | undefined, category2: string | null | undefined): boolean {
  if (!category1 || !category2) return false;
  return category1.toLowerCase().trim() === category2.toLowerCase().trim();
}

/**
 * Get category display name (normalized)
 */
export function getCategoryDisplayName(category: string | null | undefined): string {
  return normalizeCategoryName(category) || 'Genel';
}
