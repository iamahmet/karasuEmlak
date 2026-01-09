import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';

/**
 * Subscribe to Push Notifications API
 * POST /api/push/subscribe
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 5 requests per hour per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'push-subscribe',
    limit: 5,
    window: '1 h',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await request.json();
    const { subscription, userId, email } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: 'Push subscription gereklidir' },
        { status: 400 }
      );
    }

    if (!email && !userId) {
      return NextResponse.json(
        { success: false, error: 'E-posta veya kullanıcı ID gereklidir' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('push_subscriptions')
      .select('id')
      .eq('endpoint', subscription.endpoint)
      .maybeSingle();

    if (existing) {
      // Update existing subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .update({
          user_id: userId || null,
          email: email || null,
          subscription_data: subscription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Push aboneliği güncellendi',
      });
    }

    // Create new subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        user_id: userId || null,
        email: email || null,
        endpoint: subscription.endpoint,
        subscription_data: subscription,
      });

    if (error) {
      console.error('Error creating push subscription:', error);
      return NextResponse.json(
        { success: false, error: 'Push aboneliği oluşturulamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Push bildirimleri aktifleştirildi',
    });
  } catch (error: any) {
    console.error('Push subscription API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
