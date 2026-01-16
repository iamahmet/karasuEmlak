'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineStatus } from '@/lib/mobile/offline-support';
import { cn } from '@karasu/lib';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, wasOffline } = useOfflineStatus();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowMessage(true);
    } else if (wasOffline && isOnline) {
      // Show "back online" message briefly
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowMessage(false);
    }
  }, [isOnline, wasOffline]);

  if (!showMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-[100] px-4 py-3',
          isOnline
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white',
          className
        )}
      >
        <div className="container mx-auto flex items-center gap-3">
          {isOnline ? (
            <>
              <Wifi className="h-5 w-5" />
              <span className="text-sm font-medium">
                İnternet bağlantısı yeniden kuruldu
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5" />
              <span className="text-sm font-medium">
                İnternet bağlantısı yok. Çevrimdışı modda çalışıyorsunuz.
              </span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
