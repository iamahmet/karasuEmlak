/**
 * SEO Domination - Image Generator for Articles
 * 
 * Generates featured images for SEO domination articles
 * Uses existing image generation infrastructure
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { generateArticleImage } from '@/lib/ai/image-generator';
import { uploadAIImage } from '@/lib/cloudinary/ai-upload';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Generate and upload image for article
 */
async function generateArticleFeaturedImage(article: {
  id: string;
  title: string;
  slug: string;
  content: string;
  category_slug?: string | null;
}) {
  try {
    // Check if image already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('featured_image')
      .eq('id', article.id)
      .single();

    if (existing?.featured_image) {
      console.log(`⏭️  Image already exists for: ${article.title}`);
      return;
    }

    // Create context for image generation
    const context = {
      title: article.title,
      content: article.content.substring(0, 500),
      category: article.category_slug || 'blog',
      type: 'article',
    };

    // Generate image
    console.log(`🎨 Generating image for: ${article.title}`);
    
    const imageUrl = await generateArticleImage(context, {
      size: '1792x1024',
      quality: 'hd',
      style: 'natural',
    });

    if (!imageUrl) {
      console.log(`⚠️  Image generation failed, using placeholder`);
      // Use placeholder
      const placeholderUrl = `https://placehold.co/1792x1024/006AFF/FFFFFF?text=${encodeURIComponent(article.title.substring(0, 40).replace(/[^\w\s]/g, ''))}`;
      
      // Upload placeholder to Cloudinary
      const uploaded = await uploadAIImage({
        imageUrl: placeholderUrl,
        publicId: article.slug,
        folder: 'articles',
        entityType: 'article',
        entityId: article.id,
        alt: article.title,
        tags: ['placeholder', article.category_slug || 'blog'],
        context,
        size: '1792x1024',
        quality: 'hd',
      });

      if (uploaded) {
        await supabase
          .from('articles')
          .update({ featured_image: uploaded.public_id })
          .eq('id', article.id);
        
        console.log(`✅ Placeholder uploaded: ${uploaded.public_id}`);
      }
      return;
    }

    // Upload to Cloudinary
    const uploaded = await uploadAIImage({
      imageUrl,
      publicId: article.slug,
      folder: 'articles',
      entityType: 'article',
      entityId: article.id,
      alt: article.title,
      tags: ['ai-generated', article.category_slug || 'blog', 'seo-domination'],
      prompt: `Professional real estate image for: ${article.title}`,
      context,
      size: '1792x1024',
      quality: 'hd',
    });

    if (!uploaded) {
      console.log(`❌ Upload failed for: ${article.title}`);
      return;
    }

    // Update article with image
    const { error } = await supabase
      .from('articles')
      .update({ featured_image: uploaded.public_id })
      .eq('id', article.id);

    if (error) {
      console.error(`❌ Failed to update article:`, error);
      return;
    }

    console.log(`✅ Image generated and uploaded: ${uploaded.public_id}`);
    
    // Log SEO event
    await supabase.from('seo_events').insert({
      event_type: 'image_generated',
      entity_type: 'article',
      entity_id: article.id,
      event_data: {
        article_title: article.title,
        image_public_id: uploaded.public_id,
      },
      status: 'completed',
    });

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (error: any) {
    console.error(`❌ Error generating image for ${article.title}:`, error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎨 SEO Domination - Image Generator\n');

  // Get articles without featured images
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, content, category_slug')
    .or('featured_image.is.null,featured_image.eq.')
    .eq('status', 'draft')
    .limit(30);

  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('No articles found without images');
    return;
  }

  console.log(`Found ${articles.length} articles without images\n`);

  let generated = 0;
  let skipped = 0;

  for (const article of articles) {
    try {
      await generateArticleFeaturedImage(article);
      generated++;
    } catch (error: any) {
      console.error(`Error processing ${article.title}:`, error.message);
      skipped++;
    }
  }

  console.log(`\n\n✨ Image generation completed!`);
  console.log(`📊 Statistics:`);
  console.log(`   ✅ Generated: ${generated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateArticleFeaturedImage };
