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

async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isActive = searchParams.get('is_active');

  const supabase = getSupabaseClient();

  let query = supabase
    .from('authors')
    .select(`
      *,
      avatar:media_assets!authors_avatar_media_id_fkey(id, secure_url, alt_text),
      cover:media_assets!authors_cover_media_id_fkey(id, secure_url, alt_text)
    `)
    .order('full_name', { ascending: true });

  if (isActive !== null) {
    query = query.eq('is_active', isActive === 'true');
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return NextResponse.json({ authors: data || [] });
}

async function handlePost(request: NextRequest) {
  const body = await request.json();

  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('authors')
    .insert({
      slug: body.slug,
      full_name: body.full_name,
      title: body.title,
      bio: body.bio,
      location: body.location,
      specialties: body.specialties || [],
      languages: body.languages || ['tr'],
      social_json: body.social_json || {},
      avatar_media_id: body.avatar_media_id || null,
      cover_media_id: body.cover_media_id || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return NextResponse.json({ author: data }, { status: 201 });
}

export const GET = withErrorHandling(handleGet);
export const POST = withErrorHandling(handlePost);
