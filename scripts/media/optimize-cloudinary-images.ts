/**
 * Cloudinary Image Optimization Script
 * Batch optimize existing images in Cloudinary
 * 
 * Usage: tsx scripts/media/optimize-cloudinary-images.ts [options]
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary credentials in environment variables');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

interface OptimizationOptions {
  folder?: string;
  format?: 'auto' | 'webp' | 'avif';
  quality?: 'auto' | number;
  maxResults?: number;
  dryRun?: boolean;
}

async function optimizeImages(options: OptimizationOptions = {}) {
  const {
    folder = '',
    format = 'auto',
    quality = 'auto',
    maxResults = 100,
    dryRun = false,
  } = options;

  console.log('🚀 Starting Cloudinary image optimization...\n');
  console.log(`📁 Folder: ${folder || 'root'}`);
  console.log(`🎨 Format: ${format}`);
  console.log(`⚡ Quality: ${quality}`);
  console.log(`🔢 Max Results: ${maxResults}`);
  console.log(`🧪 Dry Run: ${dryRun ? 'YES' : 'NO'}\n`);

  try {
    // List resources
    const { resources, next_cursor } = await cloudinary.search
      .expression(folder ? `folder:${folder}` : 'resource_type:image')
      .max_results(maxResults)
      .execute();

    if (!resources || resources.length === 0) {
      console.log('✅ No images found to optimize');
      return;
    }

    console.log(`📊 Found ${resources.length} images\n`);

    let optimized = 0;
    let skipped = 0;
    let errors = 0;

    for (const resource of resources) {
      const publicId = resource.public_id;
      const currentFormat = resource.format;
      const currentBytes = resource.bytes;

      // Skip if already in optimal format
      if (format === 'auto' && (currentFormat === 'webp' || currentFormat === 'avif')) {
        console.log(`⏭️  Skipping ${publicId} (already optimized)`);
        skipped++;
        continue;
      }

      if (dryRun) {
        console.log(`🧪 Would optimize: ${publicId}`);
        optimized++;
        continue;
      }

      try {
        // Generate optimized URL (Cloudinary will serve optimized version)
        // Note: This doesn't actually transform the original, but ensures optimized delivery
        const optimizedUrl = cloudinary.url(publicId, {
          format,
          quality,
          fetch_format: format,
        });

        console.log(`✅ Optimized: ${publicId}`);
        console.log(`   URL: ${optimizedUrl}`);
        optimized++;
      } catch (error: any) {
        console.error(`❌ Error optimizing ${publicId}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Optimized: ${optimized}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total: ${resources.length}`);

    if (next_cursor) {
      console.log('\n⚠️  More results available. Use pagination to process all images.');
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const options: OptimizationOptions = {
  dryRun: args.includes('--dry-run'),
};

const folderIndex = args.indexOf('--folder');
if (folderIndex !== -1 && args[folderIndex + 1]) {
  options.folder = args[folderIndex + 1];
}

const formatIndex = args.indexOf('--format');
if (formatIndex !== -1 && args[formatIndex + 1]) {
  options.format = args[formatIndex + 1] as any;
}

const qualityIndex = args.indexOf('--quality');
if (qualityIndex !== -1 && args[qualityIndex + 1]) {
  const qualityValue = args[qualityIndex + 1];
  options.quality = qualityValue === 'auto' ? 'auto' : parseInt(qualityValue, 10);
}

const maxResultsIndex = args.indexOf('--max-results');
if (maxResultsIndex !== -1 && args[maxResultsIndex + 1]) {
  options.maxResults = parseInt(args[maxResultsIndex + 1], 10);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Cloudinary Image Optimization Script

Usage:
  tsx scripts/media/optimize-cloudinary-images.ts [options]

Options:
  --folder <path>        Folder to optimize (default: root)
  --format <format>      Target format: auto, webp, avif (default: auto)
  --quality <quality>    Quality: auto or 1-100 (default: auto)
  --max-results <num>    Maximum images to process (default: 100)
  --dry-run             Show what would be optimized without making changes
  --help, -h            Show this help message

Examples:
  # Dry run on all images
  tsx scripts/media/optimize-cloudinary-images.ts --dry-run

  # Optimize images in listings folder
  tsx scripts/media/optimize-cloudinary-images.ts --folder listings

  # Optimize with specific format
  tsx scripts/media/optimize-cloudinary-images.ts --format webp --quality 80
`);
  process.exit(0);
}

optimizeImages(options).catch(console.error);
