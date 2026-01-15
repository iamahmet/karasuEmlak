/**
 * Enhanced Media Upload API
 * Handles image uploads with automatic SEO optimization
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { optimizeFilename, validateFilename } from "@/lib/utils/filename-optimizer";
import { analyzeImageForSEO, generateAIAltText } from "@/lib/utils/image-seo-optimizer";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const generateAltText = formData.get("generateAltText") === "true";
    const context = formData.get("context") as string | null;

    if (!file) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        "No file provided",
        undefined,
        400
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        "File must be an image",
        undefined,
        400
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        `File size must be less than ${maxSize / 1024 / 1024}MB`,
        undefined,
        400
      );
    }

    // Validate and optimize filename
    const validation = validateFilename(file.name);
    if (!validation.valid) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        validation.error || "Invalid filename",
        undefined,
        400
      );
    }

    const optimized = optimizeFilename(file.name, {
      maxLength: 100,
      removeTurkishChars: false,
      addTimestamp: true, // Add timestamp to avoid conflicts
    });

    // Analyze image for SEO (without URL initially)
    const seoMetadata = await analyzeImageForSEO({
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Upload to Supabase Storage
    const supabase = createServiceClient();
    const filePath = `media/${optimized.optimized}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    // Generate AI alt text if requested
    let finalAltText = seoMetadata.altText;
    if (generateAltText && publicUrl) {
      try {
        const aiAltText = await generateAIAltText(publicUrl, context || undefined);
        if (aiAltText && aiAltText.length > 0) {
          finalAltText = aiAltText;
        }
      } catch (error) {
        console.warn("AI alt text generation failed, using fallback:", error);
      }
    }

    // Get image dimensions from uploaded image
    let width: number | undefined;
    let height: number | undefined;
    try {
      const dimensions = await getImageDimensions(publicUrl);
      width = dimensions.width;
      height = dimensions.height;
    } catch (error) {
      console.warn("Failed to get image dimensions:", error);
    }

    // Save metadata to database (if media_assets table exists)
    try {
      const { error: dbError } = await supabase.from("media_assets").insert({
        title: seoMetadata.title || optimized.slug,
        alt_text: finalAltText,
        cloudinary_public_id: optimized.optimized,
        cloudinary_secure_url: publicUrl,
        width: width,
        height: height,
        bytes: file.size,
        format: optimized.extension,
        mime_type: file.type,
        ai_generated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (dbError) {
        // Log but don't fail - metadata is optional
        console.warn("Failed to save metadata to database:", dbError);
      }
    } catch (error) {
      // Table might not exist, continue without metadata
      console.warn("Media assets table not available:", error);
    }

    return createSuccessResponse(requestId, {
      url: publicUrl,
      filename: optimized.optimized,
      originalFilename: file.name,
      altText: finalAltText,
      title: seoMetadata.title,
      width,
      height,
      size: file.size,
      mimeType: file.type,
      seoOptimized: true,
    });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Upload failed",
      error,
      500
    );
  }
}

/**
 * Get image dimensions from URL
 */
async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  try {
    // Fetch image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try to use sharp if available
    try {
      const sharp = await import("sharp").catch(() => null);
      if (sharp) {
        const metadata = await sharp.default(buffer).metadata();
        return {
          width: metadata.width || 0,
          height: metadata.height || 0,
        };
      }
    } catch (error) {
      // Sharp not available, continue with fallback
    }

    // Fallback: Try to read from image headers (basic implementation)
    // For now, return 0 if we can't determine
    return { width: 0, height: 0 };
  } catch (error) {
    console.warn("Failed to get image dimensions:", error);
    return { width: 0, height: 0 };
  }
}

export const POST = withErrorHandling(handlePost);
