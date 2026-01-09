import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { requireStaff } from "@/lib/auth/server";
export async function GET(request: NextRequest) {
  try {
    await requireStaff();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");

    let query = supabase.from("bot_findings").select("*");

    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (severity && severity !== "all") {
      query = query.eq("severity", severity);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data: findings, error } = await query.order("created_at", { ascending: false }).limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ findings: findings || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

