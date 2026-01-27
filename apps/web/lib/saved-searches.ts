/**
 * Saved Searches Management System
 * Manages saved search filters using localStorage
 */

import { safeJsonParse } from '@/lib/utils/safeJsonParse';

const SAVED_SEARCHES_STORAGE_KEY = 'karasu-emlak-saved-searches';
const MAX_SAVED_SEARCHES = 10;

export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: string;
}

/**
 * Get all saved searches from localStorage
 */
export function getSavedSearches(): SavedSearch[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SAVED_SEARCHES_STORAGE_KEY);
    if (!stored) return [];
    return safeJsonParse(stored, [], {
      context: 'saved-searches',
      dedupeKey: 'saved-searches',
    });
  } catch {
    return [];
  }
}

/**
 * Save a search to localStorage
 */
export function saveSearch(name: string, filters: Record<string, any>): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const searches = getSavedSearches();
    
    // Check if we've reached the limit
    if (searches.length >= MAX_SAVED_SEARCHES) {
      // Remove the oldest search
      searches.shift();
    }
    
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    
    searches.push(newSearch);
    localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(searches));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('saved-searches-updated'));
    
    return true;
  } catch (error) {
    console.error('Failed to save search:', error);
    return false;
  }
}

/**
 * Delete a saved search
 */
export function deleteSavedSearch(id: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const searches = getSavedSearches();
    const filtered = searches.filter(s => s.id !== id);
    localStorage.setItem(SAVED_SEARCHES_STORAGE_KEY, JSON.stringify(filtered));
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('saved-searches-updated'));
    
    return true;
  } catch (error) {
    console.error('Failed to delete saved search:', error);
    return false;
  }
}

/**
 * Load filters from a saved search
 */
export function loadSavedSearch(id: string): Record<string, any> | null {
  const searches = getSavedSearches();
  const search = searches.find(s => s.id === id);
  return search ? search.filters : null;
}

