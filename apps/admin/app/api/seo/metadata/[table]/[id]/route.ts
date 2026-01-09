import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Metadata Update API
 * Update metadata for articles or content items
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { table, id } = await params;
    const body = await request.json();

    if (!["articles", "content_items"].includes(table)) {
      return NextResponse.json(
        { error: "Invalid table name" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update metadata
    const { data, error } = await supabase
      .from(table)
      .update({
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        canonical_url: body.canonical_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update metadata" },
      { status: 500 }
    );
  }
}
