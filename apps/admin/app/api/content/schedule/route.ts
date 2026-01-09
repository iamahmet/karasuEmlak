import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";

/**
 * Content Scheduling API
 * Handles scheduled publishing for articles and news
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id, scheduled_publish_at } = body;

    if (!type || !id || !scheduled_publish_at) {
      return NextResponse.json(
        { error: "type, id, and scheduled_publish_at are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const tableName = type === "article" ? "articles" : "news_articles";

    const { data, error } = await supabase
      .from(tableName)
      .update({
        scheduled_publish_at: new Date(scheduled_publish_at).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Schedule content error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to schedule content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Content scheduled for ${new Date(scheduled_publish_at).toLocaleString("tr-TR")}`,
      content: data,
    });
  } catch (error: any) {
    console.error("Schedule content exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json(
        { error: "type and id are required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const tableName = type === "article" ? "articles" : "news_articles";

    const { data, error } = await supabase
      .from(tableName)
      .update({
        scheduled_publish_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Unschedule content error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to unschedule content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Schedule cancelled",
      content: data,
    });
  } catch (error: any) {
    console.error("Unschedule content exception:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

