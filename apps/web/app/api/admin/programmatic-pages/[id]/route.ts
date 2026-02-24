/**
 * Programmatic Page API (Single)
 * GET: Get single page
 * PUT: Update page
 * DELETE: Delete page
 */

import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";

async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  const { id } = await params;
  const supabase = createServiceClient();

  try {
    const { data, error } = await supabase
      .from("programmatic_pages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return createErrorResponse(requestId, "NOT_FOUND", "Sayfa bulunamadı", null, 404);
      }
      throw error;
    }

    return createSuccessResponse(requestId, { page: data });
  } catch (error: any) {
    console.error("Programmatic page fetch error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Sayfa yüklenemedi",
      error,
      500
    );
  }
}

async function handlePut(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  const { id } = await params;
  const supabase = createServiceClient();

  try {
    const body = await request.json();
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.update_frequency !== undefined) updateData.update_frequency = body.update_frequency;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.config !== undefined) updateData.config = body.config;

    if (body.slug) {
      const { data: existing } = await supabase
        .from("programmatic_pages")
        .select("id")
        .eq("slug", body.slug)
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return createErrorResponse(requestId, "VALIDATION_ERROR", "Bu slug zaten kullanılıyor", null, 400);
      }
    }

    const { data, error } = await supabase
      .from("programmatic_pages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return createSuccessResponse(requestId, { page: data });
  } catch (error: any) {
    console.error("Programmatic page update error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Sayfa güncellenemedi",
      error,
      500
    );
  }
}

async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  const { id } = await params;
  const supabase = createServiceClient();

  try {
    const { error } = await supabase
      .from("programmatic_pages")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return createSuccessResponse(requestId, { message: "Sayfa silindi" });
  } catch (error: any) {
    console.error("Programmatic page delete error:", error);
    return createErrorResponse(
      requestId,
      "INTERNAL_ERROR",
      error.message || "Sayfa silinemedi",
      error,
      500
    );
  }
}

export const GET = withErrorHandling(async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
  const params = context?.params || Promise.resolve({ id: "" });
  return handleGet(request, { params });
});

export const PUT = withErrorHandling(async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
  const params = context?.params || Promise.resolve({ id: "" });
  return handlePut(request, { params });
});

export const DELETE = withErrorHandling(async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
  const params = context?.params || Promise.resolve({ id: "" });
  return handleDelete(request, { params });
});
