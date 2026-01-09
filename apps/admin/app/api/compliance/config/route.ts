import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Compliance Config API
 * Get and update consent banner configuration
 */
export async function GET(_request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const supabase = await createClient();

    // Get consent config from site_settings or dedicated table
    const { data: settings } = await supabase
      .from("site_settings")
      .select("consent_config")
      .single();

    const defaultConfig = {
      bannerEnabled: true,
      bannerText: "We use cookies to enhance your browsing experience...",
      preferenceCenterEnabled: true,
      purposes: {
        necessary: { enabled: true, required: true },
        analytics: { enabled: true, required: false },
        marketing: { enabled: true, required: false },
        personalization: { enabled: true, required: false },
      },
    };

    return NextResponse.json({
      success: true,
      config: settings?.consent_config || defaultConfig,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch config" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const body = await request.json();
    const supabase = await createClient();

    // Update consent config in site_settings
    const { data: existing } = await supabase
      .from("site_settings")
      .select("id")
      .single();

    if (existing) {
      const { error } = await supabase
        .from("site_settings")
        .update({
          consent_config: body,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabase
        .from("site_settings")
        .insert({
          consent_config: body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Configuration saved",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save config" },
      { status: 500 }
    );
  }
}
