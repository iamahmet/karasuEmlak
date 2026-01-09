/**
 * AI Image Generation API
 * Generates images using OpenAI DALL-E and uploads to Cloudinary
 * Includes rate limiting, caching, cost control, and optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  generateImage, 
  generateListingImage, 
  generateArticleImage,
  generateNeighborhoodImage,
  generateHeroImage,
} from '@karasu/lib/openai/image-generation';
import { generateAndUploadImage } from '@/lib/cloudinary/ai-upload';
import { checkRateLimit, logImageGeneration, calculateImageCost } from '@/lib/ai/rate-limiter';
import { findExistingImage, generateContextHash } from '@/lib/ai/image-cache';
import { z } from 'zod';

const generateImageSchema = z.object({
  type: z.enum(['listing', 'article', 'neighborhood', 'hero', 'custom']),
  prompt: z.string().optional(),
  context: z.object({
    title: z.string().optional(),
    propertyType: z.string().optional(),
    location: z.string().optional(),
    features: z.record(z.any()).optional(),
    status: z.enum(['satilik', 'kiralik']).optional(),
    category: z.string().optional(),
    name: z.string().optional(),
    district: z.string().optional(),
    description: z.string().optional(),
    theme: z.string().optional(),
  }).optional(),
  options: z.object({
    size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
    quality: z.enum(['standard', 'hd']).optional(),
    style: z.enum(['vivid', 'natural']).optional(),
  }).optional(),
  upload: z.object({
    folder: z.string().optional(),
    entityType: z.enum(['listing', 'article', 'news', 'neighborhood', 'other']).optional(),
    entityId: z.string().optional(),
    alt: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  skipCache: z.boolean().optional(), // Force new generation
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = generateImageSchema.parse(body);

    const size = validated.options?.size || '1024x1024';
    const quality = validated.options?.quality || 'hd';

    // Check rate limits
    const rateLimitCheck = await checkRateLimit();
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitCheck.reason,
          retryAfter: rateLimitCheck.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitCheck.retryAfter?.toString() || '3600',
          },
        }
      );
    }

    // Check cache first (unless skipCache is true)
    if (!validated.skipCache && validated.upload?.entityType && validated.context) {
      const contextHash = generateContextHash(validated.context);
      const existing = await findExistingImage({
        entityType: validated.upload.entityType,
        entityId: validated.upload.entityId,
        contextHash,
      });

      if (existing) {
        // Log cache hit
        await logImageGeneration({
          type: validated.type,
          size,
          quality,
          cost: 0,
          success: true,
          mediaAssetId: existing.id,
        });

        return NextResponse.json({
          success: true,
          cached: true,
          public_id: existing.cloudinary_public_id,
          url: existing.cloudinary_secure_url,
          width: existing.width,
          height: existing.height,
          format: existing.format,
          media_asset_id: existing.id,
        });
      }
    }

    let generatedImage: { url: string; revised_prompt?: string };
    let prompt: string | undefined;

    // Generate image based on type
    switch (validated.type) {
      case 'listing':
        if (!validated.context) {
          return NextResponse.json(
            { error: 'Context is required for listing images' },
            { status: 400 }
          );
        }
        const listingResult = await generateListingImage(
          {
            title: validated.context.title || '',
            propertyType: validated.context.propertyType || 'daire',
            location: validated.context.location || 'Karasu, Sakarya',
            features: validated.context.features,
            status: validated.context.status,
          },
          validated.options
        );
        generatedImage = listingResult;
        prompt = validated.context.title || validated.context.propertyType || 'listing';
        break;

      case 'article':
        if (!validated.context) {
          return NextResponse.json(
            { error: 'Context is required for article images' },
            { status: 400 }
          );
        }
        const articleResult = await generateArticleImage(
          {
            title: validated.context.title || '',
            category: validated.context.category,
            content: validated.context.description,
          },
          validated.options
        );
        generatedImage = articleResult;
        prompt = validated.context.title || 'article';
        break;

      case 'neighborhood':
        if (!validated.context) {
          return NextResponse.json(
            { error: 'Context is required for neighborhood images' },
            { status: 400 }
          );
        }
        const neighborhoodResult = await generateNeighborhoodImage(
          {
            name: validated.context.name || '',
            district: validated.context.district,
            description: validated.context.description,
          },
          validated.options
        );
        generatedImage = neighborhoodResult;
        prompt = validated.context.name || 'neighborhood';
        break;

      case 'hero':
        if (!validated.context) {
          return NextResponse.json(
            { error: 'Context is required for hero images' },
            { status: 400 }
          );
        }
        const heroResult = await generateHeroImage(
          {
            title: validated.context.title || '',
            theme: validated.context.theme,
          },
          validated.options
        );
        generatedImage = heroResult;
        prompt = validated.context.title || 'hero';
        break;

      case 'custom':
        if (!validated.prompt) {
          return NextResponse.json(
            { error: 'Prompt is required for custom images' },
            { status: 400 }
          );
        }
        generatedImage = await generateImage(validated.prompt, validated.options);
        prompt = validated.prompt;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid image type' },
          { status: 400 }
        );
    }

    // Calculate cost
    const cost = calculateImageCost(size, quality);

    // Upload to Cloudinary if upload options provided
    if (validated.upload) {
      try {
        const uploaded = await generateAndUploadImage(
          async () => generatedImage,
          {
            ...validated.upload,
            prompt,
            context: validated.context,
            size,
            quality,
            skipCache: validated.skipCache,
          }
        );

        return NextResponse.json({
          success: true,
          cached: uploaded.from_cache || false,
          public_id: uploaded.public_id,
          url: uploaded.secure_url,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          media_asset_id: uploaded.media_asset_id,
          revised_prompt: uploaded.revised_prompt,
          cost: uploaded.from_cache ? 0 : cost,
        });
      } catch (uploadError: any) {
        // Log upload error
        await logImageGeneration({
          type: validated.type,
          size,
          quality,
          cost,
          success: false,
          error: uploadError.message || 'Upload failed',
        });

        throw uploadError;
      }
    }

    // Return generated image URL only (not uploaded)
    return NextResponse.json({
      success: true,
      url: generatedImage.url,
      revised_prompt: generatedImage.revised_prompt,
      cost,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('AI Image Generation API Error:', error);
    
    // Log error
    try {
      await logImageGeneration({
        type: 'unknown',
        size: '1024x1024',
        quality: 'hd',
        cost: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } catch {
      // Ignore logging errors
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking rate limits and costs
 */
export async function GET(_req: NextRequest) {
  try {
    const { checkRateLimit } = await import('@/lib/ai/rate-limiter');
    const { createServiceClient } = await import('@karasu/lib/supabase/service');
    
    const rateLimitCheck = await checkRateLimit();
    
    // Get today's stats
    const supabase = createServiceClient();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: todayLogs } = await supabase
      .from('ai_image_generation_logs')
      .select('cost, success')
      .gte('created_at', oneDayAgo);

    const todayCost = todayLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;
    const todayCount = todayLogs?.length || 0;
    const successCount = todayLogs?.filter(log => log.success).length || 0;

    return NextResponse.json({
      rateLimit: rateLimitCheck,
      stats: {
        today: {
          count: todayCount,
          success: successCount,
          failed: todayCount - successCount,
          cost: todayCost,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
