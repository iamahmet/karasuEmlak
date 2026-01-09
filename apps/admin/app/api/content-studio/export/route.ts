import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Content Export API
 * Export content items in various formats (CSV, JSON, Excel)
 * Admin API: Uses service role to bypass RLS
 */
export async function GET(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const status = searchParams.get("status");
    const locale = searchParams.get("locale") || "tr";

    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from("content_items")
      .select(`
        *,
        locales:content_locales!inner(*)
      `)
      .eq("locales.locale", locale);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: items, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No content found" }, { status: 404 });
    }

    // Format data based on requested format
    switch (format.toLowerCase()) {
      case "csv":
        return exportCSV(items, locale);
      case "json":
        return exportJSON(items);
      case "excel":
        return exportExcel(items, locale);
      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function exportCSV(items: any[], locale: string): NextResponse {
  const headers = [
    "ID",
    "Title",
    "Slug",
    "Type",
    "Status",
    "Locale",
    "Content",
    "Excerpt",
    "Meta Description",
    "Created At",
    "Updated At",
    "Published At",
  ];

  const rows = items.map((item) => {
    const localeData = item.locales?.[0] || {};
    return [
      item.id,
      localeData.title || "",
      item.slug || "",
      item.type || "",
      item.status || "",
      locale,
      localeData.content?.replace(/,/g, ";") || "",
      localeData.excerpt?.replace(/,/g, ";") || "",
      localeData.meta_description?.replace(/,/g, ";") || "",
      item.created_at || "",
      item.updated_at || "",
      item.published_at || "",
    ];
  });

  const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="content-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

function exportJSON(items: any[]): NextResponse {
  const json = JSON.stringify(
    items.map((item) => ({
      id: item.id,
      slug: item.slug,
      type: item.type,
      status: item.status,
      locales: item.locales || [],
      created_at: item.created_at,
      updated_at: item.updated_at,
      published_at: item.published_at,
    })),
    null,
    2
  );

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="content-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}

function exportExcel(items: any[], locale: string): NextResponse {
  // For Excel, we'll return JSON with Excel-compatible structure
  // In production, you might want to use a library like 'xlsx'
  const excelData = items.map((item) => {
    const localeData = item.locales?.[0] || {};
    return {
      ID: item.id,
      Title: localeData.title || "",
      Slug: item.slug || "",
      Type: item.type || "",
      Status: item.status || "",
      Locale: locale,
      Content: localeData.content || "",
      Excerpt: localeData.excerpt || "",
      "Meta Description": localeData.meta_description || "",
      "Created At": item.created_at || "",
      "Updated At": item.updated_at || "",
      "Published At": item.published_at || "",
    };
  });

  return new NextResponse(JSON.stringify(excelData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="content-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}

