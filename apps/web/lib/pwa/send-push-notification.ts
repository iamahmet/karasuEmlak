/**
 * Send Push Notification Utility
 * Server-side function to send push notifications to subscribed users
 */

import webpush from 'web-push';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { brandAssetUrl } from '@/lib/branding/assets';

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, any>;
}

/**
 * Initialize web-push with VAPID keys
 */
function initializeWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local');
  }

  webpush.setVapidDetails(
    'mailto:info@karasuemlak.net', // Contact email
    publicKey,
    privateKey
  );
}

/**
 * Send push notification to a specific subscription
 */
export async function sendPushNotification(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    initializeWebPush();

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || brandAssetUrl('/logo-icon.svg'),
      badge: payload.badge || brandAssetUrl('/logo-icon.svg'),
      tag: payload.tag || 'karasu-emlak-notification',
      requireInteraction: payload.requireInteraction || false,
      data: {
        url: payload.url || '/',
        ...payload.data,
      },
    });

    await webpush.sendNotification(pushSubscription, notificationPayload);

    return { success: true };
  } catch (error: any) {
    console.error('Error sending push notification:', error);
    
    // Handle expired/invalid subscription
    if (error.statusCode === 410 || error.statusCode === 404) {
      return {
        success: false,
        error: 'Subscription expired or invalid',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to send push notification',
    };
  }
}

/**
 * Send push notification to all subscriptions for a user
 */
export async function sendPushNotificationToUser(
  userId: string | null,
  email: string | null,
  payload: PushNotificationPayload
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    const supabase = createServiceClient();

    // Build query
    let query = supabase.from('push_subscriptions').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('email', email.toLowerCase());
    } else {
      return { success: 0, failed: 0, errors: ['User ID or email required'] };
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      console.error('Error fetching push subscriptions:', error);
      return { success: 0, failed: 0, errors: [error.message] };
    }

    if (!subscriptions || subscriptions.length === 0) {
      return { success: 0, failed: 0, errors: ['No subscriptions found'] };
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send to all subscriptions
    for (const subscription of subscriptions) {
      const result = await sendPushNotification(
        subscription.subscription_data as any,
        payload
      );

      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push(`${subscription.id}: ${result.error}`);

        // Remove invalid subscription
        if (result.error?.includes('expired') || result.error?.includes('invalid')) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('id', subscription.id);
        }
      }
    }

    return { success, failed, errors };
  } catch (error: any) {
    console.error('Error sending push notifications to user:', error);
    return {
      success: 0,
      failed: 0,
      errors: [error.message || 'Failed to send push notifications'],
    };
  }
}

/**
 * Send push notification to all active subscriptions (broadcast)
 */
export async function sendPushNotificationBroadcast(
  payload: PushNotificationPayload,
  limit = 1000
): Promise<{ success: number; failed: number; errors: string[] }> {
  try {
    const supabase = createServiceClient();

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching push subscriptions:', error);
      return { success: 0, failed: 0, errors: [error.message] };
    }

    if (!subscriptions || subscriptions.length === 0) {
      return { success: 0, failed: 0, errors: ['No subscriptions found'] };
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Send to all subscriptions (in batches to avoid overwhelming)
    const batchSize = 10;
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (subscription) => {
          const result = await sendPushNotification(
            subscription.subscription_data as any,
            payload
          );

          if (result.success) {
            success++;
          } else {
            failed++;
            errors.push(`${subscription.id}: ${result.error}`);

            // Remove invalid subscription
            if (result.error?.includes('expired') || result.error?.includes('invalid')) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('id', subscription.id);
            }
          }
        })
      );

      // Small delay between batches
      if (i + batchSize < subscriptions.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return { success, failed, errors };
  } catch (error: any) {
    console.error('Error sending broadcast push notifications:', error);
    return {
      success: 0,
      failed: 0,
      errors: [error.message || 'Failed to send broadcast push notifications'],
    };
  }
}
