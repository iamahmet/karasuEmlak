/**
 * Approve Content Route
 * Approves content for publishing (workflow: draft -> review -> approved -> published)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { logAuditEvent } from "@karasu/lib/audit";
import { requireStaff } from "@/lib/auth/server";

/**
 * Content Studio Approve API
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
    const { locale, comment } = body;

    // Get content item
    const { data: contentItem } = await supabase
      .from("content_items")
      .select("*")
      .eq("id", id)
      .single();

    if (!contentItem) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Update content item status to approved
    const { error: updateError } = await supabase
      .from("content_items")
      .update({
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id || null,
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update locale status
    await supabase
      .from("content_locales")
      .update({ status: "approved" })
      .eq("content_item_id", id)
      .eq("locale", locale);

    // Log approval comment if provided
    if (comment) {
      await supabase.from("content_comments").insert({
        content_item_id: id,
        locale,
        comment,
        type: "approval",
        created_by: (await supabase.auth.getUser()).data.user?.id || null,
      });
    }

    // Log audit event
    const { data: { user } } = await supabase.auth.getUser();
    await logAuditEvent({
      type: 'content.approved',
      user_id: user?.id || 'system',
      resource_type: 'content_item',
      resource_id: id,
      metadata: { locale, comment },
    });

    return NextResponse.json({
      success: true,
      message: "Content approved successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
