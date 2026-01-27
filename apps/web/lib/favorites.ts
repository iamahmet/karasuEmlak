/**
 * Favorites Management System
 * Supports both localStorage (anonymous users) and Supabase (authenticated users)
 */

import { createClient } from '@/lib/supabase/client';
import { safeJsonParse } from '@/lib/utils/safeJsonParse';

const FAVORITES_STORAGE_KEY = 'karasu-emlak-favorites';

/**
 * Get user ID (for authenticated users)
 */
async function getUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get favorites from localStorage
 */
export function getLocalFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    return safeJsonParse(stored, [], {
      context: 'favorites',
      dedupeKey: 'favorites',
    });
  } catch {
    return [];
  }
}

/**
 * Save favorites to localStorage
 */
function saveLocalFavorites(propertyIds: string[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(propertyIds));
  } catch (error) {
    console.error('Failed to save favorites to localStorage:', error);
  }
}

/**
 * Get favorites from Supabase
 */
async function getSupabaseFavorites(userId: string): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to fetch favorites from Supabase:', error);
      return [];
    }

    return data?.map((item: { property_id: string }) => item.property_id) || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

/**
 * Save favorites to Supabase
 */
async function saveSupabaseFavorites(userId: string, propertyIds: string[]): Promise<boolean> {
  try {
    const supabase = createClient();
    // Delete existing favorites
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId);

    // Insert new favorites
    if (propertyIds.length > 0) {
      const favorites = propertyIds.map(propertyId => ({
        user_id: userId,
        property_id: propertyId,
      }));

      const { error } = await supabase
        .from('favorites')
        .insert(favorites);

      if (error) {
        console.error('Failed to save favorites to Supabase:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving favorites:', error);
    return false;
  }
}

/**
 * Get all favorites (checks both localStorage and Supabase)
 */
export async function getFavorites(): Promise<string[]> {
  const userId = await getUserId();
  
  if (userId) {
    // Authenticated user - use Supabase
    return await getSupabaseFavorites(userId);
  } else {
    // Anonymous user - use localStorage
    return getLocalFavorites();
  }
}

/**
 * Check if a property is favorited
 */
export async function isFavorite(propertyId: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.includes(propertyId);
}

/**
 * Add property to favorites
 */
export async function addFavorite(propertyId: string): Promise<boolean> {
  const userId = await getUserId();
  const currentFavorites = await getFavorites();

  if (currentFavorites.includes(propertyId)) {
    return true; // Already favorited
  }

  const newFavorites = [...currentFavorites, propertyId];

  if (userId) {
    // Authenticated user - save to Supabase
    return await saveSupabaseFavorites(userId, newFavorites);
  } else {
    // Anonymous user - save to localStorage
    saveLocalFavorites(newFavorites);
    return true;
  }
}

/**
 * Remove property from favorites
 */
export async function removeFavorite(propertyId: string): Promise<boolean> {
  const userId = await getUserId();
  const currentFavorites = await getFavorites();

  if (!currentFavorites.includes(propertyId)) {
    return true; // Not favorited
  }

  const newFavorites = currentFavorites.filter(id => id !== propertyId);

  if (userId) {
    // Authenticated user - save to Supabase
    return await saveSupabaseFavorites(userId, newFavorites);
  } else {
    // Anonymous user - save to localStorage
    saveLocalFavorites(newFavorites);
    return true;
  }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(propertyId: string): Promise<boolean> {
  const isFav = await isFavorite(propertyId);
  let success = false;
  
  if (isFav) {
    success = await removeFavorite(propertyId);
  } else {
    success = await addFavorite(propertyId);
  }

  // Dispatch custom event to notify other components
  if (typeof window !== 'undefined' && success) {
    window.dispatchEvent(new CustomEvent('favorites-updated', { detail: { propertyId, isFavorite: !isFav } }));
  }

  return success;
}

/**
 * Sync localStorage favorites to Supabase (when user logs in)
 */
export async function syncFavoritesToSupabase(): Promise<void> {
  const userId = await getUserId();
  if (!userId) return;

  const localFavorites = getLocalFavorites();
  if (localFavorites.length === 0) return;

  const supabaseFavorites = await getSupabaseFavorites(userId);
  const mergedFavorites = [...new Set([...supabaseFavorites, ...localFavorites])];

  await saveSupabaseFavorites(userId, mergedFavorites);
  
  // Clear localStorage after sync
  localStorage.removeItem(FAVORITES_STORAGE_KEY);
}

