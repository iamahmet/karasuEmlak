/**
 * Image Reference and Analysis Utilities
 * Finds free images from Unsplash/Pexels and creates variations using DALL-E 3
 */

import OpenAI from 'openai';
import { getEnv } from '@karasu-emlak/config';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openaiClient) {
    return openaiClient;
  }

  const env = getEnv();
  
  if (!env.OPENAI_API_KEY) {
    return null;
  }

  openaiClient = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  return openaiClient;
}

/**
 * Search for free images from Unsplash
 * Uses comprehensive search system
 */
export async function searchUnsplashImage(query: string): Promise<string | null> {
  try {
    const { findBestReferenceImage } = await import('./image-search');
    const result = await findBestReferenceImage(query);
    return result?.url || null;
  } catch (error) {
    console.error('Unsplash search error:', error);
    return null;
  }
}

/**
 * Search for free images from Pexels (alternative to Unsplash)
 * Uses comprehensive search system
 */
export async function searchPexelsImage(query: string): Promise<string | null> {
  try {
    const { searchPexels } = await import('./image-search');
    const results = await searchPexels(query);
    return results.length > 0 ? results[0].url : null;
  } catch (error) {
    console.error('Pexels search error:', error);
    return null;
  }
}

/**
 * Analyze image and generate description for DALL-E prompt
 */
export async function analyzeImageForPrompt(imageUrl: string): Promise<string> {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    // Download image
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    const contentType = imageResponse.headers.get('content-type');
    
    // Validate MIME type
    if (!contentType || !contentType.startsWith('image/')) {
      // Try to detect from URL
      const urlLower = imageUrl.toLowerCase();
      if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) {
        // Continue with jpeg
      } else if (urlLower.includes('.png')) {
        // Continue with png
      } else {
        throw new Error(`Invalid image MIME type: ${contentType || 'unknown'}`);
      }
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const mimeType = contentType || 'image/jpeg';

    // Use GPT-4 Vision to analyze the image
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Bu görseli analiz et ve DALL-E 3 için detaylı bir prompt oluştur. Prompt, görselin stilini, kompozisyonunu, renklerini, atmosferini, ışıklandırmasını ve teknik detaylarını içermeli. Ancak görselin tamamen yeni, orijinal ve telif hakkı sorunu olmayan bir versiyonunu oluşturmak için kullanılacak. Görselden ilham alarak ama tamamen farklı bir kompozisyon oluştur. Sadece İngilizce prompt'u döndür, başka açıklama yapma.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Image analysis error:', error);
    throw error;
  }
}

/**
 * Generate image based on reference image
 * Creates a new, copyright-free version inspired by the reference
 */
export async function generateImageFromReference(
  referenceImageUrl: string,
  context: {
    type: 'listing' | 'article' | 'neighborhood' | 'hero';
    propertyType?: string;
    location?: string;
    features?: string[];
  }
): Promise<{ url: string; revised_prompt?: string }> {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    // Analyze reference image
    const analysisPrompt = await analyzeImageForPrompt(referenceImageUrl);

    // Create enhanced prompt combining analysis with context
    const enhancedPrompt = `Create a professional real estate photography image inspired by this style and composition: ${analysisPrompt}

Context: ${context.type === 'listing' ? `Property type: ${context.propertyType || 'property'}, Location: ${context.location || 'Karasu, Sakarya, Turkey'}, Features: ${context.features?.join(', ') || 'modern'}` : context.type === 'article' ? `Article about: ${context.propertyType || 'real estate'} in ${context.location || 'Karasu, Sakarya, Turkey'}` : context.type === 'neighborhood' ? `Neighborhood: ${context.location || 'Karasu, Sakarya, Turkey'}` : ''}

Requirements:
- Professional real estate photography style
- High quality, photorealistic, realistic
- Natural lighting, professional composition
- Wide angle view
- No text, no watermark, no people visible
- Original and completely copyright-free
- Inspired by the reference style but with unique composition, different angles, and original elements
- Turkish real estate context: ${context.location || 'Karasu, Sakarya'} area`;

    // Generate image using DALL-E 3
    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt: enhancedPrompt,
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
      n: 1,
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
    console.error('Image generation from reference error:', error);
    throw new Error(`Failed to generate image: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Find reference image and generate new image
 * Searches Unsplash and Pexels for free images, then creates copyright-free variations
 */
export async function findReferenceAndGenerate(
  query: string,
  context: {
    type: 'listing' | 'article' | 'neighborhood' | 'hero';
    propertyType?: string;
    location?: string;
    features?: string[];
  }
): Promise<{ url: string; revised_prompt?: string; referenceUrl?: string }> {
  // Geçici olarak referans görsel analizini devre dışı bırakıyoruz
  // Direkt AI ile profesyonel görseller oluşturuyoruz
  console.log(`🎨 Generating image directly with AI for: "${query}"`);
  
  const { generateImage, generateRealEstatePrompt } = await import('./image-generation');
  const prompt = generateRealEstatePrompt({
    type: context.type,
    propertyType: context.propertyType,
    location: context.location,
    features: context.features,
    style: 'modern',
    timeOfDay: 'daylight',
    season: 'summer',
  });
  
  const generated = await generateImage(
    prompt,
    {
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
    }
  );
  
  return {
    ...generated,
  };
}

