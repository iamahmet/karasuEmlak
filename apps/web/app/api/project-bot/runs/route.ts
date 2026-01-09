import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { requireStaff } from "@/lib/auth/server";
export async function GET(_request: NextRequest) {
  try {
    await requireStaff();
    const supabase = await createClient();

    const { data: runs, error } = await supabase
      .from("bot_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ runs: runs || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

