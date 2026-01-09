import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * SEO Reports API
 * Generate and manage SEO reports
 */
export async function GET(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";

    // Fetch recent reports from database
    const { data: reports, error } = await supabase
      .from("seo_reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error && error.code !== "PGRST116") {
      // Table might not exist yet, return mock data
      console.warn("seo_reports table not found, returning mock data.");
      const mockReports = [
        {
          id: "1",
          name: "SEO Özet Raporu - Ocak 2025",
          type: "summary",
          date: new Date().toISOString(),
          created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: "2",
          name: "Detaylı SEO Raporu - Aralık 2024",
          type: "detailed",
          date: new Date(Date.now() - 86400000 * 15).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
        },
        {
          id: "3",
          name: "Teknik SEO Raporu - Aralık 2024",
          type: "technical",
          date: new Date(Date.now() - 86400000 * 25).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
        },
      ];
      return NextResponse.json({ success: true, reports: mockReports });
    }

    const filteredReports =
      type === "all" ? reports : reports?.filter((r) => r.type === type) || [];

    return NextResponse.json({
      success: true,
      reports: filteredReports || [],
    });
  } catch (error: any) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { type, dateRange } = await request.json();

    if (!type || !["summary", "detailed", "technical"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid report type" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Generate report data
    const reportData = {
      type,
      name: `${type === "summary" ? "Özet" : type === "detailed" ? "Detaylı" : "Teknik"} SEO Raporu - ${new Date().toLocaleDateString("tr-TR")}`,
      date: new Date().toISOString(),
      dateRange: dateRange || null,
      status: "completed",
      created_at: new Date().toISOString(),
    };

    // Save report to database
    const { data, error } = await supabase
      .from("seo_reports")
      .insert(reportData)
      .select()
      .single();

    if (error && error.code !== "PGRST116") {
      // Table might not exist, return mock response
      console.warn("seo_reports table not found, returning mock response.");
      return NextResponse.json({
        success: true,
        report: {
          id: Date.now().toString(),
          ...reportData,
        },
        message: "Report generated successfully (mock)",
      });
    }

    return NextResponse.json({
      success: true,
      report: data,
      message: "Report generated successfully",
    });
  } catch (error: any) {
    console.error("Failed to generate report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}

