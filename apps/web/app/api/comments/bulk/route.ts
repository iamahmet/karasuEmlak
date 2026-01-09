import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Comment IDs required" },
        { status: 400 }
      );
    }

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

    if (status === "approved") {
      updateData.approved_at = new Date().toISOString();
    } else if (status === "rejected" || status === "spam") {
      updateData.rejected_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("content_comments")
      .update(updateData)
      .in("id", ids);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} comment(s) updated`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update comments" },
      { status: 500 }
    );
  }
}
