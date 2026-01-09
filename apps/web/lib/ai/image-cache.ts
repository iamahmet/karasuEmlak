/**
 * AI Image Cache and Reuse System
 * Prevents duplicate image generation by checking database first
 */

import { createServiceClient } from '@karasu/lib/supabase/service';
import { generateSlug } from '@/lib/utils';

export interface ImageCacheQuery {
  entityType: 'listing' | 'article' | 'news' | 'neighborhood' | 'other';
  entityId?: string;
  promptHash?: string;
  contextHash?: string;
}

/**
 * Generate hash from context for cache lookup
 */
export function generateContextHash(context: Record<string, any>): string {
  const sorted = Object.keys(context)
    .sort()
    .map(key => `${key}:${JSON.stringify(context[key])}`)
    .join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    const char = sorted.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if image already exists in database for given context
 */
export async function findExistingImage(
  query: ImageCacheQuery
): Promise<{
  id: string;
  cloudinary_public_id: string;
  cloudinary_secure_url: string;
  width: number;
  height: number;
  format: string;
} | null> {
  const supabase = createServiceClient();

  let dbQuery = supabase
    .from('media_assets')
    .select('id, cloudinary_public_id, cloudinary_secure_url, width, height, format')
    .eq('entity_type', query.entityType);

  // If entityId provided, check for exact match
  if (query.entityId) {
    dbQuery = dbQuery.eq('entity_id', query.entityId);
  }

  // If contextHash provided, check transformations field
  if (query.contextHash) {
    dbQuery = dbQuery.contains('transformations', { contextHash: query.contextHash });
  }

  const { data, error } = await dbQuery
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error checking image cache:', error);
    return null;
  }

  return data || null;
}

/**
 * Check if similar image exists (for reuse)
 */
export async function findSimilarImage(
  entityType: 'listing' | 'article' | 'news' | 'neighborhood' | 'other',
  context: Record<string, any>
): Promise<{
  id: string;
  cloudinary_public_id: string;
  cloudinary_secure_url: string;
  width: number;
  height: number;
  format: string;
  usage_count: number;
} | null> {
  const supabase = createServiceClient();

  // For listings, check by property type and location
  if (entityType === 'listing' && context.propertyType && context.location) {
    const { data } = await supabase
      .from('media_assets')
      .select('id, cloudinary_public_id, cloudinary_secure_url, width, height, format, usage_count')
      .eq('entity_type', 'listing')
      .contains('transformations', { 
        propertyType: context.propertyType,
        location: context.location 
      })
      .order('usage_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data || null;
  }

  // For articles, check by category
  if (entityType === 'article' && context.category) {
    const { data } = await supabase
      .from('media_assets')
      .select('id, cloudinary_public_id, cloudinary_secure_url, width, height, format, usage_count')
      .eq('entity_type', 'article')
      .contains('transformations', { category: context.category })
      .order('usage_count', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data || null;
  }

  // For neighborhoods, check by name
  if (entityType === 'neighborhood' && context.name) {
    const { data } = await supabase
      .from('media_assets')
      .select('id, cloudinary_public_id, cloudinary_secure_url, width, height, format, usage_count')
      .eq('entity_type', 'neighborhood')
      .eq('entity_id', generateSlug(context.name))
      .limit(1)
      .maybeSingle();

    return data || null;
  }

  return null;
}

/**
 * Increment usage count for media asset
 */
export async function incrementUsageCount(mediaAssetId: string): Promise<void> {
  const supabase = createServiceClient();

  try {
    await supabase.rpc('increment_media_usage', { asset_id: mediaAssetId });
  } catch {
    // Fallback to direct update if RPC doesn't exist
    const { data: current } = await supabase
      .from('media_assets')
      .select('usage_count')
      .eq('id', mediaAssetId)
      .single();

    await supabase
      .from('media_assets')
      .update({
        usage_count: (current?.usage_count || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', mediaAssetId);
  }
}

