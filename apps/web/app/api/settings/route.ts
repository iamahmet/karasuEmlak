import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Site Settings API
 * Get and update site settings
 */
export async function GET(_request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const supabase = await createClient();

    const { data: settings, error } = await supabase
      .from("site_settings")
      .select("*")
      .single();

    const defaultSettings = {
      site_name: "Karasu Emlak",
      site_description: "",
      site_url: process.env.NEXT_PUBLIC_SITE_URL || "https://karasuradyo.com",
      default_locale: "tr",
      contact_email: "",
      support_email: "",
      enable_registration: true,
      enable_comments: true,
      enable_newsletter: true,
      maintenance_mode: false,
      // Security defaults
      session_timeout: 3600,
      password_min_length: 8,
      password_require_uppercase: true,
      password_require_lowercase: true,
      password_require_numbers: true,
      password_require_symbols: false,
      rate_limit_enabled: true,
      rate_limit_requests: 100,
      rate_limit_window: 60,
      two_factor_enabled: false,
      // Media defaults
      max_upload_size: 10485760,
      allowed_image_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      allowed_video_types: ["video/mp4", "video/webm"],
      allowed_document_types: ["application/pdf", "application/msword"],
      enable_image_compression: true,
      image_quality: 85,
      // SEO defaults
      default_meta_title: "",
      default_meta_description: "",
      default_meta_keywords: "",
      enable_og_tags: true,
      enable_twitter_cards: true,
      enable_schema_markup: true,
      // Social Media defaults
      facebook_url: "",
      twitter_url: "",
      instagram_url: "",
      youtube_url: "",
      linkedin_url: "",
      // Performance defaults
      enable_caching: true,
      cache_duration: 3600,
      enable_cdn: false,
      cdn_url: "",
    };

    const response = NextResponse.json({
      success: true,
      settings: error && error.code !== "PGRST116" ? defaultSettings : (settings || defaultSettings),
    });
    
    // Cache for 5 minutes (settings don't change often)
    response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const body = await request.json();
    const supabase = await createClient();

    // Check if settings exist
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .single();

    let result;
    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from("site_settings")
        .update({
          ...body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("site_settings")
        .insert({
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    }

    // Sync settings change to web app
    try {
      const { syncToWebApp } = await import("@/lib/web-app/sync");
      await syncToWebApp({ type: 'settings' });
    } catch (error) {
      console.warn('Failed to sync settings to web app:', error);
    }

    return NextResponse.json({
      success: true,
      settings: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}

