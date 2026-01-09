/**
 * Pharmacy API Route (Single)
 * GET: Get a single pharmacy
 * PUT: Update a pharmacy
 * DELETE: Soft delete a pharmacy
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/lib/api/error-handler';
import { getRequestId } from '@/lib/api/middleware';

async function handleGet(
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  const { id } = await context!.params;

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return createErrorResponse(
        requestId,
        'NOT_FOUND',
        'Pharmacy not found',
        undefined,
        404
      );
    }
    throw error;
  }

  return createSuccessResponse(requestId, { pharmacy: data }, 200);
}

async function handlePut(
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  const { id } = await context!.params;
  const body = await request.json();

  const supabase = createServiceClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (body.name !== undefined) updateData.name = body.name;
  if (body.address !== undefined) updateData.address = body.address;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.district !== undefined) updateData.district = body.district;
  if (body.city !== undefined) updateData.city = body.city;
  if (body.neighborhood !== undefined) updateData.neighborhood = body.neighborhood;
  if (body.latitude !== undefined) updateData.latitude = body.latitude;
  if (body.longitude !== undefined) updateData.longitude = body.longitude;
  if (body.is_on_duty !== undefined) updateData.is_on_duty = body.is_on_duty;
  if (body.duty_date !== undefined) updateData.duty_date = body.duty_date;
  if (body.duty_start_time !== undefined) updateData.duty_start_time = body.duty_start_time;
  if (body.duty_end_time !== undefined) updateData.duty_end_time = body.duty_end_time;
  if (body.source !== undefined) updateData.source = body.source;
  if (body.published !== undefined) updateData.published = body.published;
  if (body.verified !== undefined) updateData.verified = body.verified;
  if (body.last_verified_at !== undefined) updateData.last_verified_at = body.last_verified_at;

  const { data, error } = await supabase
    .from('pharmacies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return createErrorResponse(
        requestId,
        'NOT_FOUND',
        'Pharmacy not found',
        undefined,
        404
      );
    }
    throw error;
  }

  return createSuccessResponse(requestId, { pharmacy: data }, 200);
}

async function handleDelete(
  request: NextRequest,
  context?: { params: Promise<{ id: string }> }
) {
  const requestId = getRequestId(request);
  const { id } = await context!.params;

  const supabase = createServiceClient();

  // Soft delete
  const { data, error } = await supabase
    .from('pharmacies')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return createErrorResponse(
        requestId,
        'NOT_FOUND',
        'Pharmacy not found',
        undefined,
        404
      );
    }
    throw error;
  }

  return createSuccessResponse(requestId, { pharmacy: data }, 200);
}

export const GET = withErrorHandling(handleGet);
export const PUT = withErrorHandling(handlePut);
export const DELETE = withErrorHandling(handleDelete);
