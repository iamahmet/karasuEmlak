import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';
import { createClient } from '@supabase/supabase-js';

/**
 * Create Saved Search API
 * POST /api/searches/create
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per hour per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'saved-search-create',
    limit: 10,
    window: '1 h',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await request.json();
    const { email, name, filters, frequency = 'daily', email_notifications = true, push_notifications = false } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'E-posta adresi gereklidir' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Arama adı gereklidir' },
        { status: 400 }
      );
    }

    if (!filters || typeof filters !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Filtreler gereklidir' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir e-posta adresi giriniz' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get user_id if authenticated
    let user_id: string | null = null;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ).auth.getUser(token);
        if (user) {
          user_id = user.id;
        }
      }
    } catch {
      // Not authenticated, continue with email only
    }

    // Create new saved search
    const { data: newSearch, error } = await supabase
      .from('saved_searches')
      .insert({
        user_id,
        email: email.toLowerCase(),
        name,
        filters,
        frequency,
        email_notifications,
        push_notifications,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating saved search:', error);
      return NextResponse.json(
        { success: false, error: 'Kayıtlı arama oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kayıtlı arama başarıyla oluşturuldu',
      data: newSearch,
    });
  } catch (error: any) {
    console.error('Saved search API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
