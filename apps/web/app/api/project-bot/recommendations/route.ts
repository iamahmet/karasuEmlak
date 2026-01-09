import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { requireStaff } from "@/lib/auth/server";
export async function GET(request: NextRequest) {
  try {
    await requireStaff();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const column = searchParams.get("column");

    let query = supabase.from("bot_recommendations").select("*");

    if (column && column !== "all") {
      query = query.eq("kanban_column", column);
    }

    const { data: recommendations, error } = await query
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ recommendations: recommendations || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

