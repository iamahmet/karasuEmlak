/**
 * Image SEO Optimizer
 * Automatically generates SEO metadata for images
 */

import { optimizeFilename, generateAltTextFromFilename } from "./filename-optimizer";

export interface ImageSEOMetadata {
  filename: string;
  altText: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
}

/**
 * Analyze image and generate SEO metadata (server-side safe)
 */
export async function analyzeImageForSEO(
  file: File | { name: string; size: number; type: string },
  imageUrl?: string
): Promise<ImageSEOMetadata> {
  // Optimize filename
  const optimized = optimizeFilename(file.name, {
    maxLength: 100,
    removeTurkishChars: false,
    addTimestamp: false,
  });

  // Generate alt text from filename
  let altText = generateAltTextFromFilename(file.name);

  // Try to get image dimensions if URL provided (server-side)
  let width: number | undefined;
  let height: number | undefined;

  if (imageUrl && typeof window === "undefined") {
    // Server-side: Use fetch and image processing
    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Try sharp if available
        try {
          const sharp = await import("sharp").catch(() => null);
          if (sharp) {
            const metadata = await sharp.default(buffer).metadata();
            width = metadata.width;
            height = metadata.height;
          }
        } catch (error) {
          // Sharp not available, skip dimensions
        }
      }
    } catch (error) {
      console.warn("Failed to get image dimensions:", error);
    }
  } else if (imageUrl && typeof window !== "undefined") {
    // Client-side: Use Image API
    try {
      const dimensions = await getImageDimensions(imageUrl);
      width = dimensions.width;
      height = dimensions.height;
    } catch (error) {
      console.warn("Failed to get image dimensions:", error);
    }
  }

  // Generate title from filename (first part before extension)
  const title = optimized.slug
    .split("-")
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    filename: optimized.optimized,
    altText,
    title,
    width,
    height,
    fileSize: file.size,
    mimeType: file.type,
  };
}

/**
 * Get image dimensions from URL (client-side)
 */
function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // Only works in browser environment
    if (typeof window === "undefined") {
      reject(new Error("getImageDimensions only works in browser"));
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Generate AI-powered alt text using OpenAI/Gemini
 */
export async function generateAIAltText(
  imageUrl: string,
  context?: string
): Promise<string> {
  try {
    // Check if OpenAI API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!openaiKey && !geminiKey) {
      // Fallback to filename-based alt text
      return generateAltTextFromFilename("image");
    }

    // Use OpenAI Vision API if available
    if (openaiKey) {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: openaiKey });

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Bu görseli SEO için uygun bir alt text ile açıkla. Türkçe olmalı, kısa ve açıklayıcı olmalı (maksimum 125 karakter).${
                  context ? ` Bağlam: ${context}` : ""
                }`,
              },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 100,
      });

      const altText = response.choices[0]?.message?.content?.trim() || "";
      if (altText) {
        return altText.substring(0, 125);
      }
    }

    // Fallback to filename-based
    return generateAltTextFromFilename("image");
  } catch (error) {
    console.error("Failed to generate AI alt text:", error);
    return generateAltTextFromFilename("image");
  }
}
