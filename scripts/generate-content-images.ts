#!/usr/bin/env tsx
/**
 * Content Image Generator Script
 * 
 * Automatically generates images for news articles and blog posts that don't have images.
 * Uses media library first, then AI generation if needed.
 * 
 * Usage:
 *   pnpm scripts:generate-content-images [--type=news|articles|all] [--limit=10] [--dry-run]
 * 
 * Examples:
 *   pnpm scripts:generate-content-images --type=news --limit=5
 *   pnpm scripts:generate-content-images --type=articles --limit=10 --dry-run
 *   pnpm scripts:generate-content-images --type=all --limit=20
 * 
 * Note: For AI generation, the web app must be running (localhost:3000) or set NEXT_PUBLIC_SITE_URL
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { searchImagesComprehensive } from '../packages/lib/openai/image-search';
import { getCloudinaryClient } from '../packages/lib/cloudinary/client';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Create Supabase service client
function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Query media assets (simplified version for script)
async function queryMediaAssets(options: {
  entityType?: 'listing' | 'article' | 'news' | 'neighborhood' | 'other';
  assetType?: 'listing_image' | 'blog_image' | 'og_image' | 'neighborhood_image' | 'other';
  limit?: number;
  aiGenerated?: boolean;
}): Promise<MediaAsset[]> {
  const supabase = createServiceClient();
  const {
    entityType,
    assetType,
    limit = 50,
    aiGenerated,
  } = options;

  let query = supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  if (assetType) {
    query = query.eq('asset_type', assetType);
  }

  if (aiGenerated !== undefined) {
    query = query.eq('ai_generated', aiGenerated);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error querying media assets:', error);
    return [];
  }

  return (data as MediaAsset[]) || [];
}

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  og_image: string | null;
  original_summary: string | null;
  seo_description: string | null;
  published: boolean;
}

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  featured_image: string | null;
  excerpt: string | null;
  meta_description: string | null;
  category: string | null;
  status: string;
}

interface MediaAsset {
  id: string;
  cloudinary_public_id: string;
  cloudinary_secure_url: string;
  asset_type: string;
  entity_type: string | null;
  alt_text: string | null;
  title: string | null;
  usage_count: number | null;
}

/**
 * Find suitable image from media library
 */
async function findSuitableImage(
  content: NewsArticle | BlogArticle,
  type: 'news' | 'article'
): Promise<MediaAsset | null> {
  try {
    // Search media assets by type
    // Try both 'news' and 'article' entity types, and 'blog_image' asset type
    const assets = await queryMediaAssets({
      assetType: 'blog_image', // Both news and articles use blog_image
      limit: 50,
      aiGenerated: true,
    });

    if (assets.length === 0) {
      console.log(`  ℹ️  No images found in media library`);
      return null;
    }

    console.log(`  ℹ️  Found ${assets.length} images in media library, searching for match...`);

    // Try to find matching asset by keywords
    const titleWords = content.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    // Score assets by relevance
    const scoredAssets = assets.map(asset => {
      const assetText = `${asset.alt_text || ''} ${asset.title || ''}`.toLowerCase();
      let score = 0;
      
      // Exact word matches
      titleWords.forEach(word => {
        if (assetText.includes(word)) {
          score += 2;
        }
      });
      
      // Partial matches
      titleWords.forEach(word => {
        if (assetText.includes(word.substring(0, Math.max(3, word.length - 1)))) {
          score += 1;
        }
      });
      
      // Category/type match
      if (asset.entity_type === type) {
        score += 1;
      }
      
      return { asset, score };
    }).filter(item => item.score > 0)
      .sort((a, b) => {
        // Sort by score (desc), then by usage count (asc - prefer less used)
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return (a.asset.usage_count || 0) - (b.asset.usage_count || 0);
      });

    if (scoredAssets.length > 0) {
      return scoredAssets[0].asset;
    }

    // If no match found, return least used asset
    return assets.sort((a, b) => (a.usage_count || 0) - (b.usage_count || 0))[0];
  } catch (error) {
    console.error(`  ⚠️  Error searching media library:`, error);
    return null;
  }
}

/**
 * Upload image from URL to Cloudinary with retry
 */
async function uploadImageFromUrl(
  imageUrl: string,
  options: {
    publicId?: string;
    folder?: string;
    tags?: string[];
    retries?: number;
  } = {}
): Promise<{
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
} | null> {
  const { retries = 3 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const cloudinaryClient = getCloudinaryClient();
      
      // Download image with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      let response: Response;
      try {
        response = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; KarasuEmlak/1.0)',
          },
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (attempt < retries) {
          console.log(`  ⚠️  Download attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        }
        throw fetchError;
      }
      
      if (!response.ok) {
        if (attempt < retries && response.status >= 500) {
          console.log(`  ⚠️  Server error (${response.status}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryClient.uploader.upload_stream(
        {
          public_id: options.publicId,
          folder: options.folder, // Use folder only if provided, otherwise publicId includes path
          resource_type: 'image',
          quality: 'auto',
          tags: [...(options.tags || [])],
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (attempt === retries) {
        console.error(`  ✗ Upload error after ${retries} attempts:`, errorMessage);
        return null;
      }
      // Continue to next attempt
    }
  }
  
  return null;
}

/**
 * Generate or fetch image for content
 * Tries multiple sources: AI generation -> Free image sources -> Placeholder
 */
async function generateImageForContent(
  content: NewsArticle | BlogArticle,
  type: 'news' | 'article'
): Promise<string | null> {
  const description = 
    (content as NewsArticle).original_summary || 
    (content as NewsArticle).seo_description ||
    (content as BlogArticle).excerpt ||
    (content as BlogArticle).meta_description ||
    content.title;

  const category = (content as BlogArticle).category || 'emlak';

  // Strategy 1: Try AI generation (if API available and not rate limited)
  try {
    const baseUrls = [
      'http://localhost:3000',
      process.env.API_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
    ].filter(Boolean) as string[];
    
    let baseUrl: string | null = null;
    
    for (const url of baseUrls) {
      try {
        const healthCheck = await fetch(`${url}/healthz`, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });
        if (healthCheck.ok || healthCheck.status === 404) {
          baseUrl = url;
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (baseUrl) {
      const response = await fetch(`${baseUrl}/api/ai/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'article',
          context: { title: content.title, category, description },
          options: { size: '1792x1024', quality: 'hd', style: 'natural' },
          upload: {
            folder: type === 'news' ? 'news' : 'articles',
            entityType: type,
            entityId: content.id,
            alt: content.title,
            tags: [type, category],
          },
        }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.public_id) {
          console.log(`  ✓ AI generated image: ${result.public_id}`);
          return result.public_id;
        }
      }
    }
  } catch (error) {
    // AI generation failed, continue to free sources
    console.log(`  ⚠️  AI generation unavailable, trying free image sources...`);
  }

  // Strategy 2: Use free image sources (Unsplash, Pexels, Pixabay)
  try {
    // Generate search query from content
    const titleWords = content.title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 3);

    const queryParts = [
      ...titleWords,
      category,
      type === 'news' ? 'news' : 'article',
      'real estate',
      'karasu',
      'turkey',
    ].filter(Boolean);

    const imageQuery = queryParts.join(' ');
    console.log(`  → Searching free images for: "${imageQuery}"`);
    
    // Search multiple sources
    const imageResults = await searchImagesComprehensive(imageQuery, {
      maxResults: 1,
      sources: ['unsplash', 'pexels', 'pixabay'],
    });

    if (imageResults.length > 0) {
      // Try each image result until one succeeds
      for (const selectedImage of imageResults) {
        console.log(`  → Trying image from ${selectedImage.source}...`);
        
        // Upload to Cloudinary
        // Use folder parameter, not publicId with path (to avoid double folder structure)
        const uploaded = await uploadImageFromUrl(selectedImage.url, {
          publicId: content.slug, // Just the slug, folder will be added
          folder: type === 'news' ? 'news' : 'articles',
          tags: [type, category, selectedImage.source, 'free-image'],
          retries: 2,
        });

        if (uploaded) {
          // Save to media_assets table
          try {
            const supabase = createServiceClient();
            await supabase.from('media_assets').insert({
              cloudinary_public_id: uploaded.public_id,
              cloudinary_url: uploaded.url,
              cloudinary_secure_url: uploaded.secure_url,
              asset_type: 'blog_image',
              entity_type: type,
              entity_id: content.id,
              width: uploaded.width,
              height: uploaded.height,
              format: uploaded.format,
              alt_text: content.title,
              title: content.title,
              ai_generated: false,
              usage_count: 1,
              last_used_at: new Date().toISOString(),
            });
          } catch (dbError) {
            // Ignore database errors, image is uploaded to Cloudinary
            console.log(`  ⚠️  Database insert failed (image uploaded):`, dbError instanceof Error ? dbError.message : 'Unknown error');
          }

          console.log(`  ✓ Uploaded to Cloudinary: ${uploaded.public_id}`);
          return uploaded.public_id;
        }
      }
      
      // If all images failed, fall through to placeholder
      console.log(`  ⚠️  All image sources failed, using placeholder`);
    }
    
    // Fallback: Use placeholder service (always available)
    console.log(`  → Using placeholder image`);
    const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(content.title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
    
    const uploaded = await uploadImageFromUrl(placeholderUrl, {
      publicId: content.slug, // Just the slug, folder will be added
      folder: type === 'news' ? 'news' : 'articles',
      tags: [type, category, 'placeholder'],
      retries: 3,
    });

    if (uploaded) {
      try {
        const supabase = createServiceClient();
        await supabase.from('media_assets').insert({
          cloudinary_public_id: uploaded.public_id,
          cloudinary_url: uploaded.url,
          cloudinary_secure_url: uploaded.secure_url,
          asset_type: 'blog_image',
          entity_type: type,
          entity_id: content.id,
          width: uploaded.width,
          height: uploaded.height,
          format: uploaded.format,
          alt_text: content.title,
          title: content.title,
          ai_generated: false,
          usage_count: 1,
          last_used_at: new Date().toISOString(),
        });
      } catch (dbError) {
        // Ignore database errors, image is uploaded to Cloudinary
        console.log(`  ⚠️  Database insert failed (image uploaded):`, dbError instanceof Error ? dbError.message : 'Unknown error');
      }

      console.log(`  ✓ Uploaded placeholder to Cloudinary: ${uploaded.public_id}`);
      return uploaded.public_id;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`  ✗ Free image source error:`, errorMessage);
  }

  return null;
}

/**
 * Update content with image
 */
async function updateContentImage(
  content: NewsArticle | BlogArticle,
  imagePublicId: string,
  type: 'news' | 'article'
): Promise<boolean> {
  const supabase = createServiceClient();

  try {
    if (type === 'news') {
      const { error } = await supabase
        .from('news_articles')
        .update({
          cover_image: imagePublicId,
          og_image: imagePublicId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      if (error) {
        console.error(`Failed to update news article ${content.id}:`, error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('articles')
        .update({
          featured_image: imagePublicId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      if (error) {
        console.error(`Failed to update article ${content.id}:`, error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`Error updating ${type} ${content.id}:`, error);
    return false;
  }
}

/**
 * Process news articles
 */
async function processNewsArticles(limit: number, dryRun: boolean): Promise<void> {
  const supabase = createServiceClient();

  console.log('\n📰 Processing News Articles...\n');

  const { data: articles, error } = await supabase
    .from('news_articles')
    .select('id, title, slug, cover_image, og_image, original_summary, seo_description, published')
    .eq('published', true)
    .is('cover_image', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching news articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No news articles without images found.');
    return;
  }

  console.log(`Found ${articles.length} news articles without images.\n`);

  let processed = 0;
  let reused = 0;
  let generated = 0;
  let failed = 0;

  for (const article of articles) {
    console.log(`Processing: ${article.title}`);

    // Try to find existing image from media library
    try {
      const existingImage = await findSuitableImage(article, 'news');

      if (existingImage) {
        console.log(`  ✓ Found existing image: ${existingImage.cloudinary_public_id}`);
        
        if (!dryRun) {
          const updated = await updateContentImage(article, existingImage.cloudinary_public_id, 'news');
          if (updated) {
            reused++;
            processed++;
            console.log(`  ✓ Updated with existing image\n`);
            continue;
          } else {
            failed++;
            console.log(`  ✗ Failed to update\n`);
          }
        } else {
          reused++;
          console.log(`  [DRY RUN] Would update with existing image\n`);
          continue;
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Error searching media library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Generate new image
    console.log(`  → Generating new image...`);
    
    if (!dryRun) {
      const imagePublicId = await generateImageForContent(article, 'news');
      
      if (imagePublicId) {
        const updated = await updateContentImage(article, imagePublicId, 'news');
        if (updated) {
          generated++;
          processed++;
          console.log(`  ✓ Generated and updated: ${imagePublicId}\n`);
        } else {
          failed++;
          console.log(`  ✗ Generated but failed to update\n`);
        }
      } else {
        failed++;
        console.log(`  ✗ Failed to generate image\n`);
      }
    } else {
      generated++;
      console.log(`  [DRY RUN] Would generate new image\n`);
    }

    // Rate limiting: wait between requests
    if (!dryRun && processed < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }
  }

  console.log(`\n📊 News Articles Summary:`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Reused from library: ${reused}`);
  console.log(`   Generated new: ${generated}`);
  console.log(`   Failed: ${failed}`);
}

/**
 * Process blog articles
 */
async function processBlogArticles(limit: number, dryRun: boolean): Promise<void> {
  const supabase = createServiceClient();

  console.log('\n📝 Processing Blog Articles...\n');

  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, featured_image, excerpt, meta_description, category, status')
    .eq('status', 'published')
    .is('featured_image', null)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching blog articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('✅ No blog articles without images found.');
    return;
  }

  console.log(`Found ${articles.length} blog articles without images.\n`);

  let processed = 0;
  let reused = 0;
  let generated = 0;
  let failed = 0;

  for (const article of articles) {
    console.log(`Processing: ${article.title}`);

    // Try to find existing image from media library
    try {
      const existingImage = await findSuitableImage(article, 'article');

      if (existingImage) {
        console.log(`  ✓ Found existing image: ${existingImage.cloudinary_public_id}`);
        
        if (!dryRun) {
          const updated = await updateContentImage(article, existingImage.cloudinary_public_id, 'article');
          if (updated) {
            reused++;
            processed++;
            console.log(`  ✓ Updated with existing image\n`);
            continue;
          } else {
            failed++;
            console.log(`  ✗ Failed to update\n`);
          }
        } else {
          reused++;
          console.log(`  [DRY RUN] Would update with existing image\n`);
          continue;
        }
      }
    } catch (error) {
      console.log(`  ⚠️  Error searching media library: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Generate new image
    console.log(`  → Generating new image...`);
    
    if (!dryRun) {
      const imagePublicId = await generateImageForContent(article, 'article');
      
      if (imagePublicId) {
        const updated = await updateContentImage(article, imagePublicId, 'article');
        if (updated) {
          generated++;
          processed++;
          console.log(`  ✓ Generated and updated: ${imagePublicId}\n`);
        } else {
          failed++;
          console.log(`  ✗ Generated but failed to update\n`);
        }
      } else {
        failed++;
        console.log(`  ✗ Failed to generate image\n`);
      }
    } else {
      generated++;
      console.log(`  [DRY RUN] Would generate new image\n`);
    }

    // Rate limiting: wait between requests
    if (!dryRun && processed < articles.length) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
    }
  }

  console.log(`\n📊 Blog Articles Summary:`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Reused from library: ${reused}`);
  console.log(`   Generated new: ${generated}`);
  console.log(`   Failed: ${failed}`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  const typeArg = args.find(arg => arg.startsWith('--type='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const dryRun = args.includes('--dry-run');

  const type = typeArg?.split('=')[1] || 'all';
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;

  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  console.log('🚀 Content Image Generator');
  console.log(`   Type: ${type}`);
  console.log(`   Limit: ${limit}`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}\n`);

  try {
    if (type === 'news' || type === 'all') {
      await processNewsArticles(limit, dryRun);
    }

    if (type === 'articles' || type === 'all') {
      await processBlogArticles(limit, dryRun);
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

