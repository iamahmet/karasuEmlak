import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';
import { createClient } from '@supabase/supabase-js';

/**
 * Create Price Alert API
 * POST /api/alerts/create
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per hour per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'price-alert-create',
    limit: 5,
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

    // Validate filters
    if (!filters.min_price && !filters.max_price && !filters.property_type && !filters.location) {
      return NextResponse.json(
        { success: false, error: 'En az bir filtre kriteri belirtmelisiniz' },
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

    // Check if similar alert already exists
    const { data: existing } = await supabase
      .from('price_alerts')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .single();

    if (existing) {
      // Update existing alert
      const { data: updated, error: updateError } = await supabase
        .from('price_alerts')
        .update({
          filters,
          frequency,
          email_notifications,
          push_notifications,
          name: name || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: 'Fiyat uyarınız güncellendi',
        data: updated,
      });
    }

    // Create new alert
    const { data: newAlert, error } = await supabase
      .from('price_alerts')
      .insert({
        user_id,
        email: email.toLowerCase(),
        name: name || null,
        filters,
        status: 'active',
        frequency,
        email_notifications,
        push_notifications,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating price alert:', error);
      return NextResponse.json(
        { success: false, error: 'Fiyat uyarısı oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fiyat uyarısı başarıyla oluşturuldu',
      data: newAlert,
    });
  } catch (error: any) {
    console.error('Price alert API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
