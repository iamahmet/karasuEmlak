/**
 * Generate Missing Images Script
 * 
 * Scans the database for listings, articles, and neighborhoods without images
 * and generates realistic images using OpenAI DALL-E with reference images from Unsplash/Pexels
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

import { createServiceClient } from '../packages/lib/supabase/service';
import { generateListingImage, generateArticleImage, generateNeighborhoodImage } from '../packages/lib/openai/image-generation';
import { generateAndUploadImage } from '../apps/web/lib/cloudinary/ai-upload';
import { checkRateLimit } from '../apps/web/lib/ai/rate-limiter';
import { findExistingImage, generateContextHash } from '../apps/web/lib/ai/image-cache';

const supabase = createServiceClient();

interface Listing {
  id: string;
  title: string;
  property_type: string;
  location_district: string;
  location_neighborhood: string;
  status: 'satilik' | 'kiralik';
  features: any;
  images: any[];
}

interface Article {
  id: string;
  title: string;
  category: string | null;
  content: string | null;
  featured_image: string | null;
}

interface Neighborhood {
  id: string;
  name: string;
  district: string;
  description: string | null;
}

/**
 * Generate images for listings without images
 */
async function generateListingImages() {
  console.log('🔍 Scanning listings without images...');
  
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, property_type, location_district, location_neighborhood, status, features, images')
    .eq('published', true)
    .is('deleted_at', null)
    .or('images.is.null,images.eq.[]');

  if (error) {
    console.error('Error fetching listings:', error);
    return;
  }

  if (!listings || listings.length === 0) {
    console.log('✅ All listings have images');
    return;
  }

  console.log(`📸 Found ${listings.length} listings without images`);

  for (const listing of listings as Listing[]) {
    try {
      // Check rate limit
      const rateLimit = await checkRateLimit();
      if (!rateLimit.allowed) {
        console.warn(`⏸️  Rate limit reached: ${rateLimit.reason}`);
        console.log(`⏳ Waiting ${rateLimit.retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (rateLimit.retryAfter || 3600) * 1000));
      }

      console.log(`\n🎨 Generating image for: ${listing.title}`);
      
      const context = {
        title: listing.title,
        propertyType: listing.property_type,
        location: `${listing.location_neighborhood}, ${listing.location_district}`,
        features: listing.features,
        status: listing.status,
      };

      // Check cache first
      const contextHash = generateContextHash(context);
      const existing = await findExistingImage({
        entityType: 'listing',
        entityId: listing.id,
        contextHash,
      });

      if (existing) {
        console.log(`✅ Using cached image: ${existing.cloudinary_public_id}`);
        // Update listing with cached image
        const { error: updateError } = await supabase
          .from('listings')
          .update({
            images: [{
              public_id: existing.cloudinary_public_id,
              url: existing.cloudinary_secure_url,
              alt: `${listing.title} - ${listing.location_neighborhood}, ${listing.location_district}`,
              order: 0,
            }],
          })
          .eq('id', listing.id);

        if (updateError) {
          console.error(`❌ Failed to update listing ${listing.id}:`, updateError);
        } else {
          console.log(`✅ Updated listing with cached image`);
        }
        continue;
      }
      
      const uploaded = await generateAndUploadImage(
        () => generateListingImage(context, {
          size: '1792x1024',
          quality: 'hd',
          style: 'natural',
        }),
        {
          folder: 'listings',
          entityType: 'listing',
          entityId: listing.id,
          alt: `${listing.title} - ${listing.location_neighborhood}, ${listing.location_district}`,
          tags: [listing.property_type, listing.status, listing.location_district.toLowerCase()],
          context,
          size: '1792x1024',
          quality: 'hd',
        }
      );

      // Update listing with generated image
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          images: [{
            public_id: uploaded.public_id,
            url: uploaded.secure_url,
            alt: `${listing.title} - ${listing.location_neighborhood}, ${listing.location_district}`,
            order: 0,
          }],
        })
        .eq('id', listing.id);

      if (updateError) {
        console.error(`❌ Failed to update listing ${listing.id}:`, updateError);
      } else {
        console.log(`✅ Generated and uploaded image for: ${listing.title}`);
        console.log(`   Public ID: ${uploaded.public_id}`);
      }

      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error generating image for ${listing.title}:`, error);
    }
  }
}

/**
 * Generate images for articles without featured images
 */
async function generateArticleImages() {
  console.log('\n🔍 Scanning articles without featured images...');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, category, content, featured_image')
    .eq('status', 'published')
    .is('featured_image', null);

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('✅ All articles have featured images');
    return;
  }

  console.log(`📸 Found ${articles.length} articles without featured images`);

  for (const article of articles as Article[]) {
    try {
      // Check rate limit
      const rateLimit = await checkRateLimit();
      if (!rateLimit.allowed) {
        console.warn(`⏸️  Rate limit reached: ${rateLimit.reason}`);
        console.log(`⏳ Waiting ${rateLimit.retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (rateLimit.retryAfter || 3600) * 1000));
      }

      console.log(`\n🎨 Generating image for: ${article.title}`);
      
      const context = {
        title: article.title,
        category: article.category || undefined,
        content: article.content || undefined,
      };

      // Check cache first
      const contextHash = generateContextHash(context);
      const existing = await findExistingImage({
        entityType: 'article',
        entityId: article.id,
        contextHash,
      });

      if (existing) {
        console.log(`✅ Using cached image: ${existing.cloudinary_public_id}`);
        // Update article with cached image
        const { error: updateError } = await supabase
          .from('articles')
          .update({
            featured_image: existing.cloudinary_public_id,
          })
          .eq('id', article.id);

        if (updateError) {
          console.error(`❌ Failed to update article ${article.id}:`, updateError);
        } else {
          console.log(`✅ Updated article with cached image`);
        }
        continue;
      }
      
      const uploaded = await generateAndUploadImage(
        () => generateArticleImage(context, {
          size: '1792x1024',
          quality: 'hd',
          style: 'natural',
        }),
        {
          folder: 'articles',
          entityType: 'article',
          entityId: article.id,
          alt: article.title,
          tags: article.category ? [article.category.toLowerCase()] : ['blog'],
          context,
          size: '1792x1024',
          quality: 'hd',
        }
      );

      // Update article with generated image
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          featured_image: uploaded.public_id,
        })
        .eq('id', article.id);

      if (updateError) {
        console.error(`❌ Failed to update article ${article.id}:`, updateError);
      } else {
        console.log(`✅ Generated and uploaded image for: ${article.title}`);
        console.log(`   Public ID: ${uploaded.public_id}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error generating image for ${article.title}:`, error);
    }
  }
}

/**
 * Generate images for neighborhoods without images
 */
async function generateNeighborhoodImages() {
  console.log('\n🔍 Scanning neighborhoods without images...');
  
  const { data: neighborhoods, error } = await supabase
    .from('neighborhoods')
    .select('id, name, district, description')
    .eq('published', true)
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching neighborhoods:', error);
    return;
  }

  if (!neighborhoods || neighborhoods.length === 0) {
    console.log('✅ No neighborhoods found');
    return;
  }

  console.log(`📸 Processing ${neighborhoods.length} neighborhoods`);

  for (const neighborhood of neighborhoods as Neighborhood[]) {
    try {
      // Check rate limit
      const rateLimit = await checkRateLimit();
      if (!rateLimit.allowed) {
        console.warn(`⏸️  Rate limit reached: ${rateLimit.reason}`);
        console.log(`⏳ Waiting ${rateLimit.retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, (rateLimit.retryAfter || 3600) * 1000));
      }

      const context = {
        name: neighborhood.name,
        district: neighborhood.district,
        description: neighborhood.description || undefined,
      };

      // Check cache first
      const contextHash = generateContextHash(context);
      const existing = await findExistingImage({
        entityType: 'neighborhood',
        entityId: neighborhood.id,
        contextHash,
      });

      if (existing) {
        console.log(`✅ Using cached image for ${neighborhood.name}: ${existing.cloudinary_public_id}`);
        // Update neighborhood with cached image
        const { error: updateError } = await supabase
          .from('neighborhoods')
          .update({
            image_public_id: existing.cloudinary_public_id,
          })
          .eq('id', neighborhood.id);

        if (updateError) {
          console.error(`❌ Failed to update neighborhood ${neighborhood.id}:`, updateError);
        } else {
          console.log(`✅ Updated neighborhood with cached image`);
        }
        continue;
      }

      console.log(`\n🎨 Generating image for: ${neighborhood.name}`);
      
      const uploaded = await generateAndUploadImage(
        () => generateNeighborhoodImage(context, {
          size: '1792x1024',
          quality: 'hd',
          style: 'natural',
        }),
        {
          folder: 'neighborhoods',
          entityType: 'neighborhood',
          entityId: neighborhood.id,
          alt: `${neighborhood.name} mahallesi, ${neighborhood.district}`,
          tags: ['neighborhood', neighborhood.district.toLowerCase(), neighborhood.name.toLowerCase()],
          context,
          size: '1792x1024',
          quality: 'hd',
        }
      );

      // Update neighborhood with generated image
      const { error: updateError } = await supabase
        .from('neighborhoods')
        .update({
          image_public_id: uploaded.public_id,
        })
        .eq('id', neighborhood.id);

      if (updateError) {
        console.error(`❌ Failed to update neighborhood ${neighborhood.id}:`, updateError);
      } else {
        console.log(`✅ Generated and uploaded image for: ${neighborhood.name}`);
        console.log(`   Public ID: ${uploaded.public_id}`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error generating image for ${neighborhood.name}:`, error);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting AI Image Generation Process...\n');
  
  try {
    await generateListingImages();
    await generateArticleImages();
    await generateNeighborhoodImages();
    
    console.log('\n✅ Image generation process completed!');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main as generateMissingImages };

