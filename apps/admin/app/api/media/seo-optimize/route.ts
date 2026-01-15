import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { generateAIAltText } from "@/lib/utils/image-seo-optimizer";
import { optimizeFilename } from "@/lib/utils/filename-optimizer";

export async function POST(request: NextRequest) {
  try {
    const { imageId, imageUrl, currentAltText, filename } = await request.json();

    if (!imageId || !imageUrl) {
      return NextResponse.json(
        { error: "imageId ve imageUrl gerekli" },
        { status: 400 }
      );
    }

    // Generate SEO-friendly alt text using AI
    const seoAltText = await generateAIAltText(imageUrl, filename);

    // Optimize filename for SEO
    const optimizedFilename = optimizeFilename(filename || "image", {
      maxLength: 100,
      removeTurkishChars: false,
      addTimestamp: false,
    });

    // Update database
    const supabase = createServiceClient();
    const updates: any = {
      alt_text: seoAltText,
    };

    // Try to update media_assets table
    const { error: updateError } = await supabase
      .from("media_assets")
      .update(updates)
      .eq("id", imageId);

    if (updateError) {
      console.warn("Failed to update media_assets:", updateError);
      // Continue anyway, we'll return the optimized data
    }

    return NextResponse.json({
      success: true,
      altText: seoAltText,
      optimizedFilename: optimizedFilename.optimized,
    });
  } catch (error: any) {
    console.error("SEO optimize error:", error);
    return NextResponse.json(
      { error: error.message || "SEO optimizasyonu başarısız" },
      { status: 500 }
    );
  }
}
