import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Competitors API
 * Manage competitor tracking
 */
export async function GET(_request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

            const supabase = await createClient();
            const { data: competitors, error } = await supabase
              .from("seo_competitors")
              .select("*")
              .order("created_at", { ascending: false });

            if (error && error.code !== "PGRST116") {
              throw error;
            }

            return NextResponse.json({
              success: true,
              competitors: competitors || [],
            });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch competitors" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

                const supabase = await createClient();
                const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");

                // Check if competitor already exists
                const { data: existing } = await supabase
                  .from("seo_competitors")
                  .select("id")
                  .eq("domain", cleanDomain)
                  .single();

                if (existing) {
                  return NextResponse.json(
                    { error: "Competitor already exists" },
                    { status: 400 }
                  );
                }

                // Insert new competitor
                const { data: competitor, error: insertError } = await supabase
                  .from("seo_competitors")
                  .insert({
                    domain: cleanDomain,
                    domain_authority: Math.floor(Math.random() * 40) + 30, // Mock data
                    backlinks: Math.floor(Math.random() * 10000) + 1000,
                    organic_keywords: Math.floor(Math.random() * 5000) + 500,
                    traffic: Math.floor(Math.random() * 50000) + 5000,
                    top_keywords: ["keyword1", "keyword2", "keyword3"],
                    last_checked_at: new Date().toISOString(),
                  })
                  .select()
                  .single();

                if (insertError) {
                  throw insertError;
                }

                return NextResponse.json({
                  success: true,
                  competitor,
                });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to add competitor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Competitor ID is required" },
        { status: 400 }
      );
    }

                const supabase = await createClient();
                const { error } = await supabase
                  .from("seo_competitors")
                  .delete()
                  .eq("id", id);

                if (error) {
                  throw error;
                }

                return NextResponse.json({
                  success: true,
                  message: "Competitor deleted",
                });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete competitor" },
      { status: 500 }
    );
  }
}

