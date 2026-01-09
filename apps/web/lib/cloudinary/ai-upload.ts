/**
 * Cloudinary AI Image Upload Utilities
 * Uploads AI-generated images to Cloudinary and tracks them in database
 * Optimized with caching, rate limiting, and cost control
 */

import { getCloudinaryClient } from '../../../../packages/lib/cloudinary/client';
import { createServiceClient } from '../../../../packages/lib/supabase/service';
import { findExistingImage, generateContextHash, incrementUsageCount } from '../ai/image-cache';
import { calculateImageCost, logImageGeneration } from '../ai/rate-limiter';

export interface UploadAIImageOptions {
  imageUrl: string;
  publicId?: string;
  folder?: string;
  entityType?: 'listing' | 'article' | 'news' | 'neighborhood' | 'other';
  entityId?: string;
  alt?: string;
  tags?: string[];
  prompt?: string;
  context?: Record<string, any>;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  skipCache?: boolean; // Force new generation even if exists
}

export interface UploadedImage {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Download image from URL and upload to Cloudinary
 */
async function downloadAndUpload(
  imageUrl: string,
  options: {
    publicId?: string;
    folder?: string;
    tags?: string[];
  } = {}
): Promise<UploadedImage> {
  const cloudinaryClient = getCloudinaryClient();
  
  // Download image
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryClient.uploader.upload_stream(
      {
        public_id: options.publicId,
        folder: options.folder || 'ai-generated',
        resource_type: 'image',
        quality: 'auto',
        tags: ['ai-generated', ...(options.tags || [])],
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Upload result is null'));
          return;
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Upload AI-generated image to Cloudinary and track in database
 * Includes caching, cost tracking, and optimization
 */
export async function uploadAIImage(
  options: UploadAIImageOptions
): Promise<UploadedImage & { media_asset_id?: string; from_cache?: boolean }> {
  const {
    imageUrl,
    publicId,
    folder = 'ai-generated',
    entityType,
    entityId,
    alt,
    tags = [],
    prompt,
    context,
    size = '1024x1024',
    quality = 'hd',
    skipCache = false,
  } = options;

  const supabase = createServiceClient();

  // Check cache first (unless skipCache is true)
  if (!skipCache && entityType && context) {
    const contextHash = generateContextHash(context);
    const existing = await findExistingImage({
      entityType,
      entityId,
      contextHash,
    });

    if (existing) {
      // Increment usage count
      await incrementUsageCount(existing.id);

      // Log cache hit
      await logImageGeneration({
        type: entityType,
        size,
        quality,
        cost: 0, // Cache hit = no cost
        success: true,
        mediaAssetId: existing.id,
      });

      return {
        public_id: existing.cloudinary_public_id,
        secure_url: existing.cloudinary_secure_url,
        url: existing.cloudinary_secure_url,
        width: existing.width,
        height: existing.height,
        format: existing.format,
        bytes: 0, // Not available from cache
        media_asset_id: existing.id,
        from_cache: true,
      };
    }
  }

  // Upload to Cloudinary
  const uploaded = await downloadAndUpload(imageUrl, {
    publicId,
    folder,
    tags: ['ai-generated', entityType || 'other', ...tags],
  });

  // Calculate cost
  const cost = calculateImageCost(size, quality);

  // Generate hashes for deduplication
  const promptHash = prompt ? generateContextHash({ prompt }) : undefined;
  const contextHash = context ? generateContextHash(context) : undefined;

  // Track in database
  try {
    const { data: mediaAsset, error } = await supabase
      .from('media_assets')
      .insert({
        cloudinary_public_id: uploaded.public_id,
        cloudinary_url: uploaded.url,
        cloudinary_secure_url: uploaded.secure_url,
        asset_type: entityType === 'listing' ? 'listing_image' : 
                    entityType === 'article' ? 'blog_image' :
                    entityType === 'news' ? 'blog_image' :
                    entityType === 'neighborhood' ? 'neighborhood_image' :
                    'other',
        entity_type: entityType,
        entity_id: entityId,
        width: uploaded.width,
        height: uploaded.height,
        format: uploaded.format,
        bytes: uploaded.bytes,
        alt_text: alt,
        alt_text_generated: true,
        title: alt,
        ai_generated: true,
        prompt_hash: promptHash,
        context_hash: contextHash,
        generation_cost: cost,
        generation_metadata: context ? {
          prompt,
          context,
          size,
          quality,
          generated_at: new Date().toISOString(),
        } : undefined,
        transformations: context || {},
        usage_count: 1,
        last_used_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      console.error('Failed to track media asset:', error);
    }

    // Log generation
    await logImageGeneration({
      type: entityType || 'other',
      size,
      quality,
      cost,
      success: true,
      mediaAssetId: mediaAsset?.id,
    });

    return {
      ...uploaded,
      media_asset_id: mediaAsset?.id,
      from_cache: false,
    };
  } catch (error) {
    console.error('Error tracking media asset:', error);
    
    // Log error
    await logImageGeneration({
      type: entityType || 'other',
      size,
      quality,
      cost,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return uploaded;
  }
}

/**
 * Generate and upload image in one step
 * Includes rate limiting, caching, and cost control
 */
export async function generateAndUploadImage(
  generateFn: () => Promise<{ url: string; revised_prompt?: string }>,
  uploadOptions: Omit<UploadAIImageOptions, 'imageUrl'>
): Promise<UploadedImage & { media_asset_id?: string; revised_prompt?: string; from_cache?: boolean }> {
  // Check cache first
  if (!uploadOptions.skipCache && uploadOptions.entityType && uploadOptions.context) {
    const { findExistingImage, generateContextHash } = await import('../ai/image-cache');
    const contextHash = generateContextHash(uploadOptions.context);
    const existing = await findExistingImage({
      entityType: uploadOptions.entityType,
      entityId: uploadOptions.entityId,
      contextHash,
    });

    if (existing) {
      const { incrementUsageCount } = await import('../ai/image-cache');
      await incrementUsageCount(existing.id);

      return {
        public_id: existing.cloudinary_public_id,
        secure_url: existing.cloudinary_secure_url,
        url: existing.cloudinary_secure_url,
        width: existing.width,
        height: existing.height,
        format: existing.format,
        bytes: 0,
        media_asset_id: existing.id,
        from_cache: true,
      };
    }
  }

  // Generate image
  const generated = await generateFn();
  
  // Upload to Cloudinary
  const uploaded = await uploadAIImage({
    ...uploadOptions,
    imageUrl: generated.url,
  });

  return {
    ...uploaded,
    revised_prompt: generated.revised_prompt,
  };
}
