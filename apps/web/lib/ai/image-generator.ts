/**
 * Client-side AI Image Generator Helper
 * Provides easy-to-use functions for generating images
 */

export interface GenerateImageRequest {
  type: 'listing' | 'article' | 'neighborhood' | 'hero' | 'custom';
  prompt?: string;
  context?: {
    title?: string;
    propertyType?: string;
    location?: string;
    features?: Record<string, any>;
    status?: 'satilik' | 'kiralik';
    category?: string;
    name?: string;
    district?: string;
    description?: string;
    theme?: string;
  };
  options?: {
    size?: '1024x1024' | '1792x1024' | '1024x1792';
    quality?: 'standard' | 'hd';
    style?: 'vivid' | 'natural';
  };
  upload?: {
    folder?: string;
    entityType?: 'listing' | 'article' | 'news' | 'neighborhood' | 'other';
    entityId?: string;
    alt?: string;
    tags?: string[];
  };
}

export interface GeneratedImageResponse {
  success: boolean;
  public_id?: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  media_asset_id?: string;
  revised_prompt?: string;
  error?: string;
}

/**
 * Generate image using AI
 */
export async function generateAIImage(
  request: GenerateImageRequest
): Promise<GeneratedImageResponse> {
  try {
    const response = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate image');
    }

    return data;
  } catch (error) {
    console.error('AI Image Generation Error:', error);
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate listing image
 */
export async function generateListingImage(
  listing: {
    id?: string;
    title: string;
    propertyType: string;
    location: string;
    features?: Record<string, any>;
    status?: 'satilik' | 'kiralik';
  }
): Promise<GeneratedImageResponse> {
  return generateAIImage({
    type: 'listing',
    context: {
      title: listing.title,
      propertyType: listing.propertyType,
      location: listing.location,
      features: listing.features,
      status: listing.status,
    },
    options: {
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
    },
    upload: listing.id ? {
      folder: 'listings',
      entityType: 'listing',
      entityId: listing.id,
      alt: `${listing.title} - ${listing.location}`,
      tags: [listing.propertyType, listing.status || 'satilik'],
    } : undefined,
  });
}

/**
 * Generate article image
 */
export async function generateArticleImage(
  article: {
    id?: string;
    title: string;
    category?: string;
    content?: string;
  }
): Promise<GeneratedImageResponse> {
  return generateAIImage({
    type: 'article',
    context: {
      title: article.title,
      category: article.category,
      description: article.content,
    },
    options: {
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
    },
    upload: article.id ? {
      folder: 'articles',
      entityType: 'article',
      entityId: article.id,
      alt: article.title,
      tags: article.category ? [article.category.toLowerCase()] : ['blog'],
    } : undefined,
  });
}

/**
 * Generate neighborhood image
 */
export async function generateNeighborhoodImage(
  neighborhood: {
    id?: string;
    name: string;
    district?: string;
    description?: string;
  }
): Promise<GeneratedImageResponse> {
  return generateAIImage({
    type: 'neighborhood',
    context: {
      name: neighborhood.name,
      district: neighborhood.district,
      description: neighborhood.description,
    },
    options: {
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
    },
    upload: neighborhood.id ? {
      folder: 'neighborhoods',
      entityType: 'neighborhood',
      entityId: neighborhood.id,
      alt: `${neighborhood.name} mahallesi, ${neighborhood.district || 'Karasu'}`,
      tags: ['neighborhood', (neighborhood.district || 'karasu').toLowerCase()],
    } : undefined,
  });
}

