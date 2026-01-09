import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { requireStaff } from "@/lib/auth/server";

/**
 * Content Import API
 * Import content items from JSON or CSV
 * Admin API: Uses service role to bypass RLS
 */
export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    // Admin API: ALWAYS use service role client
    const supabase = createServiceClient();
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = formData.get("format") || "json";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileContent = await file.text();
    let items: any[] = [];

    // Parse file based on format
    if (format === "json") {
      items = JSON.parse(fileContent);
    } else if (format === "csv") {
      items = parseCSV(fileContent);
    } else {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid file format or empty file" }, { status: 400 });
    }

    // Get current user (or use mock user in development)
    let user;
    if (process.env.NODE_ENV === "development") {
      const { data: mockUser } = await supabase.auth.getUser();
      user = mockUser?.user || { id: "00000000-0000-0000-0000-000000000000" };
    } else {
      user = await requireStaff();
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Import each item
    for (const item of items) {
      try {
        // Create slug if not provided
        const slug =
          item.slug ||
          (item.title || item.Title || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        if (!slug) {
          results.failed++;
          results.errors.push(`Item missing slug and title: ${JSON.stringify(item)}`);
          continue;
        }

        // Create content item
        const { data: contentItem, error: createError } = await supabase
          .from("content_items")
          .insert({
            type: item.type || item.Type || "normal",
            slug,
            status: item.status || item.Status || "draft",
            author_id: user.id,
          })
          .select()
          .single();

        if (createError) {
          results.failed++;
          results.errors.push(`Failed to create content item: ${createError.message}`);
          continue;
        }

        // Create content locale
        const locale = item.locale || item.Locale || "tr";
        const title = item.title || item.Title || "";
        const content = item.content || item.Content || "";
        const excerpt = item.excerpt || item.Excerpt || "";
        const metaDescription = item.meta_description || item["Meta Description"] || "";

        const { error: localeError } = await supabase.from("content_locales").insert({
          content_item_id: contentItem.id,
          locale,
          title,
          content,
          excerpt,
          meta_description: metaDescription,
          translation_status: "imported",
        });

        if (localeError) {
          results.failed++;
          results.errors.push(`Failed to create locale: ${localeError.message}`);
          continue;
        }

        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Error importing item: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Imported ${results.success} items successfully, ${results.failed} failed`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseCSV(csvContent: string): any[] {
  const lines = csvContent.split("\n").filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const items: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const item: any = {};

    headers.forEach((header, index) => {
      item[header] = values[index] || "";
    });

    items.push(item);
  }

  return items;
}

