import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withErrorHandling } from '@/lib/api/error-handler';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

async function handleGet(
  request: NextRequest,
  context?: { params?: Promise<{ id: string }> }
) {
  const params = context?.params || Promise.resolve({ id: '' });
  const { id } = await params;

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('authors')
    .select(`
      *,
      avatar:media_assets!authors_avatar_media_id_fkey(id, secure_url, alt_text),
      cover:media_assets!authors_cover_media_id_fkey(id, secure_url, alt_text)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }
    throw error;
  }

  return NextResponse.json({ author: data });
}

async function handlePut(
  request: NextRequest,
  context?: { params?: Promise<{ id: string }> }
) {
  const params = context?.params || Promise.resolve({ id: '' });
  const { id } = await params;
  const body = await request.json();

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('authors')
    .update({
      slug: body.slug,
      full_name: body.full_name,
      title: body.title,
      bio: body.bio,
      location: body.location,
      specialties: body.specialties,
      languages: body.languages,
      social_json: body.social_json,
      avatar_media_id: body.avatar_media_id || null,
      cover_media_id: body.cover_media_id || null,
      is_active: body.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({ author: data });
}

async function handleDelete(
  request: NextRequest,
  context?: { params?: Promise<{ id: string }> }
) {
  const params = context?.params || Promise.resolve({ id: '' });
  const { id } = await params;

  const supabase = getSupabaseClient();

  // Soft delete: set is_active to false
  const { data, error } = await supabase
    .from('authors')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({ author: data });
}

export const GET = withErrorHandling(async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
  const params = context?.params || Promise.resolve({ id: '' });
  return handleGet(request, { params });
});

export const PUT = withErrorHandling(async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
  const params = context?.params || Promise.resolve({ id: '' });
  return handlePut(request, { params });
});

export const DELETE = withErrorHandling(async (request: NextRequest, context?: { params?: Promise<{ id: string }> }) => {
  const params = context?.params || Promise.resolve({ id: '' });
  return handleDelete(request, { params });
});
