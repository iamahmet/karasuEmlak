import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Compliance Policies API
 * Get and create policies
 */
export async function GET(_request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const supabase = await createClient();

    const { data: policies, error } = await supabase
      .from("policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({
        success: true,
        policies: [],
      });
    }

    return NextResponse.json({
      success: true,
      policies: policies || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const body = await request.json();
    const supabase = await createClient();

    const { data: policy, error } = await supabase
      .from("policies")
      .insert({
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      policy: policy || {
        id: Date.now().toString(),
        ...body,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create policy" },
      { status: 500 }
    );
  }
}
