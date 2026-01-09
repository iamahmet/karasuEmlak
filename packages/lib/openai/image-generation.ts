/**
 * OpenAI Image Generation Utilities
 * Uses DALL-E 3 for high-quality, realistic image generation
 */

import OpenAI from 'openai';
import { getEnv } from '@karasu-emlak/config';

let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client instance
 */
function getOpenAIClient(): OpenAI | null {
  if (openaiClient) {
    return openaiClient;
  }

  const env = getEnv();
  
  if (!env.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  OpenAI API key not configured for image generation');
    }
    return null;
  }

  openaiClient = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  return openaiClient;
}

export interface ImageGenerationOptions {
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number; // Number of images (1-10, but DALL-E 3 only supports 1)
}

export interface GeneratedImage {
  url: string;
  revised_prompt?: string;
}

/**
 * Generate realistic image using DALL-E 3
 * 
 * @param prompt - Detailed prompt for image generation
 * @param options - Generation options
 * @returns Generated image URL
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {}
): Promise<GeneratedImage> {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: options.size || '1024x1024',
      quality: options.quality || 'hd',
      style: options.style || 'natural',
      n: 1, // DALL-E 3 only supports 1 image
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No image data returned from OpenAI');
    }
    
    const image = response.data[0];
    
    if (!image?.url) {
      throw new Error('No image URL returned from OpenAI');
    }

    return {
      url: image.url,
      revised_prompt: image.revised_prompt,
    };
  } catch (error: any) {
    console.error('OpenAI Image Generation Error:', error);
    
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (error?.status === 400) {
      throw new Error(`Invalid prompt: ${error.message}`);
    }
    
    throw new Error(`Failed to generate image: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generate image with reference from free sources (Unsplash/Pexels)
 * Finds a reference image and creates a new, copyright-free version
 */
export async function generateImageWithReference(
  query: string,
  context: {
    type: 'listing' | 'article' | 'neighborhood' | 'hero';
    propertyType?: string;
    location?: string;
    features?: string[];
  },
  options: ImageGenerationOptions = {}
): Promise<GeneratedImage & { referenceUrl?: string }> {
  const { findReferenceAndGenerate } = await import('./image-reference');
  return findReferenceAndGenerate(query, context);
}

/**
 * Generate optimized prompt for real estate images
 */
export function generateRealEstatePrompt(
  context: {
    type: 'listing' | 'blog' | 'neighborhood' | 'article' | 'hero' | 'card';
    propertyType?: string;
    location?: string;
    features?: string[];
    style?: 'modern' | 'traditional' | 'luxury' | 'cozy';
    timeOfDay?: 'daylight' | 'sunset' | 'golden-hour' | 'blue-hour';
    season?: 'spring' | 'summer' | 'autumn' | 'winter';
  }
): string {
  const {
    type,
    propertyType,
    location = 'Karasu, Sakarya',
    features = [],
    style = 'modern',
    timeOfDay = 'daylight',
    season = 'summer',
  } = context;

  const basePrompts: Record<string, string> = {
    listing: `Professional real estate photography of a ${propertyType || 'beautiful property'} in ${location}, Turkey. ${style} architecture, ${timeOfDay} lighting, ${season} season. High-quality, realistic, photorealistic, architectural photography style, wide angle, professional composition, natural lighting, ${features.length > 0 ? features.join(', ') + '. ' : ''}No text, no watermark, no people, clean and professional.`,
    
    blog: `Professional real estate blog header image showing ${propertyType || 'real estate'} in ${location}, Turkey. ${style} style, ${timeOfDay} lighting, ${season} season. Editorial photography style, professional composition, natural colors, realistic, photorealistic. No text, no watermark.`,
    
    neighborhood: `Aerial view and street level photography of ${location} neighborhood, Turkey. Residential area, ${style} architecture, ${timeOfDay} lighting, ${season} season. Professional real estate photography, wide angle, natural lighting, realistic, photorealistic. No text, no watermark.`,
    
    article: `Professional editorial image for real estate article about ${propertyType || 'real estate'} in ${location}, Turkey. ${style} style, ${timeOfDay} lighting, ${season} season. Magazine-quality photography, professional composition, natural colors, realistic, photorealistic. No text, no watermark.`,
    
    hero: `Stunning hero banner image of ${propertyType || 'luxury real estate'} in ${location}, Turkey. ${style} architecture, ${timeOfDay} lighting, ${season} season. Professional real estate photography, cinematic composition, natural lighting, wide angle, realistic, photorealistic. No text, no watermark, no people.`,
    
    card: `Professional real estate card image of ${propertyType || 'property'} in ${location}, Turkey. ${style} style, ${timeOfDay} lighting, ${season} season. Clean composition, natural lighting, realistic, photorealistic, professional photography. No text, no watermark.`,
  };

  return basePrompts[type] || basePrompts.listing;
}

/**
 * Generate image for listing
 * Uses reference images from Unsplash to create copyright-free versions
 */
export async function generateListingImage(
  listing: {
    title: string;
    propertyType: string;
    location: string;
    features?: Record<string, any>;
    status?: 'satilik' | 'kiralik';
  },
  options?: ImageGenerationOptions
): Promise<GeneratedImage & { referenceUrl?: string }> {
  const features: string[] = [];
  
  if (listing.features) {
    if (listing.features.seaView) features.push('sea view');
    if (listing.features.balcony) features.push('balcony');
    if (listing.features.parking) features.push('parking');
    if (listing.features.elevator) features.push('elevator');
    if (listing.features.furnished) features.push('furnished');
  }

  const propertyTypeMap: Record<string, string> = {
    daire: 'modern apartment',
    villa: 'luxury villa',
    ev: 'house',
    yazlik: 'summer house',
    arsa: 'land plot',
    isyeri: 'commercial property',
    dukkan: 'shop',
  };

  // Build search query for reference image
  const searchQuery = `${propertyTypeMap[listing.propertyType] || listing.propertyType} ${listing.location} Turkey real estate`;
  
  // Use reference-based generation
  const { findReferenceAndGenerate } = await import('./image-reference');
  
  try {
    return await findReferenceAndGenerate(searchQuery, {
      type: 'listing',
      propertyType: propertyTypeMap[listing.propertyType] || listing.propertyType,
      location: listing.location,
      features,
    });
  } catch (error) {
    // Fallback to direct generation if reference fails
    console.warn('Reference-based generation failed, using direct generation:', error);
    const prompt = generateRealEstatePrompt({
      type: 'listing',
      propertyType: propertyTypeMap[listing.propertyType] || listing.propertyType,
      location: listing.location,
      features,
      style: listing.status === 'satilik' ? 'luxury' : 'modern',
      timeOfDay: 'daylight',
      season: 'summer',
    });

    return generateImage(prompt, {
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
      ...options,
    });
  }
}

/**
 * Generate image for blog/article
 * Uses reference images from Unsplash to create copyright-free versions
 */
export async function generateArticleImage(
  article: {
    title: string;
    category?: string;
    content?: string;
  },
  options?: ImageGenerationOptions
): Promise<GeneratedImage & { referenceUrl?: string }> {
  // Extract key concepts from title and content
  const keywords = article.title.toLowerCase().split(' ');
  const propertyType = keywords.find(k => ['daire', 'villa', 'ev', 'arsa', 'emlak'].includes(k)) || 'real estate';
  
  // Build search query for reference image
  const searchQuery = `${article.title} Karasu Sakarya Turkey real estate`;
  
  // Use reference-based generation
  const { findReferenceAndGenerate } = await import('./image-reference');
  
  try {
    return await findReferenceAndGenerate(searchQuery, {
      type: 'article',
      propertyType,
      location: 'Karasu, Sakarya',
    });
  } catch (error) {
    // Fallback to direct generation
    console.warn('Reference-based generation failed, using direct generation:', error);
    const prompt = generateRealEstatePrompt({
      type: 'blog',
      propertyType,
      location: 'Karasu, Sakarya',
      style: 'modern',
      timeOfDay: 'daylight',
      season: 'summer',
    });

    return generateImage(prompt, {
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
      ...options,
    });
  }
}

/**
 * Generate neighborhood image
 * Uses reference images from Unsplash to create copyright-free versions
 */
export async function generateNeighborhoodImage(
  neighborhood: {
    name: string;
    district?: string;
    description?: string;
  },
  options?: ImageGenerationOptions
): Promise<GeneratedImage & { referenceUrl?: string }> {
  // Build search query for reference image
  const searchQuery = `${neighborhood.name} ${neighborhood.district || 'Karasu'} Sakarya Turkey neighborhood residential`;
  
  // Use reference-based generation
  const { findReferenceAndGenerate } = await import('./image-reference');
  
  try {
    return await findReferenceAndGenerate(searchQuery, {
      type: 'neighborhood',
      location: `${neighborhood.name}, ${neighborhood.district || 'Karasu'}, Sakarya`,
    });
  } catch (error) {
    // Fallback to direct generation
    console.warn('Reference-based generation failed, using direct generation:', error);
    const prompt = generateRealEstatePrompt({
      type: 'neighborhood',
      location: `${neighborhood.name}, ${neighborhood.district || 'Karasu'}, Sakarya`,
      style: 'modern',
      timeOfDay: 'daylight',
      season: 'summer',
    });

    return generateImage(prompt, {
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
      ...options,
    });
  }
}

/**
 * Generate hero/banner image
 */
export async function generateHeroImage(
  context: {
    title: string;
    theme?: string;
  },
  options?: ImageGenerationOptions
): Promise<GeneratedImage> {
  const prompt = generateRealEstatePrompt({
    type: 'hero',
    propertyType: 'luxury real estate',
    location: 'Karasu, Sakarya',
    style: 'luxury',
    timeOfDay: 'golden-hour',
    season: 'summer',
  });

  return generateImage(prompt, {
    size: '1792x1024',
    quality: 'hd',
    style: 'vivid',
    ...options,
  });
}

