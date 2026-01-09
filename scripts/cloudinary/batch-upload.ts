/**
 * Batch Image Upload Script
 * Uploads multiple images to Cloudinary with optimization
 */

import * as dotenv from 'dotenv';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { uploadImageFromUrl, uploadImageFromFile } from '@karasu/lib/cloudinary/client';
import { getOptimizedCloudinaryUrl } from '../../apps/web/lib/cloudinary/optimization';

dotenv.config({ path: '.env.local' });

interface BatchUploadOptions {
  source: 'url' | 'file' | 'database';
  folder?: string;
  tags?: string[];
  optimize?: boolean;
  limit?: number;
}

/**
 * Upload images from URLs
 */
async function uploadFromUrls(
  urls: string[],
  options: { folder?: string; tags?: string[] } = {}
): Promise<Array<{ url: string; public_id: string; success: boolean; error?: string }>> {
  const results = [];

  for (const url of urls) {
    try {
      const uploaded = await uploadImageFromUrl(url, {
        folder: options.folder || 'batch-upload',
        tags: options.tags || ['batch'],
      });

      if (uploaded) {
        results.push({
          url,
          public_id: uploaded.public_id,
          success: true,
        });
      } else {
        results.push({
          url,
          success: false,
          error: 'Upload failed',
        });
      }
    } catch (error: any) {
      results.push({
        url,
        success: false,
        error: error.message,
      });
    }

    // Rate limiting: wait 500ms between uploads
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

/**
 * Upload images from database (listings/articles without images)
 */
async function uploadFromDatabase(
  options: { entityType: 'listing' | 'article' | 'news'; limit?: number } = { entityType: 'listing' }
): Promise<number> {
  const supabase = createServiceClient();
  const { entityType, limit = 10 } = options;

  let table: string;
  let idField: string;
  let titleField: string;

  switch (entityType) {
    case 'listing':
      table = 'listings';
      idField = 'id';
      titleField = 'title';
      break;
    case 'article':
      table = 'articles';
      idField = 'id';
      titleField = 'title';
      break;
    case 'news':
      table = 'news_articles';
      idField = 'id';
      titleField = 'title';
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  // Find entities without images
  const { data, error } = await supabase
    .from(table)
    .select(`${idField}, ${titleField}`)
    .is('featured_image', null)
    .limit(limit);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    console.log(`No ${entityType} entities without images found.`);
    return 0;
  }

  console.log(`Found ${data.length} ${entityType} entities without images.`);
  console.log('Note: This script only identifies entities. Use AI image generation to create images.');

  return data.length;
}

/**
 * Main batch upload function
 */
async function batchUpload(options: BatchUploadOptions) {
  const { source, folder = 'batch-upload', tags = ['batch'], optimize = true, limit = 10 } = options;

  console.log('🚀 Starting batch upload...');
  console.log(`Source: ${source}`);
  console.log(`Folder: ${folder}`);
  console.log(`Tags: ${tags.join(', ')}`);
  console.log(`Optimize: ${optimize}`);
  console.log(`Limit: ${limit}\n`);

  try {
    if (source === 'url') {
      // This would require URLs to be provided
      console.log('❌ URL source requires URLs array. Use uploadFromUrls() directly.');
      return;
    }

    if (source === 'file') {
      // This would require file paths
      console.log('❌ File source requires file paths. Use uploadImageFromFile() directly.');
      return;
    }

    if (source === 'database') {
      // Upload from database
      const count = await uploadFromDatabase({
        entityType: 'listing',
        limit,
      });
      console.log(`\n✅ Processed ${count} entities.`);
      return;
    }

    console.log('❌ Unknown source type');
  } catch (error: any) {
    console.error('❌ Batch upload failed:', error.message);
    process.exit(1);
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const source = (args[0] as 'url' | 'file' | 'database') || 'database';
  const limit = parseInt(args[1]) || 10;

  batchUpload({
    source,
    folder: 'batch-upload',
    tags: ['batch', 'script'],
    optimize: true,
    limit,
  }).catch(console.error);
}

export { batchUpload, uploadFromUrls, uploadFromDatabase };
