/**
 * Filename Optimizer
 * Optimizes filenames for SEO and file system compatibility
 */

export interface OptimizedFilename {
  original: string;
  optimized: string;
  slug: string;
  extension: string;
}

/**
 * Optimize filename for SEO
 * - Removes special characters
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes Turkish characters (optional)
 * - Limits length
 */
export function optimizeFilename(
  filename: string,
  options: {
    maxLength?: number;
    removeTurkishChars?: boolean;
    addTimestamp?: boolean;
  } = {}
): OptimizedFilename {
  const {
    maxLength = 100,
    removeTurkishChars = false,
    addTimestamp = false,
  } = options;

  // Extract extension
  const lastDot = filename.lastIndexOf(".");
  const extension = lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : "";
  const nameWithoutExt = lastDot > 0 ? filename.substring(0, lastDot) : filename;

  // Turkish character mapping
  const turkishChars: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };

  let optimized = nameWithoutExt;

  // Remove Turkish characters if requested
  if (removeTurkishChars) {
    optimized = optimized
      .split("")
      .map((char) => turkishChars[char] || char)
      .join("");
  }

  // Convert to lowercase
  optimized = optimized.toLowerCase();

  // Remove special characters, keep only alphanumeric, spaces, hyphens, underscores
  optimized = optimized.replace(/[^a-z0-9\s\-_]/g, "");

  // Replace multiple spaces/hyphens with single hyphen
  optimized = optimized.replace(/[\s\-_]+/g, "-");

  // Remove leading/trailing hyphens
  optimized = optimized.replace(/^-+|-+$/g, "");

  // Add timestamp if requested
  if (addTimestamp) {
    const timestamp = Date.now();
    optimized = `${optimized}-${timestamp}`;
  }

  // Limit length
  if (optimized.length > maxLength) {
    optimized = optimized.substring(0, maxLength);
    // Remove trailing hyphen if exists
    optimized = optimized.replace(/-+$/, "");
  }

  // Ensure we have a valid name
  if (!optimized) {
    optimized = `image-${Date.now()}`;
  }

  const finalName = extension ? `${optimized}.${extension}` : optimized;

  return {
    original: filename,
    optimized: finalName,
    slug: optimized,
    extension: extension || "",
  };
}

/**
 * Generate SEO-friendly alt text from filename
 */
export function generateAltTextFromFilename(filename: string): string {
  const optimized = optimizeFilename(filename, { removeTurkishChars: false });
  
  // Remove extension
  let altText = optimized.slug;
  
  // Replace hyphens with spaces
  altText = altText.replace(/-/g, " ");
  
  // Capitalize first letter of each word
  altText = altText
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  // Limit length
  if (altText.length > 100) {
    altText = altText.substring(0, 100).trim();
  }
  
  return altText || "Image";
}

/**
 * Validate filename
 */
export function validateFilename(filename: string): {
  valid: boolean;
  error?: string;
} {
  if (!filename || filename.trim().length === 0) {
    return { valid: false, error: "Filename cannot be empty" };
  }

  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(filename)) {
    return {
      valid: false,
      error: "Filename contains invalid characters",
    };
  }

  // Check length
  if (filename.length > 255) {
    return { valid: false, error: "Filename too long (max 255 characters)" };
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ];
  const nameWithoutExt = filename.split(".")[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return { valid: false, error: "Filename is a reserved name" };
  }

  return { valid: true };
}
