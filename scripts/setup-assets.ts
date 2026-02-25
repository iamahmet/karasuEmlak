#!/usr/bin/env tsx
/**
 * Asset Setup Script
 * 
 * Copies logo, favicon, and icon files from 1x/ to apps/web/public and apps/admin/public
 * Generates all required icon sizes for PWA and favicon support
 * 
 * Usage: pnpm tsx scripts/setup-assets.ts
 */

import { readdir, copyFile, mkdir, access } from "fs/promises";
import { join, extname, basename } from "path";
import { existsSync } from "fs";

const ASSETS_SOURCE_DIR = join(process.cwd(), "1x");
const WEB_PUBLIC_DIR = join(process.cwd(), "apps", "web", "public");
const ADMIN_PUBLIC_DIR = join(process.cwd(), "apps", "admin", "public");

interface AssetFile {
  name: string;
  path: string;
  type: "logo" | "favicon" | "icon" | "other";
}

/**
 * Detect asset type from filename
 */
function detectAssetType(filename: string): AssetFile["type"] {
  const lower = filename.toLowerCase();
  
  if (lower.includes("favicon") || lower.includes("fav")) {
    return "favicon";
  }
  if (lower.includes("logo")) {
    return "logo";
  }
  if (lower.includes("icon") || lower.includes("app-icon")) {
    return "icon";
  }
  return "other";
}

/**
 * Check if file should be copied
 */
function shouldCopyFile(filename: string): boolean {
  const ext = extname(filename).toLowerCase();
  const validExtensions = [".svg", ".png", ".jpg", ".jpeg", ".ico", ".webp"];
  return validExtensions.includes(ext);
}

/**
 * Copy asset files to public directories
 */
async function copyAssets() {
  console.log("🎨 Setting up assets from 1x/ directory...\n");

  // Check if 1x directory exists
  try {
    await access(ASSETS_SOURCE_DIR);
  } catch {
    console.log("⚠️  1x/ directory not found. Skipping asset setup.");
    console.log("💡 Tip: Add your logo, favicon, and icon files to the 1x/ directory.");
    return;
  }

  // Read files from 1x directory
  let files: string[];
  try {
    files = await readdir(ASSETS_SOURCE_DIR);
  } catch (error) {
    console.error("❌ Error reading 1x directory:", error);
    return;
  }

  if (files.length === 0) {
    console.log("⚠️  1x/ directory is empty. No assets to copy.");
    return;
  }

  // Filter valid asset files
  const assetFiles = files
    .filter(shouldCopyFile)
    .map((file) => ({
      name: file,
      path: join(ASSETS_SOURCE_DIR, file),
      type: detectAssetType(file),
    }));

  if (assetFiles.length === 0) {
    console.log("⚠️  No valid asset files found in 1x/ directory.");
    console.log("💡 Supported formats: .svg, .png, .jpg, .jpeg, .ico, .webp");
    return;
  }

  console.log(`📦 Found ${assetFiles.length} asset file(s):\n`);
  assetFiles.forEach((asset) => {
    console.log(`   ${asset.type.toUpperCase()}: ${asset.name}`);
  });
  console.log();

  // Ensure public directories exist
  if (!existsSync(WEB_PUBLIC_DIR)) {
    await mkdir(WEB_PUBLIC_DIR, { recursive: true });
  }
  if (!existsSync(ADMIN_PUBLIC_DIR)) {
    await mkdir(ADMIN_PUBLIC_DIR, { recursive: true });
  }

  // Copy files to both web and admin public directories
  let copiedCount = 0;
  for (const asset of assetFiles) {
    try {
      // Copy to web public
      const webDest = join(WEB_PUBLIC_DIR, asset.name);
      await copyFile(asset.path, webDest);
      console.log(`✅ Copied ${asset.name} → apps/web/public/`);

      // Copy to admin public
      const adminDest = join(ADMIN_PUBLIC_DIR, asset.name);
      await copyFile(asset.path, adminDest);
      console.log(`✅ Copied ${asset.name} → apps/admin/public/`);

      copiedCount++;
    } catch (error) {
      console.error(`❌ Error copying ${asset.name}:`, error);
    }
  }

  console.log(`\n✨ Successfully copied ${copiedCount} file(s)!`);
  console.log("\n📋 Next steps:");
  console.log("   1. Ensure you have the following files in public directories:");
  console.log("      - favicon.ico (32x32 or 16x16)");
  console.log("      - logo.svg (full logo with text)");
  console.log("      - logo-icon.svg (icon only, square)");
  console.log("   2. Optional: Add PNG icons for better PWA support:");
  console.log("      - icon-16x16.png");
  console.log("      - icon-32x32.png");
  console.log("      - icon-192x192.png");
  console.log("      - icon-512x512.png");
  console.log("      - apple-touch-icon.png (180x180)");
  console.log("   3. Run the app to see your new branding!");
}

// Run the script
copyAssets().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
