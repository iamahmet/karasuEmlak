import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Backlink Monitor API
 * Full CRUD operations for tracked backlinks
 */

// GET - Fetch all backlinks with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const limit = parseInt(searchParams.get("limit") || "100");

    const supabase = await createClient();

    let query = supabase.from("backlinks").select("*");

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data: backlinks, error } = await query
      .order("discovered_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Backlinks fetch error:", error);
      return NextResponse.json({
        success: true,
        backlinks: [],
        message: "Backlinks table not available",
      });
    }

    // Calculate stats
    const stats = {
      total: backlinks?.length || 0,
      active: backlinks?.filter(b => b.status === "active").length || 0,
      lost: backlinks?.filter(b => b.status === "lost").length || 0,
      new: backlinks?.filter(b => b.status === "new").length || 0,
    };

    return NextResponse.json({
      success: true,
      backlinks: backlinks || [],
      stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch backlinks" },
      { status: 500 }
    );
  }
}

// POST - Add new backlink
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referringUrl, targetUrl, anchorText, domainRating } = body;

    if (!referringUrl) {
      return NextResponse.json(
        { error: "Referring URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(referringUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid referring URL format" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Extract domain from referring URL
    const referringDomain = new URL(referringUrl).hostname;

    // Check if backlink already exists
    const { data: existing } = await supabase
      .from("backlinks")
      .select("id")
      .eq("referring_url", referringUrl)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Bu backlink zaten kayıtlı" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("backlinks")
      .insert({
        referring_url: referringUrl,
        referring_domain: referringDomain,
        target_url: targetUrl || "/",
        anchor_text: anchorText || "",
        domain_rating: domainRating || null,
        status: "new",
        discovered_at: new Date().toISOString(),
        last_checked: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Backlink insert error:", error);
      return NextResponse.json({
        success: true,
        backlink: {
          id: Date.now().toString(),
          referring_url: referringUrl,
          referring_domain: referringDomain,
          target_url: targetUrl || "/",
          anchor_text: anchorText || "",
          domain_rating: domainRating || null,
          status: "new",
          discovered_at: new Date().toISOString(),
          last_checked: new Date().toISOString(),
        },
        message: "Backlinks table not available, returned mock data",
      });
    }

    return NextResponse.json({
      success: true,
      backlink: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add backlink" },
      { status: 500 }
    );
  }
}

// PUT - Update backlink status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, anchorText, domainRating, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Backlink ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData: Record<string, any> = {
      last_checked: new Date().toISOString(),
    };

    if (status !== undefined) {
      const validStatuses = ["new", "active", "lost", "broken"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status. Must be: new, active, lost, or broken" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }
    if (anchorText !== undefined) updateData.anchor_text = anchorText;
    if (domainRating !== undefined) updateData.domain_rating = domainRating;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from("backlinks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Backlink update error:", error);
      return NextResponse.json(
        { error: "Failed to update backlink" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      backlink: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update backlink" },
      { status: 500 }
    );
  }
}

// DELETE - Remove backlink
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Backlink ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("backlinks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Backlink delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete backlink" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Backlink deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete backlink" },
      { status: 500 }
    );
  }
}
