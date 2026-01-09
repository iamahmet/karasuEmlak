import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Health Check API
 * Check system health status
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const health: Record<string, any> = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      checks: {},
    };

    // Database check
    try {
      const { error } = await supabase.from("articles").select("id").limit(1);
      health.checks.database = {
        status: error ? "error" : "healthy",
        message: error ? "Database connection failed" : "Database connection OK",
      };
      if (error) health.status = "degraded";
    } catch (error: any) {
      health.checks.database = {
        status: "error",
        message: error.message || "Database check failed",
      };
      health.status = "error";
    }

    // Auth check
    try {
      const { data: { user: _user }, error } = await supabase.auth.getUser();
      health.checks.auth = {
        status: error ? "warning" : "healthy",
        message: error ? "Auth service check failed" : "Auth service OK",
      };
      if (error && health.status === "healthy") health.status = "degraded";
    } catch (error: any) {
      health.checks.auth = {
        status: "warning",
        message: error.message || "Auth check failed",
      };
      if (health.status === "healthy") health.status = "degraded";
    }

    // Storage check (if using Supabase Storage)
    try {
      const { data: _data, error } = await supabase.storage.listBuckets();
      health.checks.storage = {
        status: error ? "warning" : "healthy",
        message: error ? "Storage check failed" : "Storage service OK",
      };
      if (error && health.status === "healthy") health.status = "degraded";
    } catch (error: any) {
      health.checks.storage = {
        status: "warning",
        message: error.message || "Storage check failed",
      };
      if (health.status === "healthy") health.status = "degraded";
    }

    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error.message || "Health check failed",
      },
      { status: 503 }
    );
  }
}

export async function HEAD(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("articles").select("id").limit(1);
    return new NextResponse(null, { status: error ? 503 : 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
