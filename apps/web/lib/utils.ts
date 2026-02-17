import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate URL-friendly slug from Turkish text
 * Improved: Truncates at word boundaries to avoid cutting words in half
 * Turkish İ (uppercase I with dot) must be replaced BEFORE toLowerCase - JS toLowerCase() doesn't handle it correctly
 */
export function generateSlug(text: string, maxLength: number = 100): string {
  let slug = text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/Ş/g, 's')
    .replace(/İ/g, 'i')
    .replace(/Ö/g, 'o')
    .replace(/Ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // If slug is longer than maxLength, truncate at word boundary (before last hyphen)
  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    // Find the last hyphen before maxLength to avoid cutting words
    const lastHyphen = truncated.lastIndexOf('-');
    // If we found a hyphen and it's not too close to the start (at least 50% of maxLength), use it
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      // Otherwise, just truncate and remove trailing hyphen if any
      slug = truncated.replace(/-+$/, '');
    }
  }

  // Final cleanup: remove any trailing hyphens
  return slug.replace(/-+$/g, '');
}

/**
 * Format price as Turkish Lira
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

