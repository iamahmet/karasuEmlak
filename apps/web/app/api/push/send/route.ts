import { NextRequest, NextResponse } from 'next/server';
import { sendPushNotificationToUser, sendPushNotificationBroadcast } from '@/lib/pwa/send-push-notification';
import { withRateLimit } from '@/lib/security/rate-limit';

/**
 * Send Push Notification API
 * POST /api/push/send
 * Sends push notification to a user or broadcasts to all users
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 10 requests per minute per IP
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'push-send',
    limit: 10,
    window: '1 m',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await request.json();
    const { userId, email, broadcast, payload } = body;

    // Validation
    if (!payload || !payload.title || !payload.body) {
      return NextResponse.json(
        { success: false, error: 'Payload with title and body is required' },
        { status: 400 }
      );
    }

    // Check if broadcast
    if (broadcast) {
      const result = await sendPushNotificationBroadcast(payload);
      return NextResponse.json({
        ...result,
        success: result.success > 0,
      });
    }

    // Send to specific user
    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    const result = await sendPushNotificationToUser(userId || null, email || null, payload);

    return NextResponse.json({
      ...result,
      success: result.success > 0,
    });
  } catch (error: any) {
    console.error('Push send API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
