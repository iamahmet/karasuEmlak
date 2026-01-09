/**
 * Pharmacies API Route
 * GET: List all pharmacies with filters
 * POST: Create a new pharmacy
 */

import { NextRequest } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withErrorHandling, createSuccessResponse, createErrorResponse } from '@/lib/admin/api/error-handler';
import { getRequestId } from '@/lib/admin/api/middleware';

async function handleGet(request: NextRequest) {
  const requestId = getRequestId(request);
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const district = searchParams.get('district');
  const isOnDuty = searchParams.get('is_on_duty');
  const published = searchParams.get('published');
  const search = searchParams.get('search');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

  const supabase = createServiceClient();

  let query = supabase
    .from('pharmacies')
    .select('*', { count: 'exact' })
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (city) {
    query = query.eq('city', city);
  }

  if (district) {
    query = query.eq('district', district);
  }

  if (isOnDuty !== null) {
    query = query.eq('is_on_duty', isOnDuty === 'true');
  }

  if (published !== null) {
    query = query.eq('published', published === 'true');
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,address.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    if (error.code === 'PGRST116' || error.code === '42P01') {
      return createErrorResponse(
        requestId,
        'TABLE_NOT_FOUND',
        'Pharmacies table does not exist',
        undefined,
        404
      );
    }
    throw error;
  }

  return createSuccessResponse(
    requestId,
    {
      pharmacies: data || [],
      count: count || 0,
      limit,
      offset,
    },
    200
  );
}

async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  const body = await request.json();

  const {
    name,
    address,
    phone,
    district,
    city = 'Sakarya',
    neighborhood,
    latitude,
    longitude,
    is_on_duty = false,
    duty_date,
    duty_start_time,
    duty_end_time,
    source = 'manual',
    published = true,
  } = body;

  if (!name || !address || !district) {
    return createErrorResponse(
      requestId,
      'VALIDATION_ERROR',
      'Name, address, and district are required',
      undefined,
      400
    );
  }

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('pharmacies')
    .insert({
      name,
      address,
      phone,
      district,
      city,
      neighborhood,
      latitude,
      longitude,
      is_on_duty,
      duty_date,
      duty_start_time,
      duty_end_time,
      source,
      published,
      last_verified_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116' || error.code === '42P01') {
      return createErrorResponse(
        requestId,
        'TABLE_NOT_FOUND',
        'Pharmacies table does not exist',
        undefined,
        404
      );
    }
    throw error;
  }

  return createSuccessResponse(requestId, { pharmacy: data }, 201);
}

export const GET = withErrorHandling(handleGet);
export const POST = withErrorHandling(handlePost);
