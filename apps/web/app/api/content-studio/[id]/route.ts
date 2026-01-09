import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { logAuditEvent } from "@karasu/lib/audit";
import { requireStaff } from "@/lib/auth/server";

/**
 * Content Studio Update API
 * Admin API: Uses service role to bypass RLS
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireStaff();
    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();
    const { id } = await params;
    const body = await request.json();

    const { locale, ...localeData } = body;

    // Update or create content locale
    const { data: existing } = await supabase
      .from("content_locales")
      .select("id")
      .eq("content_item_id", id)
      .eq("locale", locale)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("content_locales")
        .update(localeData)
        .eq("id", existing.id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      const { error } = await supabase.from("content_locales").insert({
        content_item_id: id,
        locale,
        ...localeData,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Log audit event
    const { data: { user } } = await supabase.auth.getUser();
    await logAuditEvent({
      type: 'content.updated',
      user_id: user?.id || 'system',
      resource_type: 'content_item',
      resource_id: id,
      metadata: { locale },
    });

    // Sync content update to web app
    try {
      const { syncToWebApp } = await import("@/lib/web-app/sync");
      await syncToWebApp({
        type: 'content',
        resourceId: id,
        action: 'update'
      });
    } catch (error) {
      console.warn('Failed to sync content update to web app:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

