/**
 * Google Drive Import API
 * Imports images from Google Drive
 */

import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler";
import { getRequestId } from "@/lib/api/middleware";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { optimizeFilename } from "@/lib/utils/filename-optimizer";
import { generateAIAltText } from "@/lib/utils/image-seo-optimizer";

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    const body = await request.json();
    const { fileId, accessToken, generateAltText = true, context } = body;

    if (!fileId || !accessToken) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        "fileId and accessToken are required",
        undefined,
        400
      );
    }

    // Fetch file from Google Drive
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!driveResponse.ok) {
      throw new Error(`Failed to fetch file from Google Drive: ${driveResponse.statusText}`);
    }

    // Get file metadata
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType,size`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!metadataResponse.ok) {
      throw new Error(`Failed to fetch file metadata: ${metadataResponse.statusText}`);
    }

    const metadata = await metadataResponse.json();

    // Validate it's an image
    if (!metadata.mimeType?.startsWith("image/")) {
      return createErrorResponse(
        requestId,
        "VALIDATION_ERROR",
        "File must be an image",
        undefined,
        400
      );
    }

    // Download file
    const arrayBuffer = await driveResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize filename
    const optimized = optimizeFilename(metadata.name || `drive-image-${fileId}`, {
      maxLength: 100,
      removeTurkishChars: false,
      addTimestamp: true,
    });

    // Upload to Supabase Storage
    const supabase = createServiceClient();
    const filePath = `media/${optimized.optimized}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, buffer, {
        contentType: metadata.mimeType,
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
    let altText = optimized.slug
      .split("-")
      .slice(0, 3)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    if (generateAltText && publicUrl) {
      try {
        const aiAltText = await generateAIAltText(publicUrl, context || undefined);
        if (aiAltText && aiAltText.length > 0) {
          altText = aiAltText;
        }
      } catch (error) {
        console.warn("AI alt text generation failed, using fallback:", error);
      }
    }

    // Get image dimensions
    let width: number | undefined;
    let height: number | undefined;
    try {
      const sharp = await import("sharp").catch(() => null);
      if (sharp) {
        const imageMetadata = await sharp.default(buffer).metadata();
        width = imageMetadata.width;
        height = imageMetadata.height;
      }
    } catch (error) {
      console.warn("Failed to get image dimensions:", error);
    }

    // Save metadata to database
    try {
      await supabase.from("media_assets").insert({
        title: optimized.slug,
        alt_text: altText,
        cloudinary_public_id: optimized.optimized,
        cloudinary_secure_url: publicUrl,
        width: width,
        height: height,
        bytes: parseInt(metadata.size || "0"),
        format: optimized.extension,
        mime_type: metadata.mimeType,
        ai_generated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("Failed to save metadata:", error);
    }

    return createSuccessResponse(requestId, {
      url: publicUrl,
      filename: optimized.optimized,
      originalFilename: metadata.name,
      altText,
      width,
      height,
      size: parseInt(metadata.size || "0"),
      mimeType: metadata.mimeType,
      source: "google_drive",
      seoOptimized: true,
    });
  } catch (error: any) {
    console.error("Google Drive import error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Import failed",
      error,
      500
    );
  }
}

export const POST = withErrorHandling(handlePost);
