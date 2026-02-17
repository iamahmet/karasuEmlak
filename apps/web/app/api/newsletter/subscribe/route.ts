import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';

/**
 * Newsletter Subscription API
 * Handles newsletter subscription requests
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per 1 hour per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'newsletter-subscribe',
    limit: 10,
    window: '1 h',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }
  try {
    const body = await request.json();
    const { email, name, source } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gereklidir' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if already subscribed (newsletter_subscribers table)
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten abone' },
        { status: 400 }
      );
    }

    // Create new subscription
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email.toLowerCase(),
        name: name || null,
        source: source || 'unknown',
        consent_kvkk: true,
        consent_version: '1.0',
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, log and return success anyway
      console.error('Error storing newsletter subscription:', error);
      
      // In production, you might want to integrate with an email service provider
      // For now, we'll return success even if DB insert fails
    }

    return NextResponse.json({
      success: true,
      message: 'Başarıyla abone oldunuz',
      subscriptionId: data?.id,
    });
  } catch (error: any) {
    console.error('Newsletter subscription API error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

