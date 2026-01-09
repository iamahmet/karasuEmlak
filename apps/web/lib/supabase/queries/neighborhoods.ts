import { createServiceClient } from '@karasu/lib/supabase/service';
import { generateSlug } from '@/lib/utils';

export interface Neighborhood {
  id: string;
  name: string;
  slug: string;
  district: string;
  city: string;
  description?: string;
  image_public_id?: string;
  seo_content?: any;
  published: boolean;
}

/**
 * Get all neighborhood names (for generateStaticParams)
 * @deprecated Use getAllNeighborhoodSlugs instead
 */
export async function getAllNeighborhoodNames(): Promise<string[]> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('name')
    .eq('published', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching neighborhood names:', error);
    return [];
  }

  return (data || []).map(n => n.name);
}

/**
 * Get all neighborhood slugs (for generateStaticParams)
 * Returns slugs from database (already normalized)
 */
export async function getAllNeighborhoodSlugs(): Promise<string[]> {
  const supabase = createServiceClient();
  
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('slug')
    .eq('published', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching neighborhood slugs:', error);
    return [];
  }

  return (data || []).map(n => n.slug).filter(Boolean);
}

/**
 * Get neighborhood with image
 * Handles Turkish character slugs (e.g., "atatürk" -> "ataturk")
 */
export async function getNeighborhoodWithImage(slug: string): Promise<Neighborhood | null> {
  const supabase = createServiceClient();
  
  // First try exact match
  const { data, error } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!error && data) {
    return data as Neighborhood;
  }

  // If not found, try to find by matching generated slug from name
  // This handles cases where URL has Turkish characters but DB slug doesn't
  const { data: allNeighborhoods } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('published', true);

  if (allNeighborhoods) {
    const matched = allNeighborhoods.find((n: Neighborhood) => {
      // Check if slug matches
      if (n.slug === slug) return true;
      // Check if generated slug from name matches
      if (generateSlug(n.name) === slug) return true;
      return false;
    });

    if (matched) {
      return matched as Neighborhood;
    }
  }
  
  return null;
}

/**
 * Get neighborhoods with images
 */
export async function getNeighborhoodsWithImages(limit?: number): Promise<Neighborhood[]> {
  let supabase;
  try {
    supabase = createServiceClient();
  } catch (error: any) {
    console.error('Error creating service client for getNeighborhoodsWithImages:', error.message);
    return [];
  }
  
  let query = supabase
    .from('neighborhoods')
    .select('*')
    .eq('published', true)
    .order('name', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching neighborhoods:', error);
    return [];
  }

  return (data as Neighborhood[]) || [];
}

/**
 * Get neighborhood image URL (with fallback to placeholder)
 */
export function getNeighborhoodImageUrl(neighborhood: Neighborhood | null): string {
  if (!neighborhood) {
    return 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800';
  }

  // If has image_public_id, use it (could be placeholder:URL or Cloudinary public_id)
  if (neighborhood.image_public_id) {
    return neighborhood.image_public_id.startsWith('placeholder:') || 
           neighborhood.image_public_id.startsWith('http')
      ? neighborhood.image_public_id.replace('placeholder:', '')
      : neighborhood.image_public_id;
  }

  // Fallback to placeholder based on neighborhood name
  const placeholders = [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1568605117035-9c5c0b3b0e5f?w=800',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
  ];
  
  // Use neighborhood name to consistently pick a placeholder
  const index = neighborhood.name.length % placeholders.length;
  return placeholders[index];
}

