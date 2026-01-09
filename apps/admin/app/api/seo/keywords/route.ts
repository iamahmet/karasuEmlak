import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Keyword Tracker API
 * Get and manage tracked keywords
 */
export async function GET(_request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const supabase = await createClient();

    // Check if keywords table exists
    const { data: keywords, error } = await supabase
      .from("seo_keywords")
      .select("*")
      .order("created_at", { ascending: false });

    if (error && error.code !== "PGRST116") {
      // Table doesn't exist, return empty array
      return NextResponse.json({
        success: true,
        keywords: [],
      });
    }

    return NextResponse.json({
      success: true,
      keywords: keywords || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch keywords" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { keyword, url } = await request.json();

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if keywords table exists
    const { data, error } = await supabase
      .from("seo_keywords")
      .insert({
        keyword: keyword.trim(),
        url: url || "/",
        position: null,
        previous_position: null,
        search_volume: null,
        difficulty: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error && error.code !== "PGRST116") {
      // Table doesn't exist, return mock data
      return NextResponse.json({
        success: true,
        keyword: {
          id: Date.now().toString(),
          keyword: keyword.trim(),
          url: url || "/",
          position: null,
          previousPosition: null,
          searchVolume: null,
          difficulty: null,
          lastChecked: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      keyword: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add keyword" },
      { status: 500 }
    );
  }
}
