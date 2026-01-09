/**
 * Image Query Utilities
 * Query and retrieve images from database for reuse
 */

import { createServiceClient } from '@karasu/lib/supabase/service';

export interface ImageQueryOptions {
  entityType?: 'listing' | 'article' | 'news' | 'neighborhood' | 'other';
  entityId?: string;
  assetType?: 'listing_image' | 'blog_image' | 'og_image' | 'neighborhood_image' | 'other';
  limit?: number;
  offset?: number;
  aiGenerated?: boolean;
  minUsageCount?: number;
}

export interface MediaAsset {
  id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  cloudinary_secure_url: string;
  asset_type: string;
  entity_type: string | null;
  entity_id: string | null;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  alt_text: string | null;
  title: string | null;
  usage_count: number | null;
  ai_generated: boolean | null;
  created_at: string;
}

/**
 * Query media assets from database
 */
export async function queryMediaAssets(
  options: ImageQueryOptions = {}
): Promise<MediaAsset[]> {
  const supabase = createServiceClient();
  const {
    entityType,
    entityId,
    assetType,
    limit = 50,
    offset = 0,
    aiGenerated,
    minUsageCount,
  } = options;

  let query = supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  if (entityId) {
    query = query.eq('entity_id', entityId);
  }

  if (assetType) {
    query = query.eq('asset_type', assetType);
  }

  if (aiGenerated !== undefined) {
    query = query.eq('ai_generated', aiGenerated);
  }

  if (minUsageCount !== undefined) {
    query = query.gte('usage_count', minUsageCount);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error querying media assets:', error);
    return [];
  }

  return (data as MediaAsset[]) || [];
}

/**
 * Get media asset by ID
 */
export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching media asset:', error);
    return null;
  }

  return data as MediaAsset;
}

/**
 * Get media assets by entity
 */
export async function getMediaAssetsByEntity(
  entityType: string,
  entityId: string
): Promise<MediaAsset[]> {
  return queryMediaAssets({ entityType: entityType as any, entityId });
}

/**
 * Get most used AI-generated images
 */
export async function getMostUsedAIImages(limit = 10): Promise<MediaAsset[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('ai_generated', true)
    .order('usage_count', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching most used AI images:', error);
    return [];
  }

  return (data as MediaAsset[]) || [];
}

