import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
/**
 * Comment Management API
 * Approve, reject, or update a specific comment
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
    const { status, moderation_note } = body;

    if (!status || !["pending", "approved", "rejected", "spam"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (moderation_note) {
      updateData.moderation_note = moderation_note;
    }

    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
    } else if (status === "rejected" || status === "spam") {
      updateData.rejected_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("content_comments")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comment updated",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update comment" },
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

    const { error } = await supabase
      .from("content_comments")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete comment" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("content_comments")
      .select(`
        *,
        content_items:content_id (
          id,
          slug,
          content_locales (
            title
          )
        ),
        profiles:user_id (
          id,
          name,
          email
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch comment" },
      { status: 500 }
    );
  }
}

