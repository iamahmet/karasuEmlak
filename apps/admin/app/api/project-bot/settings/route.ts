/**
 * Project Bot Settings Route
 * Save and retrieve bot configuration
 */

import { NextRequest, NextResponse } from "next/server";

import { requireStaff } from "@/lib/auth/server";
export async function GET(_request: NextRequest) {
  try {
    await requireStaff();
    // Return default settings (can be stored in database later)
    return NextResponse.json({
      errorThreshold: 0,
      warningThreshold: 10,
      scheduleEnabled: false,
      scheduleCron: "0 2 * * *",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireStaff();
    const body = await request.json();
    
    // Save settings (can be stored in database later)
    // For now, just return success
    return NextResponse.json({ success: true, settings: body });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

