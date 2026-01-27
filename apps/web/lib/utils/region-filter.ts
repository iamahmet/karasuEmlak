/**
 * Region filtering utilities with normalization and synonym mapping
 * Handles inconsistent naming in DB (Sapanca vs sakarya/sapanca, etc.)
 */

/**
 * Normalize Turkish characters to ASCII for comparison
 */
function normalizeTurkishChars(text: string): string {
  return text
    .toLowerCase()
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .trim();
}

/**
 * Region synonyms mapping
 * Maps variations to canonical region names
 */
const REGION_SYNONYMS: Record<string, string[]> = {
  sapanca: ['sapanca', 'sapanca gölü', 'sapanca golu', 'sakarya sapanca'],
  kocaali: ['kocaali', 'koca ali', 'koca-ali', 'sakarya kocaali'],
  karasu: ['karasu', 'kara su', 'kara-su', 'sakarya karasu'],
};

/**
 * Get canonical region name from synonyms
 */
function getCanonicalRegion(region: string): string {
  const normalized = normalizeTurkishChars(region);
  
  for (const [canonical, synonyms] of Object.entries(REGION_SYNONYMS)) {
    if (synonyms.some(syn => normalized.includes(normalizeTurkishChars(syn)))) {
      return canonical;
    }
  }
  
  return normalized;
}

/**
 * Check if a listing matches a region
 * Uses multiple strategies:
 * 1. Exact match (case-insensitive)
 * 2. Normalized match (Turkish chars normalized)
 * 3. Contains match (fuzzy)
 * 4. Synonym match
 */
export function matchesRegion(
  listing: {
    location_district?: string | null;
    location_neighborhood?: string | null;
    location_city?: string | null;
  },
  region: string
): boolean {
  if (!region) return false;
  
  const canonicalRegion = getCanonicalRegion(region);
  const normalizedRegion = normalizeTurkishChars(canonicalRegion);
  
  // Check all location fields
  const fields = [
    listing.location_district,
    listing.location_neighborhood,
    listing.location_city,
  ].filter(Boolean) as string[];
  
  for (const field of fields) {
    if (!field) continue;
    
    const normalizedField = normalizeTurkishChars(field);
    
    // Exact normalized match
    if (normalizedField === normalizedRegion) {
      return true;
    }
    
    // Contains match (fuzzy)
    if (normalizedField.includes(normalizedRegion) || normalizedRegion.includes(normalizedField)) {
      return true;
    }
    
    // Check synonyms
    const fieldCanonical = getCanonicalRegion(field);
    if (fieldCanonical === canonicalRegion) {
      return true;
    }
  }
  
  return false;
}

/**
 * Filter listings by region with robust matching
 */
export function filterListingsByRegion<T extends {
  location_district?: string | null;
  location_neighborhood?: string | null;
  location_city?: string | null;
}>(
  listings: T[],
  region: string
): T[] {
  if (!region) return listings;
  
  return listings.filter(listing => matchesRegion(listing, region));
}
