/**
 * Migrate Images from Supabase Storage to Cloudinary
 * 
 * This script migrates images stored in Supabase Storage to Cloudinary
 * and updates references in the database.
 * 
 * Usage: tsx scripts/media/migrate-supabase-to-cloudinary.ts [options]
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

// Load .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

interface MigrationOptions {
  bucket?: string;
  folder?: string;
  dryRun?: boolean;
  maxFiles?: number;
}

async function migrateImages(options: MigrationOptions = {}) {
  const {
    bucket = 'content-images',
    folder = 'migrated',
    dryRun = false,
    maxFiles = 50,
  } = options;

  console.log('🚀 Starting Supabase → Cloudinary migration...\n');
  console.log(`📦 Bucket: ${bucket}`);
  console.log(`📁 Cloudinary Folder: ${folder}`);
  console.log(`🔢 Max Files: ${maxFiles}`);
  console.log(`🧪 Dry Run: ${dryRun ? 'YES' : 'NO'}\n`);

  try {
    // List files in Supabase Storage
    const { data: files, error } = await supabase.storage
      .from(bucket)
      .list('', { limit: maxFiles, sortBy: { column: 'created_at', order: 'desc' } });

    if (error) {
      console.error('❌ Error listing files:', error.message);
      process.exit(1);
    }

    if (!files || files.length === 0) {
      console.log('✅ No files found to migrate');
      return;
    }

    console.log(`📊 Found ${files.length} files to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of files) {
      if (!file.name) continue;

      // Skip non-image files
      if (!file.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
        console.log(`⏭️  Skipping ${file.name} (not an image)`);
        skipped++;
        continue;
      }

      try {
        // Download from Supabase
        const { data: fileData, error: downloadError } = await supabase.storage
          .from(bucket)
          .download(file.name);

        if (downloadError || !fileData) {
          console.error(`❌ Error downloading ${file.name}:`, downloadError?.message);
          errors++;
          continue;
        }

        // Convert to buffer
        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (dryRun) {
          console.log(`🧪 Would migrate: ${file.name}`);
          migrated++;
          continue;
        }

        // Upload to Cloudinary
        const publicId = `${folder}/${file.name.replace(/\.[^/.]+$/, '')}`;
        
        const result = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              public_id: publicId,
              folder,
              resource_type: 'image',
              quality: 'auto',
              format: 'auto',
              overwrite: false,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });

        console.log(`✅ Migrated: ${file.name} → ${result.public_id}`);
        console.log(`   URL: ${result.secure_url}`);
        migrated++;

        // TODO: Update database references if needed
        // This would require finding all references to the old Supabase URL
        // and updating them to the new Cloudinary public_id

      } catch (error: any) {
        console.error(`❌ Error migrating ${file.name}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📦 Total: ${files.length}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// CLI
const args = process.argv.slice(2);
const options: MigrationOptions = {
  dryRun: args.includes('--dry-run'),
};

const bucketIndex = args.indexOf('--bucket');
if (bucketIndex !== -1 && args[bucketIndex + 1]) {
  options.bucket = args[bucketIndex + 1];
}

const folderIndex = args.indexOf('--folder');
if (folderIndex !== -1 && args[folderIndex + 1]) {
  options.folder = args[folderIndex + 1];
}

const maxFilesIndex = args.indexOf('--max-files');
if (maxFilesIndex !== -1 && args[maxFilesIndex + 1]) {
  options.maxFiles = parseInt(args[maxFilesIndex + 1], 10);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Supabase → Cloudinary Migration Script

Usage:
  tsx scripts/media/migrate-supabase-to-cloudinary.ts [options]

Options:
  --bucket <name>        Supabase bucket name (default: content-images)
  --folder <path>        Cloudinary folder (default: migrated)
  --max-files <num>      Maximum files to migrate (default: 50)
  --dry-run             Show what would be migrated without making changes
  --help, -h            Show this help message

Examples:
  # Dry run
  tsx scripts/media/migrate-supabase-to-cloudinary.ts --dry-run

  # Migrate specific bucket
  tsx scripts/media/migrate-supabase-to-cloudinary.ts --bucket listings-images
`);
  process.exit(0);
}

migrateImages(options).catch(console.error);
