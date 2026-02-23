import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withRateLimit } from "@/lib/security/rate-limit";

/**
 * GET /api/saved-searches?email=user@example.com
 * List saved searches for an email
 */
export async function GET(request: NextRequest) {
  const rateLimitResult = await withRateLimit(request, {
    identifier: "saved-searches-list",
    limit: 30,
    window: "1 h",
  });
  if (!rateLimitResult.success) return rateLimitResult.response!;

  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json(
      { success: false, error: "E-posta adresi gereklidir" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: "Kayıtlı aramalar alınamadı" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: data || [] });
}
