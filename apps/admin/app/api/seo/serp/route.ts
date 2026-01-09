import { NextRequest, NextResponse } from "next/server";

/**
 * SERP Tracker API
 * Track keyword positions in SERP
 */
export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { keyword } = await request.json();

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      );
    }

    // In production, this would check actual SERP position
    // For now, return mock data
    const result = {
      id: Date.now().toString(),
      keyword: keyword.trim(),
      position: Math.floor(Math.random() * 20) + 1,
      previousPosition: null,
      url: "/",
      title: "Example Page Title",
      description: "Example page description",
      lastChecked: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to track SERP position" },
      { status: 500 }
    );
  }
}
