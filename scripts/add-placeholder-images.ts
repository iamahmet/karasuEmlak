/**
 * Quick Placeholder Images Script
 * Adds placeholder images quickly so site doesn't look empty
 * Admin panel can replace them with AI-generated images later
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { createServiceClient } from '../packages/lib/supabase/service';

const supabase = createServiceClient();

// Placeholder image URLs from Unsplash (free, no API key needed)
const PLACEHOLDER_IMAGES = {
  listing: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1568605117035-9c5c0b3b0e5f?w=800',
  ],
  article: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    'https://images.unsplash.com/photo-1568605117035-9c5c0b3b0e5f?w=1200',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200',
  ],
  neighborhood: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
  ],
};

function getRandomPlaceholder(type: 'listing' | 'article' | 'neighborhood'): string {
  const images = PLACEHOLDER_IMAGES[type];
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Add placeholder images to listings
 */
async function addPlaceholderToListings() {
  console.log('📸 Adding placeholder images to listings...');
  
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, images')
    .eq('published', true)
    .or('images.is.null,images.eq.[]')
    .limit(50);

  if (error) {
    console.error('Error fetching listings:', error);
    return;
  }

  if (!listings || listings.length === 0) {
    console.log('✅ All listings have images');
    return;
  }

  console.log(`Found ${listings.length} listings without images`);

  for (const listing of listings) {
    const placeholderUrl = getRandomPlaceholder('listing');
    
    // Store as Cloudinary public_id format (we'll use URL directly for now)
    const { error: updateError } = await supabase
      .from('listings')
      .update({
        images: [{
          public_id: `placeholder/${listing.id}`,
          url: placeholderUrl,
          alt: listing.title,
          order: 0,
          is_placeholder: true, // Flag to identify placeholder images
        }],
      })
      .eq('id', listing.id);

    if (updateError) {
      console.error(`❌ Failed to update listing ${listing.id}:`, updateError);
    } else {
      console.log(`✅ Added placeholder to: ${listing.title.substring(0, 50)}...`);
    }
  }
}

/**
 * Add placeholder images to articles
 */
async function addPlaceholderToArticles() {
  console.log('\n📸 Adding placeholder images to articles...');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, featured_image')
    .eq('status', 'published')
    .is('featured_image', null)
    .limit(100);

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('✅ All articles have featured images');
    return;
  }

  console.log(`Found ${articles.length} articles without featured images`);

  for (const article of articles) {
    const placeholderUrl = getRandomPlaceholder('article');
    
    // Store placeholder URL directly (can be replaced later)
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        featured_image: `placeholder:${placeholderUrl}`, // Prefix to identify placeholder
      })
      .eq('id', article.id);

    if (updateError) {
      console.error(`❌ Failed to update article ${article.id}:`, updateError);
    } else {
      console.log(`✅ Added placeholder to: ${article.title.substring(0, 50)}...`);
    }
  }
}

/**
 * Add placeholder images to neighborhoods
 */
async function addPlaceholderToNeighborhoods() {
  console.log('\n📸 Adding placeholder images to neighborhoods...');
  
  const { data: neighborhoods, error } = await supabase
    .from('neighborhoods')
    .select('id, name, image_public_id')
    .eq('published', true)
    .is('image_public_id', null)
    .limit(20);

  if (error) {
    console.error('Error fetching neighborhoods:', error);
    return;
  }

  if (!neighborhoods || neighborhoods.length === 0) {
    console.log('✅ All neighborhoods have images');
    return;
  }

  console.log(`Found ${neighborhoods.length} neighborhoods without images`);

  for (const neighborhood of neighborhoods) {
    const placeholderUrl = getRandomPlaceholder('neighborhood');
    
    const { error: updateError } = await supabase
      .from('neighborhoods')
      .update({
        image_public_id: `placeholder:${placeholderUrl}`,
      })
      .eq('id', neighborhood.id);

    if (updateError) {
      console.error(`❌ Failed to update neighborhood ${neighborhood.id}:`, updateError);
    } else {
      console.log(`✅ Added placeholder to: ${neighborhood.name}`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Quick Placeholder Images Process...\n');
  
  try {
    await addPlaceholderToListings();
    await addPlaceholderToArticles();
    await addPlaceholderToNeighborhoods();
    
    console.log('\n✅ Placeholder images added successfully!');
    console.log('💡 Tip: Use admin panel to replace placeholders with AI-generated images later.');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

