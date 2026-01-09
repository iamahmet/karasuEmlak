import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Compliance Policy API
 * Update and delete policies
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const { data: policy, error } = await supabase
      .from("policies")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      policy: policy || { id, ...body },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update policy" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("policies").delete().eq("id", id);

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete policy" },
      { status: 500 }
    );
  }
}
