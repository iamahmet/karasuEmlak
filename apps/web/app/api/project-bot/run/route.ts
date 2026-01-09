import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

import { requireStaff } from "@/lib/auth/server";
export async function POST(_request: NextRequest) {
  try {
    await requireStaff();
    const supabase = await createClient();

    // Create bot run record
    const { data: run, error: runError } = await supabase
      .from("bot_runs")
      .insert({
        run_type: "scan",
        status: "running",
      })
      .select()
      .single();

    if (runError) {
      return NextResponse.json({ error: runError.message }, { status: 500 });
    }

    // Run bot scan in background (in production, use a job queue)
    // For now, just mark as completed
    setTimeout(async () => {
      await supabase
        .from("bot_runs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          findings_count: 0,
          errors_count: 0,
          warnings_count: 0,
        })
        .eq("id", run.id);
    }, 1000);

    return NextResponse.json({
      success: true,
      runId: run.id,
      message: "Bot scan started",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

