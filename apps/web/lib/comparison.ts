/**
 * Property Comparison System
 * Manages comparison state using localStorage
 * Maximum 4 properties can be compared at once
 */

const COMPARISON_STORAGE_KEY = 'karasu-emlak-comparison';
const MAX_COMPARISON_ITEMS = 4;

/**
 * Get comparison items from localStorage
 */
export function getComparisonItems(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(COMPARISON_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save comparison items to localStorage
 */
function saveComparisonItems(propertyIds: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(propertyIds));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('comparison-updated', { 
      detail: { count: propertyIds.length } 
    }));
  } catch (error) {
    console.error('Failed to save comparison to localStorage:', error);
  }
}

/**
 * Add property to comparison
 */
export function addToComparison(propertyId: string): boolean {
  const currentItems = getComparisonItems();
  
  if (currentItems.includes(propertyId)) {
    return false; // Already in comparison
  }
  
  if (currentItems.length >= MAX_COMPARISON_ITEMS) {
    return false; // Maximum items reached
  }
  
  const newItems = [...currentItems, propertyId];
  saveComparisonItems(newItems);
  return true;
}

/**
 * Remove property from comparison
 */
export function removeFromComparison(propertyId: string): boolean {
  const currentItems = getComparisonItems();
  
  if (!currentItems.includes(propertyId)) {
    return false; // Not in comparison
  }
  
  const newItems = currentItems.filter(id => id !== propertyId);
  saveComparisonItems(newItems);
  return true;
}

/**
 * Toggle property in comparison
 */
export function toggleComparison(propertyId: string): boolean {
  const currentItems = getComparisonItems();
  
  if (currentItems.includes(propertyId)) {
    return removeFromComparison(propertyId);
  } else {
    return addToComparison(propertyId);
  }
}

/**
 * Check if property is in comparison
 */
export function isInComparison(propertyId: string): boolean {
  return getComparisonItems().includes(propertyId);
}

/**
 * Clear all comparison items
 */
export function clearComparison(): void {
  saveComparisonItems([]);
}

/**
 * Get comparison properties (full Listing objects)
 */
export function getComparisonProperties<T extends { id: string }>(allProperties: T[]): T[] {
  const comparisonIds = getComparisonItems();
  return allProperties.filter(property => comparisonIds.includes(property.id));
}

/**
 * Get comparison count
 */
export function getComparisonCount(): number {
  return getComparisonItems().length;
}

