/**
 * Programmatic Pages API
 * GET: List all programmatic pages
 * POST: Create a new programmatic page
 */

import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";

async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("programmatic_pages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (
        error.code === "PGRST116" ||
        error.code === "42P01" ||
        error.message?.toLowerCase().includes("could not find the table") ||
        error.message?.toLowerCase().includes("schema cache")
      ) {
        return createSuccessResponse(requestId, { pages: [] });
      }
      throw error;
    }

    return createSuccessResponse(requestId, { pages: data || [], total: (data || []).length });
  } catch (error: any) {
    console.error("Programmatic pages fetch error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Sayfalar yüklenemedi",
      error,
      500
    );
  }
}

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const { slug, type, title, description, update_frequency, is_active, config } = body;

    if (!slug || !type || !title) {
      return createErrorResponse(requestId, "VALIDATION_ERROR", "slug, type ve title gerekli", null, 400);
    }

    const { data: existing } = await supabase
      .from("programmatic_pages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return createErrorResponse(requestId, "VALIDATION_ERROR", "Bu slug zaten kullanılıyor", null, 400);
    }

    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("programmatic_pages")
      .insert({
        slug,
        type,
        title,
        description: description || null,
        update_frequency: update_frequency || 60,
        is_active: is_active !== undefined ? is_active : true,
        config: config || {},
        last_updated: nowIso,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(requestId, { page: data }, 201);
  } catch (error: any) {
    console.error("Programmatic page create error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Sayfa oluşturulamadı",
      error,
      500
    );
  }
}

export const GET = withErrorHandling(handleGet);
export const POST = withErrorHandling(handlePost);
