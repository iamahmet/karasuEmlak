'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import {
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
  requestNotificationPermission,
} from '@/lib/pwa/push-notifications';
import { toast } from 'sonner';
import { cn } from '@karasu/lib';

interface PushNotificationButtonProps {
  userId?: string;
  email?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PushNotificationButton({
  userId,
  email,
  variant = 'outline',
  size = 'default',
  className,
}: PushNotificationButtonProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if push notifications are supported
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      // Check current permission
      setPermission(Notification.permission);

      // Check if already subscribed
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const subscribed = await isSubscribedToPushNotifications();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleToggle = async () => {
    if (!isSupported) {
      toast.error('Push bildirimleri bu tarayıcıda desteklenmiyor');
      return;
    }

    setIsLoading(true);

    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await unsubscribeFromPushNotifications(userId, email);
        if (success) {
          setIsSubscribed(false);
          toast.success('Push bildirimleri kapatıldı');
        } else {
          toast.error('Bildirimler kapatılamadı');
        }
      } else {
        // Check permission first
        const currentPermission = await requestNotificationPermission();
        setPermission(currentPermission);

        if (currentPermission !== 'granted') {
          toast.error('Bildirim izni verilmedi');
          setIsLoading(false);
          return;
        }

        // Subscribe
        const subscription = await subscribeToPushNotifications(userId, email);
        if (subscription) {
          setIsSubscribed(true);
          toast.success('Push bildirimleri aktifleştirildi!', {
            description: 'Yeni ilanlar ve fiyat değişiklikleri için bildirim alacaksınız.',
          });
        } else {
          toast.error('Bildirimler aktifleştirilemedi');
        }
      }
    } catch (error: any) {
      console.error('Error toggling push notifications:', error);
      toast.error('Bir hata oluştu', {
        description: error.message || 'Lütfen tekrar deneyin.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading || permission === 'denied'}
      variant={variant}
      size={size}
      className={cn(className)}
      title={
        permission === 'denied'
          ? 'Bildirim izni tarayıcı ayarlarından verilmelidir'
          : isSubscribed
          ? 'Push bildirimlerini kapat'
          : 'Push bildirimlerini aç'
      }
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSubscribed ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      {size !== 'icon' && (
        <span className="ml-2">
          {isSubscribed ? 'Bildirimler Açık' : 'Bildirimleri Aç'}
        </span>
      )}
    </Button>
  );
}
