import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { z } from "zod";

function requestId(): string {
  return `wv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function okJson(val: object, status: number = 200) {
  return NextResponse.json(val, { status });
}

const WebVitalsPayloadSchema = z
  .object({
    value: z.number(),
    name: z.string().optional(),
    metric: z.string().optional(),
    id: z.string().optional(),
    metric_id: z.string().optional(),
    rating: z.string().optional(),
    delta: z.number().optional(),
    navigationType: z.string().optional(),
    navigation_type: z.string().optional(),
  })
  .refine((d) => d.name != null || d.metric != null, { message: "name or metric required" });

/**
 * Web Vitals API — always returns JSON.
 * Invalid payload -> 400 JSON. Non-JSON -> 415 JSON. Never throws.
 */
export async function POST(request: NextRequest) {
  const rid = requestId();
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return okJson(
        { ok: false, error: "Unsupported Media Type", requestId: rid },
        415
      );
    }

    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return okJson({ ok: false, error: "Invalid JSON", requestId: rid }, 400);
    }

    const parsed = WebVitalsPayloadSchema.safeParse(raw);
    if (!parsed.success) {
      return okJson(
        { ok: false, error: "Invalid payload", requestId: rid },
        400
      );
    }

    const body = parsed.data;
    const name = body.metric ?? body.name ?? "unknown";
    const value = body.value;
    const id = body.id ?? body.metric_id ?? `web-vitals-${Date.now()}`;
    const rating = body.rating;
    const delta = body.delta;
    const navigationType = body.navigationType ?? body.navigation_type;

    try {
      const supabase = createServiceClient();
      const { error } = await supabase.from("seo_events").insert({
        event_type: "web_vitals",
        entity_type: "performance",
        entity_id: id,
        event_data: {
          metric: name,
          value,
          rating,
          delta,
          navigationType,
          timestamp: new Date().toISOString(),
        },
        status: rating === "good" ? "success" : rating === "needs-improvement" ? "warning" : "failed",
      });

      if (error && process.env.NODE_ENV === "development") {
        console.warn("[web-vitals] insert error:", error.message);
      }
      return okJson({ ok: true, success: true });
    } catch (e: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[web-vitals] db error:", e);
      }
      return okJson({ ok: true, success: true, warning: "Metrics not stored" });
    }
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV === "development") {
      console.error("[web-vitals] error:", err);
    }
    return okJson({ ok: false, error: err, requestId: rid }, 500);
  }
}

export async function GET() {
  return okJson({ ok: true, success: true });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: "POST, GET, OPTIONS" } });
}
