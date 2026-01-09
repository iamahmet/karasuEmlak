/**
 * Create Listing API
 * Handles listing submissions from users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { generateSlug } from '@/lib/utils';
import { withRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  // Rate limiting: 3 listings per 24 hours per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'listing-create',
    limit: 3,
    window: '24 h',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }
  try {
    const body = await request.json();
    const {
      title,
      status,
      property_type,
      location_city,
      location_district,
      location_neighborhood,
      location_full_address,
      coordinates_lat,
      coordinates_lng,
      price_amount,
      price_currency = 'TRY',
      features,
      description_short,
      description_long,
      images,
      agent_name,
      agent_phone,
      agent_email,
      agent_whatsapp,
    } = body;

    // Validation
    if (!title || !status || !property_type || !location_neighborhood) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = generateSlug(title);
    const supabase = createServiceClient();

    // Check if slug exists, append number if needed
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const { data: existing } = await supabase
        .from('listings')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Prepare listing data
    const listingData = {
      title,
      slug,
      status,
      property_type,
      location_city: location_city || 'Karasu',
      location_district: location_district || 'Karasu',
      location_neighborhood,
      location_full_address,
      coordinates_lat: coordinates_lat || null,
      coordinates_lng: coordinates_lng || null,
      price_amount: price_amount || null,
      price_currency,
      features: features || {},
      description_short,
      description_long,
      images: images || [],
      agent_name: agent_name || null,
      agent_phone: agent_phone || null,
      agent_email: agent_email || null,
      agent_whatsapp: agent_whatsapp || null,
      available: true,
      published: false, // User submissions need admin approval
      featured: false,
    };

    // Insert listing
    const { data, error } = await supabase
      .from('listings')
      .insert(listingData)
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      return NextResponse.json(
        { error: 'İlan oluşturulurken bir hata oluştu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      listing: data,
      message: 'İlanınız başarıyla gönderildi. Onaylandıktan sonra yayınlanacaktır.',
    });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

