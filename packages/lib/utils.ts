import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency (Turkish Lira)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with Turkish locale
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('tr-TR').format(value);
}

/**
 * Format date with Turkish locale
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * Generate slug from string (with Turkish character support)
 * Improved: Handles long strings by truncating at word boundaries
 */
export function slugify(text: string, maxLength: number = 100): string {
  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    // Turkish character replacements
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
    // Replace spaces and special chars with hyphens
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]+/g, '-')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // If slug is longer than maxLength, truncate at word boundary
  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    // If we found a hyphen and it's not too close to the start, use it
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      // Otherwise, just truncate and remove trailing hyphen
      slug = truncated.replace(/-+$/, '');
    }
  }

  // Final cleanup: remove any trailing hyphens
  return slug.replace(/^-+|-+$/g, '');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

