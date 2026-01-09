/**
 * Reject Content Route
 * Rejects content and sends back to draft (workflow: review -> draft)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { logAuditEvent } from "@karasu/lib/audit";
import { requireStaff } from "@/lib/auth/server";

/**
 * Content Studio Reject API
 * Admin API: Uses service role to bypass RLS
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();
    const { locale, reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Get content item
    const { data: contentItem } = await supabase
      .from("content_items")
      .select("*")
      .eq("id", id)
      .single();

    if (!contentItem) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Update content item status to draft
    const { error: updateError } = await supabase
      .from("content_items")
      .update({
        status: "draft",
        rejected_at: new Date().toISOString(),
        rejected_by: (await supabase.auth.getUser()).data.user?.id || null,
        rejection_reason: reason,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update locale status
    await supabase
      .from("content_locales")
      .update({ status: "draft" })
      .eq("content_item_id", id)
      .eq("locale", locale);

    // Add rejection comment
    await supabase.from("content_comments").insert({
      content_item_id: id,
      locale,
      comment: reason,
      type: "rejection",
      created_by: (await supabase.auth.getUser()).data.user?.id || null,
    });

    // Log audit event
    const { data: { user } } = await supabase.auth.getUser();
    await logAuditEvent({
      type: 'content.rejected',
      user_id: user?.id || 'system',
      resource_type: 'content_item',
      resource_id: id,
      metadata: { locale, reason },
    });

    return NextResponse.json({
      success: true,
      message: "Content rejected and sent back to draft",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
