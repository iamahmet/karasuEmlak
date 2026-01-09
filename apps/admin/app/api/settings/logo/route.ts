import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Logo Upload API
 * Upload logo to Supabase Storage and update site_settings
 */
export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string || "Karasu Emlak";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = await createClient();

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload logo" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);
    const logoUrl = urlData.publicUrl;

    // Update site_settings
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .single();

    if (existing) {
      const { error: updateError } = await supabase
        .from("site_settings")
        .update({
          logo_url: logoUrl,
          logo_alt_text: altText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("site_settings")
        .insert({
          logo_url: logoUrl,
          logo_alt_text: altText,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      logoUrl,
      altText,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload logo" },
      { status: 500 }
    );
  }
}

