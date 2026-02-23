import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withRateLimit } from "@/lib/security/rate-limit";

/**
 * POST /api/saved-searches/create
 * Create a new saved search
 */
export async function POST(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, {
    identifier: "saved-search-create",
    limit: 5,
    window: "1 h",
  });
  if (!rateLimitResult.success) return rateLimitResult.response!;

  try {
    const body = await request.json();
    const {
      email,
      name,
      filters,
      frequency = "daily",
      email_notifications = true,
      push_notifications = false,
    } = body;

    if (!email || !name || !filters || typeof filters !== "object") {
      return NextResponse.json(
        { success: false, error: "E-posta, isim ve filtreler gereklidir" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Geçerli bir e-posta adresi giriniz" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("saved_searches")
      .insert({
        email: email.toLowerCase(),
        name,
        filters,
        frequency,
        email_notifications,
        push_notifications,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: "Kayıtlı arama oluşturulamadı" },
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
