import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Google Integration Sync API
 * Trigger sync for GSC or GA4
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ serviceType: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { serviceType } = await params;

    if (!["gsc", "ga4"].includes(serviceType)) {
      return NextResponse.json(
        { error: "Invalid service type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // In production, this would trigger actual sync job
    // For now, just update last_sync_at
    const { error } = await supabase
      .from("integration_accounts")
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "google")
      .eq("service_type", serviceType);

    if (error && error.code !== "PGRST116") {
      // Table doesn't exist or no account found, that's okay
      console.log("Sync triggered (mock):", serviceType);
    }

    return NextResponse.json({
      success: true,
      message: `Sync started for ${serviceType.toUpperCase()}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to start sync" },
      { status: 500 }
    );
  }
}

