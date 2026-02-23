import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withRateLimit } from "@/lib/security/rate-limit";

/**
 * PATCH /api/saved-searches/[id]
 * Update a saved search
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await withRateLimit(request, {
    identifier: "saved-search-update",
    limit: 20,
    window: "1 h",
  });
  if (!rateLimitResult.success) return rateLimitResult.response!;

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID gereklidir" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.filters !== undefined) updates.filters = body.filters;
    if (body.frequency !== undefined) updates.frequency = body.frequency;
    if (body.email_notifications !== undefined)
      updates.email_notifications = body.email_notifications;
    if (body.push_notifications !== undefined)
      updates.push_notifications = body.push_notifications;
    if (body.is_active !== undefined) updates.is_active = body.is_active;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: "Güncellenecek alan yok" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("saved_searches")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: "Kayıtlı arama güncellenemedi" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/saved-searches/[id]
 * Soft-deactivate a saved search
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResult = await withRateLimit(request, {
    identifier: "saved-search-delete",
    limit: 20,
    window: "1 h",
  });
  if (!rateLimitResult.success) return rateLimitResult.response!;

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "ID gereklidir" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: "Kayıtlı arama silinemedi" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
