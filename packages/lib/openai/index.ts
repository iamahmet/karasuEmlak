import OpenAI from 'openai';
import { getEnv } from '@karasu-emlak/config';

let openaiClient: OpenAI | null = null;

/**
 * Get OpenAI client instance
 * 
 * @returns OpenAI client or null if API key is not configured
 */
export function getOpenAIClient(): OpenAI | null {
  if (openaiClient) {
    return openaiClient;
  }

  const env = getEnv();
  
  if (!env.OPENAI_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  OpenAI API key not configured');
    }
    return null;
  }

  openaiClient = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });

  return openaiClient;
}

/**
 * Generate text using OpenAI
 * 
 * @param prompt - Prompt text
 * @param options - Optional parameters
 * @returns Generated text
 */
export async function generateText(
  prompt: string,
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const client = getOpenAIClient();
  
  if (!client) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: options?.max_tokens || 1000,
      temperature: options?.temperature || 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate text with OpenAI');
  }
}

/**
 * Generate SEO-optimized content
 * 
 * @param topic - Content topic
 * @param keywords - SEO keywords
 * @param options - Optional parameters
 * @returns Generated content
 */
export async function generateSEOContent(
  topic: string,
  keywords: string[],
  options?: {
    length?: 'short' | 'medium' | 'long';
    tone?: 'professional' | 'casual' | 'technical';
  }
): Promise<{
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  excerpt: string;
}> {
  const lengthMap = {
    short: 300,
    medium: 800,
    long: 1500,
  };

  const prompt = `Write an SEO-optimized article about "${topic}" using these keywords: ${keywords.join(', ')}.

Requirements:
- Title: Catchy and SEO-friendly (50-60 characters)
- Content: ${lengthMap[options?.length || 'medium']} words, ${options?.tone || 'professional'} tone
- Meta title: SEO-optimized (50-60 characters)
- Meta description: Compelling summary (150-160 characters)
- Excerpt: Brief summary (100-150 characters)

Format the response as JSON:
{
  "title": "...",
  "content": "...",
  "meta_title": "...",
  "meta_description": "...",
  "excerpt": "..."
}`;

  const response = await generateText(prompt, {
    max_tokens: 2000,
    temperature: 0.7,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      title: parsed.title || topic,
      content: parsed.content || '',
      meta_title: parsed.meta_title || parsed.title || topic,
      meta_description: parsed.meta_description || '',
      excerpt: parsed.excerpt || '',
    };
  } catch {
    // Fallback if JSON parsing fails
    return {
      title: topic,
      content: response,
      meta_title: topic,
      meta_description: response.substring(0, 160),
      excerpt: response.substring(0, 150),
    };
  }
}

/**
 * Generate schema suggestions using OpenAI
 * 
 * @param content - Content data
 * @returns Schema suggestions
 */
export async function generateSchemaSuggestions(content: {
  title: string;
  content?: string;
  author?: string;
  publishedAt?: string;
  image?: string;
}): Promise<any> {
  const client = getOpenAIClient();
  
  if (!client) {
    // Return basic schema if OpenAI is not configured
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: content.title,
      description: content.content?.substring(0, 160) || '',
      image: content.image,
      datePublished: content.publishedAt || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: content.author || 'Karasu Emlak',
      },
    };
  }

  try {
    const prompt = `Generate JSON-LD structured data (Schema.org Article) for this content:

Title: ${content.title}
Content: ${content.content?.substring(0, 500) || ''}
Author: ${content.author || 'Karasu Emlak'}
Published: ${content.publishedAt || new Date().toISOString()}
Image: ${content.image || ''}

Return only valid JSON-LD without markdown formatting.`;

    const response = await generateText(prompt, {
      max_tokens: 500,
      temperature: 0.3,
    });

    try {
      return JSON.parse(response);
    } catch {
      // Fallback to basic schema
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: content.title,
        description: content.content?.substring(0, 160) || '',
        image: content.image,
        datePublished: content.publishedAt || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: content.author || 'Karasu Emlak',
        },
      };
    }
  } catch (error) {
    console.error('Failed to generate schema suggestions:', error);
    // Return basic schema on error
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: content.title,
      description: content.content?.substring(0, 160) || '',
      image: content.image,
      datePublished: content.publishedAt || new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: content.author || 'Karasu Emlak',
      },
    };
  }
}

// Export image generation functions
export * from './image-generation';

