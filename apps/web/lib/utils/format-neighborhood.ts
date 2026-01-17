/**
 * Format neighborhood names - capitalize first letter of each word
 * Handles Turkish characters properly
 */

/**
 * Capitalize first letter of a string
 */
function capitalizeFirst(str: string): string {
  if (!str || str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format neighborhood name - capitalize first letter of each word
 * Example: "aziziye" -> "Aziziye", "merkez mahallesi" -> "Merkez Mahallesi"
 */
export function formatNeighborhoodName(neighborhood: string | null | undefined): string {
  if (!neighborhood) return '';
  
  const trimmed = neighborhood.trim();
  if (!trimmed) return '';
  
  // Split by spaces and capitalize each word
  return trimmed
    .split(/\s+/)
    .map(word => capitalizeFirst(word))
    .join(' ');
}

/**
 * Format location string (neighborhood, district)
 * Example: "aziziye, Karasu" -> "Aziziye, Karasu"
 */
export function formatLocation(neighborhood: string | null | undefined, district: string | null | undefined): string {
  const formattedNeighborhood = formatNeighborhoodName(neighborhood);
  const formattedDistrict = district ? formatNeighborhoodName(district) : '';
  
  if (formattedNeighborhood && formattedDistrict) {
    return `${formattedNeighborhood}, ${formattedDistrict}`;
  }
  
  return formattedNeighborhood || formattedDistrict || '';
}
