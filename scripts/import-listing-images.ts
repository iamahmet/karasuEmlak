/**
 * Import Listing Images Script
 * Imports images from gorseller folder structure to media library
 * with SEO-optimized naming based on folder structure
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, dirname, basename, extname } from "path";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { optimizeFilename } from "../apps/admin/lib/utils/filename-optimizer";

// Load environment variables
config({ path: join(process.cwd(), ".env.local") });
config({ path: join(process.cwd(), ".env") });

const GORSELLER_DIR = join(process.cwd(), "gorseller");
// Try common bucket names - adjust based on your Supabase setup
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media" || "images" || "uploads";

// Initialize Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

interface ImageInfo {
  filePath: string;
  folderPath: string[];
  fileName: string;
  fullPath: string;
}

/**
 * Recursively scan directory for images
 */
async function scanDirectory(dir: string, folderPath: string[] = []): Promise<ImageInfo[]> {
  const images: ImageInfo[] = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subImages = await scanDirectory(fullPath, [...folderPath, entry.name]);
        images.push(...subImages);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
          images.push({
            filePath: fullPath,
            folderPath: [...folderPath],
            fileName: entry.name,
            fullPath: fullPath,
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return images;
}

/**
 * Generate SEO-friendly filename from folder structure
 */
function generateSEOFilename(folderPath: string[], originalFileName: string): string {
  // Remove "gorseller" and "Satılık Daireler" from path
  const relevantPath = folderPath.filter(
    (part) => !part.toLowerCase().includes("görsel") && 
               !part.toLowerCase().includes("satılık") &&
               !part.toLowerCase().includes("daireler")
  );
  
  // Combine folder path parts
  let nameParts: string[] = [];
  
  // Add neighborhood (mahalle)
  const neighborhood = relevantPath.find(p => p.includes("Mahallesi"));
  if (neighborhood) {
    nameParts.push(neighborhood.replace(" Mahallesi", "").toLowerCase());
  }
  
  // Add listing title (last folder before image)
  const listingTitle = relevantPath[relevantPath.length - 1];
  if (listingTitle && listingTitle !== neighborhood) {
    // Clean listing title: remove price, normalize
    let cleanTitle = listingTitle
      .replace(/\d+\.\d+\.\d+\.\d+ TL/g, "") // Remove prices like "3.000.000 TL"
      .replace(/\d+ TL/g, "") // Remove prices like "3000000 TL"
      .replace(/\d+\+\d+/g, "") // Remove room counts like "2+1"
      .trim();
    
    // Normalize Turkish characters and create slug
    cleanTitle = cleanTitle
      .toLowerCase()
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    
    if (cleanTitle.length > 0) {
      nameParts.push(cleanTitle);
    }
  }
  
  // Add image number if multiple images
  const imageNumber = originalFileName.match(/\d+/)?.[0];
  if (imageNumber && nameParts.length > 0) {
    nameParts.push(`gorsel-${imageNumber}`);
  }
  
  // Combine parts
  let seoName = nameParts.join("-");
  
  // Ensure minimum length
  if (seoName.length < 5) {
    seoName = `satilik-daire-${seoName}`;
  }
  
  // Limit length
  if (seoName.length > 80) {
    seoName = seoName.substring(0, 80);
  }
  
  // Get extension
  const ext = extname(originalFileName);
  
  // Optimize using existing utility
  const optimized = optimizeFilename(`${seoName}${ext}`, {
    maxLength: 100,
    removeTurkishChars: false,
    addTimestamp: true,
  });
  
  return optimized.optimized;
}

/**
 * Generate alt text from folder structure
 */
function generateAltText(folderPath: string[]): string {
  const relevantPath = folderPath.filter(
    (part) => !part.toLowerCase().includes("görsel") && 
               !part.toLowerCase().includes("satılık") &&
               !part.toLowerCase().includes("daireler")
  );
  
  const neighborhood = relevantPath.find(p => p.includes("Mahallesi"));
  const listingTitle = relevantPath[relevantPath.length - 1];
  
  let altText = "Satılık daire";
  
  if (neighborhood) {
    altText += ` ${neighborhood.replace(" Mahallesi", "")} mahallesinde`;
  }
  
  if (listingTitle && listingTitle !== neighborhood) {
    const cleanTitle = listingTitle
      .replace(/\d+\.\d+\.\d+\.\d+ TL/g, "")
      .replace(/\d+ TL/g, "")
      .trim();
    
    if (cleanTitle.length > 0 && cleanTitle.length < 50) {
      altText += ` ${cleanTitle}`;
    }
  }
  
  return altText.substring(0, 125);
}

/**
 * Upload image to Supabase Storage
 */
async function uploadImage(
  imageInfo: ImageInfo,
  supabase: ReturnType<typeof getSupabaseClient>
): Promise<{ url: string; path: string }> {
  const fileBuffer = await readFile(imageInfo.filePath);
  const fileStats = await stat(imageInfo.filePath);
  
  // Generate SEO filename
  const seoFilename = generateSEOFilename(imageInfo.folderPath, imageInfo.fileName);
  
  // Create folder structure in storage (preserve hierarchy)
  const folderParts = imageInfo.folderPath
    .filter(p => 
      !p.toLowerCase().includes("görsel") && 
      !p.toLowerCase().includes("gorsel") &&
      !p.toLowerCase().includes("satılık") &&
      !p.toLowerCase().includes("daireler")
    )
    .map(p => {
      // Normalize folder names
      return p
        .toLowerCase()
        .replace(/ş/g, "s")
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/ı/g, "i")
        .replace(/İ/g, "i")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    })
    .filter(p => p.length > 0);
  
  const storagePath = folderParts.length > 0 
    ? `listings/${folderParts.join("/")}/${seoFilename}`
    : `listings/${seoFilename}`;
  
  // Try to upload to Supabase Storage
  // First, try to create bucket if it doesn't exist (with service role key)
  let bucketName = SUPABASE_BUCKET;
  let uploadError: any = null;
  let uploadData: any = null;
  
  // Get correct MIME type
  const ext = extname(imageInfo.fileName).slice(1).toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const contentType = mimeTypes[ext] || `image/${ext}`;
  
  // Try upload
  const uploadResult = await supabase.storage
    .from(bucketName)
    .upload(storagePath, fileBuffer, {
      contentType: contentType,
      cacheControl: "3600",
      upsert: false,
    });
  
  uploadData = uploadResult.data;
  uploadError = uploadResult.error;
  
  // If bucket doesn't exist, try to create it
  if (uploadError && uploadError.message?.includes("Bucket not found")) {
    console.log(`   ⚠️  Bucket "${bucketName}" not found. Attempting to create...`);
    
    // Try to create bucket (requires admin privileges)
    const { data: bucketData, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 10485760, // 10MB
    });
    
    if (createError) {
      console.log(`   ⚠️  Could not create bucket: ${createError.message}`);
      console.log(`   💡 Please create bucket "${bucketName}" manually in Supabase Dashboard`);
      throw new Error(`Bucket "${bucketName}" not found and could not be created: ${createError.message}`);
    }
    
    console.log(`   ✅ Bucket "${bucketName}" created successfully`);
    
    // Retry upload
    const retryResult = await supabase.storage
      .from(bucketName)
      .upload(storagePath, fileBuffer, {
        contentType: contentType,
        cacheControl: "3600",
        upsert: false,
      });
    
    uploadData = retryResult.data;
    uploadError = retryResult.error;
  }
  
  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(storagePath);
  
  return {
    url: urlData.publicUrl,
    path: storagePath,
  };
}

/**
 * Save metadata to media_assets table
 */
async function saveMetadata(
  imageInfo: ImageInfo,
  uploadResult: { url: string; path: string },
  supabase: ReturnType<typeof getSupabaseClient>
): Promise<void> {
  const seoFilename = generateSEOFilename(imageInfo.folderPath, imageInfo.fileName);
  const altText = generateAltText(imageInfo.folderPath);
  const fileStats = await stat(imageInfo.filePath);
  
  // Extract folder structure for categorization
  const category = imageInfo.folderPath[0] || "Satılık Daireler";
  const neighborhood = imageInfo.folderPath.find(p => p.includes("Mahallesi")) || null;
  const listingTitle = imageInfo.folderPath[imageInfo.folderPath.length - 1] || null;
  
  // Try to get image dimensions (basic approach)
  // In production, you might want to use sharp or similar
  let width: number | undefined;
  let height: number | undefined;
  
  try {
    // For now, we'll set these to undefined and let the system detect later
    // Or you can use a library like sharp to get dimensions
  } catch (error) {
    // Dimensions not critical, continue
  }
  
  // Store folder structure as tags/category
  const folderTags = imageInfo.folderPath
    .filter(p => 
      !p.toLowerCase().includes("görsel") && 
      !p.toLowerCase().includes("gorsel") &&
      !p.toLowerCase().includes("satılık") &&
      !p.toLowerCase().includes("daireler")
    )
    .join(", ");
  
  // Get correct MIME type
  const ext = extname(imageInfo.fileName).slice(1).toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  const mimeType = mimeTypes[ext] || `image/${ext}`;
  
  // Insert metadata according to media_assets table schema
  const metadata: any = {
    cloudinary_public_id: seoFilename,
    cloudinary_url: uploadResult.url, // Required field
    cloudinary_secure_url: uploadResult.url,
    asset_type: "listing_image", // Required field
    title: seoFilename.replace(extname(seoFilename), ""),
    alt_text: altText,
    width: width,
    height: height,
    bytes: fileStats.size,
    format: ext,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Add entity info if available from folder structure
  const neighborhood = imageInfo.folderPath.find(p => p.includes("Mahallesi"));
  if (neighborhood) {
    metadata.entity_type = "neighborhood";
    // You might want to look up the actual neighborhood ID here
  }
  
  // Insert metadata
  const { error: dbError } = await supabase.from("media_assets").insert(metadata);
  
  if (dbError) {
    console.warn(`Failed to save metadata for ${imageInfo.fileName}:`, dbError.message);
  }
}

/**
 * Main import function
 */
async function importImages() {
  console.log("🚀 Starting image import from gorseller folder...\n");
  
  const supabase = getSupabaseClient();
  
  // Check if bucket exists, if not try to create it
  console.log("📦 Checking storage bucket...");
  const bucketName = SUPABASE_BUCKET;
  
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error(`❌ Error listing buckets: ${listError.message}`);
    } else {
      const bucketExists = buckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.log(`⚠️  Bucket "${bucketName}" not found. Creating...`);
        // Create bucket without MIME type restrictions (Supabase may not support this option)
        const { data: bucketData, error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          console.error(`❌ Could not create bucket: ${createError.message}`);
          console.log(`💡 Please create bucket "${bucketName}" manually in Supabase Dashboard`);
          console.log(`   Or set SUPABASE_STORAGE_BUCKET environment variable to an existing bucket name\n`);
        } else {
          console.log(`✅ Bucket "${bucketName}" created successfully\n`);
        }
      } else {
        console.log(`✅ Bucket "${bucketName}" exists\n`);
      }
    }
  } catch (error: any) {
    console.warn(`⚠️  Could not check bucket status: ${error.message}`);
    console.log(`   Continuing with upload attempts...\n`);
  }
  
  // Scan all images
  console.log("📁 Scanning directories...");
  const images = await scanDirectory(GORSELLER_DIR);
  console.log(`✅ Found ${images.length} images\n`);
  
  if (images.length === 0) {
    console.log("❌ No images found in gorseller folder");
    return;
  }
  
  // Process images
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const progress = `[${i + 1}/${images.length}]`;
    
    try {
      console.log(`${progress} Processing: ${image.fileName}`);
      console.log(`   Folder: ${image.folderPath.join(" > ")}`);
      
      // Upload image
      const uploadResult = await uploadImage(image, supabase);
      console.log(`   ✅ Uploaded: ${uploadResult.path}`);
      
      // Save metadata
      await saveMetadata(image, uploadResult, supabase);
      console.log(`   ✅ Metadata saved\n`);
      
      successCount++;
    } catch (error: any) {
      console.error(`   ❌ Error: ${error.message}\n`);
      errorCount++;
    }
  }
  
  console.log("\n📊 Import Summary:");
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📁 Total: ${images.length}`);
}

// Run if called directly
if (require.main === module) {
  importImages()
    .then(() => {
      console.log("\n✨ Import completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Import failed:", error);
      process.exit(1);
    });
}

export { importImages };
