import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';

/**
 * Unsubscribe from Push Notifications API
 * POST /api/push/unsubscribe
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per hour per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'push-unsubscribe',
    limit: 10,
    window: '1 h',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await request.json();
    const { userId, email, endpoint } = body;

    if (!email && !userId && !endpoint) {
      return NextResponse.json(
        { success: false, error: 'E-posta, kullanıcı ID veya endpoint gereklidir' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Build query
    let query = supabase.from('push_subscriptions').delete();

    if (endpoint) {
      query = query.eq('endpoint', endpoint);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    }

    const { error } = await query;

    if (error) {
      console.error('Error removing push subscription:', error);
      return NextResponse.json(
        { success: false, error: 'Push aboneliği kaldırılamadı' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Push bildirimleri kapatıldı',
    });
  } catch (error: any) {
    console.error('Push unsubscribe API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
