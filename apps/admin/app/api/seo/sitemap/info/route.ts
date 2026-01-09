import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get published articles count
    const { count: totalUrls } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");

    // Get last updated article
    const { data: lastArticle } = await supabase
      .from("articles")
      .select("updated_at")
      .eq("status", "published")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      totalUrls: totalUrls || 0,
      lastGenerated: lastArticle?.updated_at || null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

