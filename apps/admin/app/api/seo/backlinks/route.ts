import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Backlink Monitor API
 * Get tracked backlinks
 */
export async function GET(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";

    const supabase = await createClient();

    // Check if backlinks table exists
    let query = supabase.from("backlinks").select("*");

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data: backlinks, error } = await query.order("discovered_at", {
      ascending: false,
    });

    if (error && error.code !== "PGRST116") {
      // Table doesn't exist, return empty array
      return NextResponse.json({
        success: true,
        backlinks: [],
      });
    }

    return NextResponse.json({
      success: true,
      backlinks: backlinks || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch backlinks" },
      { status: 500 }
    );
  }
}
