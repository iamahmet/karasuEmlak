/**
 * Cron Job: Refresh Prayer Times
 * Runs monthly (1st of each month at 5 AM) to refresh prayer times for Karasu and Kocaali
 *
 * Vercel Cron: 0 5 1 * * (her ayın 1'i 05:00)
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron/verify-cron-secret";
import { refreshPrayerTimes } from "@karasu/lib/prayer-times-refresh";

const DISTRICTS = [
  { id: 9803, name: "Karasu" },
  { id: 9805, name: "Kocaali" },
];

export async function GET(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const year = new Date().getFullYear();
    const results: Array<{ district: string; success: boolean; rowsUpserted?: number; error?: string }> = [];

    for (const { id, name } of DISTRICTS) {
      const result = await refreshPrayerTimes({ year, districtId: id });
      results.push({
        district: name,
        success: result.success,
        rowsUpserted: result.rowsUpserted,
        error: result.error,
      });
    }

    return NextResponse.json({
      success: results.every((r) => r.success),
      message: "Prayer times refresh completed",
      results,
    });
  } catch (error: any) {
    console.error("Prayer times cron error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", success: false },
      { status: 500 }
    );
  }
}
