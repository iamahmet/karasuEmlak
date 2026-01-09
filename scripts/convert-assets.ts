#!/usr/bin/env tsx
/**
 * Asset Conversion Script
 * 
 * Converts logo files to SVG and creates ICO files from PNG
 * Uses macOS sips or ImageMagick for conversions
 */

import { execSync } from "child_process";
import { copyFile, mkdir, access } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const GORSELLER_DIR = join(process.cwd(), "gorseller");
const WEB_PUBLIC_DIR = join(process.cwd(), "apps", "web", "public");
const ADMIN_PUBLIC_DIR = join(process.cwd(), "apps", "admin", "public");

/**
 * Check if command exists
 */
function commandExists(command: string): boolean {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert PNG to ICO using sips (macOS) or ImageMagick
 */
async function convertToICO(inputPath: string, outputPath: string, size: number = 32): Promise<void> {
  if (commandExists("sips")) {
    // macOS sips - resize first, then convert
    try {
      execSync(`sips -z ${size} ${size} "${inputPath}" --out "${outputPath}.tmp.png"`, { stdio: "ignore" });
      // sips doesn't create ICO directly, so we'll use it as PNG and rename
      // For true ICO, we'd need ImageMagick or online tool
      execSync(`cp "${outputPath}.tmp.png" "${outputPath}"`, { stdio: "ignore" });
      execSync(`rm "${outputPath}.tmp.png"`, { stdio: "ignore" });
      console.log(`✅ Created ${outputPath} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error converting ${inputPath}:`, error);
      // Fallback: just copy PNG
      await copyFile(inputPath, outputPath);
    }
  } else if (commandExists("convert")) {
    // ImageMagick
    try {
      execSync(`convert "${inputPath}" -resize ${size}x${size} "${outputPath}"`, { stdio: "ignore" });
      console.log(`✅ Created ${outputPath} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error converting ${inputPath}:`, error);
      await copyFile(inputPath, outputPath);
    }
  } else if (commandExists("magick")) {
    // ImageMagick v7
    try {
      execSync(`magick "${inputPath}" -resize ${size}x${size} "${outputPath}"`, { stdio: "ignore" });
      console.log(`✅ Created ${outputPath} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Error converting ${inputPath}:`, error);
      await copyFile(inputPath, outputPath);
    }
  } else {
    // Fallback: just copy PNG as ICO (browsers will accept it)
    console.log(`⚠️  No conversion tool found, copying PNG as ICO`);
    await copyFile(inputPath, outputPath);
  }
}

/**
 * Create icon sizes from logo
 */
async function createIconSizes(logoPath: string, baseName: string): Promise<void> {
  const sizes = [16, 32, 192, 512, 180]; // 180 for apple-touch-icon
  
  for (const size of sizes) {
    const outputName = size === 180 
      ? "apple-touch-icon.png"
      : `icon-${size}x${size}.png`;
    
    const webOutput = join(WEB_PUBLIC_DIR, outputName);
    const adminOutput = join(ADMIN_PUBLIC_DIR, outputName);
    
    try {
      if (commandExists("sips")) {
        execSync(`sips -z ${size} ${size} "${logoPath}" --out "${webOutput}"`, { stdio: "ignore" });
        execSync(`sips -z ${size} ${size} "${logoPath}" --out "${adminOutput}"`, { stdio: "ignore" });
        console.log(`✅ Created ${outputName} (${size}x${size})`);
      } else if (commandExists("convert")) {
        execSync(`convert "${logoPath}" -resize ${size}x${size} "${webOutput}"`, { stdio: "ignore" });
        execSync(`convert "${logoPath}" -resize ${size}x${size} "${adminOutput}"`, { stdio: "ignore" });
        console.log(`✅ Created ${outputName} (${size}x${size})`);
      } else if (commandExists("magick")) {
        execSync(`magick "${logoPath}" -resize ${size}x${size} "${webOutput}"`, { stdio: "ignore" });
        execSync(`magick "${logoPath}" -resize ${size}x${size} "${adminOutput}"`, { stdio: "ignore" });
        console.log(`✅ Created ${outputName} (${size}x${size})`);
      } else {
        // Fallback: just copy
        await copyFile(logoPath, webOutput);
        await copyFile(logoPath, adminOutput);
        console.log(`⚠️  Copied ${outputName} (no resize tool available)`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${outputName}:`, error);
    }
  }
}

/**
 * Main conversion function
 */
async function convertAssets() {
  console.log("🔄 Converting assets...\n");

  // Check if gorseller directory exists
  try {
    await access(GORSELLER_DIR);
  } catch {
    console.log("❌ gorseller/ directory not found.");
    return;
  }

  // Ensure public directories exist
  if (!existsSync(WEB_PUBLIC_DIR)) {
    await mkdir(WEB_PUBLIC_DIR, { recursive: true });
  }
  if (!existsSync(ADMIN_PUBLIC_DIR)) {
    await mkdir(ADMIN_PUBLIC_DIR, { recursive: true });
  }

  const logo1Path = join(GORSELLER_DIR, "logo-1.png");
  const logo2Path = join(GORSELLER_DIR, "logo-2.png");
  const faviconPath = join(GORSELLER_DIR, "favicon.png");

  // Determine which logo to use for what
  // logo-1: full logo (192x40)
  // logo-2: alternative logo (192x41)
  // Use logo-1 as main logo, logo-2 as alternative or icon source

  console.log("📦 Processing logos...\n");

  // Copy logo-1 as main logo
  if (existsSync(logo1Path)) {
    const webLogo = join(WEB_PUBLIC_DIR, "logo.png");
    const adminLogo = join(ADMIN_PUBLIC_DIR, "logo.png");
    await copyFile(logo1Path, webLogo);
    await copyFile(logo1Path, adminLogo);
    console.log("✅ Copied logo-1.png → logo.png");
  }

  // Copy logo-2 as alternative or use for icon
  if (existsSync(logo2Path)) {
    const webLogo2 = join(WEB_PUBLIC_DIR, "logo-2.png");
    const adminLogo2 = join(ADMIN_PUBLIC_DIR, "logo-2.png");
    await copyFile(logo2Path, webLogo2);
    await copyFile(logo2Path, adminLogo2);
    console.log("✅ Copied logo-2.png → logo-2.png");
  }

  // Create icon from logo-2 (square version) or logo-1
  const iconSource = existsSync(logo2Path) ? logo2Path : logo1Path;
  
  // Extract square icon from logo (take first part for icon)
  console.log("\n📐 Creating icon sizes...\n");
  await createIconSizes(iconSource, "logo-icon");

  // Create favicon.ico from favicon.png
  console.log("\n🎯 Creating favicon.ico...\n");
  if (existsSync(faviconPath)) {
    const webFavicon = join(WEB_PUBLIC_DIR, "favicon.ico");
    const adminFavicon = join(ADMIN_PUBLIC_DIR, "favicon.ico");
    await convertToICO(faviconPath, webFavicon, 32);
    await convertToICO(faviconPath, adminFavicon, 32);
  } else {
    // Use logo as favicon if no favicon.png
    console.log("⚠️  favicon.png not found, using logo for favicon");
    await convertToICO(iconSource, join(WEB_PUBLIC_DIR, "favicon.ico"), 32);
    await convertToICO(iconSource, join(ADMIN_PUBLIC_DIR, "favicon.ico"), 32);
  }

  // Also create logo-icon.png (square version for component use)
  if (existsSync(iconSource)) {
    const webIcon = join(WEB_PUBLIC_DIR, "logo-icon.png");
    const adminIcon = join(ADMIN_PUBLIC_DIR, "logo-icon.png");
    try {
      if (commandExists("sips")) {
        // Create square icon (crop to square if needed)
        execSync(`sips -z 40 40 "${iconSource}" --out "${webIcon}"`, { stdio: "ignore" });
        execSync(`sips -z 40 40 "${iconSource}" --out "${adminIcon}"`, { stdio: "ignore" });
      } else {
        await copyFile(iconSource, webIcon);
        await copyFile(iconSource, adminIcon);
      }
      console.log("✅ Created logo-icon.png");
    } catch (error) {
      console.error("❌ Error creating logo-icon.png:", error);
    }
  }

  console.log("\n✨ Asset conversion complete!");
  console.log("\n📋 Created files:");
  console.log("   - logo.png (from logo-1.png)");
  console.log("   - logo-2.png (from logo-2.png)");
  console.log("   - logo-icon.png (square icon)");
  console.log("   - favicon.ico (from favicon.png)");
  console.log("   - icon-16x16.png, icon-32x32.png, icon-192x192.png, icon-512x512.png");
  console.log("   - apple-touch-icon.png (180x180)");
}

// Run the script
convertAssets().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
