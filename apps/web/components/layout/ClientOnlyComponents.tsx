'use client';

import dynamic from 'next/dynamic';
import { ScrollLockReset } from '@/components/layout/ScrollLockReset';

interface ClientOnlyComponentsProps {
  basePath?: string;
}

export function ClientOnlyComponents({ basePath = '' }: ClientOnlyComponentsProps) {
  const pwaDisabled = process.env.NEXT_PUBLIC_DISABLE_PWA === '1';
  const analyticsDisabled = process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === '1';

  const WhatsAppButton = dynamic(() => import("@/components/layout/WhatsAppButton").then(mod => ({ default: mod.WhatsAppButton })), {
    ssr: false,
  });

  const CookieConsent = dynamic(() => import("@/components/compliance/CookieConsent").then(mod => ({ default: mod.CookieConsent })), {
    ssr: false,
  });

  const ComparisonBar = dynamic(() => import("@/components/comparison/ComparisonBar").then(mod => ({ default: mod.ComparisonBar })), {
    ssr: false,
  });

  const ExitIntentPopup = dynamic(() => import("@/components/conversion/ExitIntentPopup").then(mod => ({ default: mod.default })), {
    ssr: false,
  });

  const MobileStickyCTA = dynamic(() => import("@/components/conversion/MobileStickyCTA").then(mod => ({ default: mod.default })), {
    ssr: false,
  });

  const BackToTop = dynamic(() => import("@/components/ui/BackToTop").then(mod => ({ default: mod.default })), {
    ssr: false,
  });

  const RoutePrefetcher = analyticsDisabled
    ? null
    : dynamic(() => import("@/components/performance/RoutePrefetcher").then(mod => ({ default: mod.RoutePrefetcher })), {
        ssr: false,
      });

  const EnhancedPerformanceMonitor = analyticsDisabled
    ? null
    : dynamic(() => import("@/components/performance/EnhancedPerformanceMonitor").then(mod => ({ default: mod.EnhancedPerformanceMonitor })), {
        ssr: false,
      });

  const AccessibilityEnhancer = dynamic(() => import("@/components/accessibility/AccessibilityEnhancer").then(mod => ({ default: mod.AccessibilityEnhancer })), {
    ssr: false,
  });

  const PWAInstallPrompt = pwaDisabled
    ? null
    : dynamic(() => import("@/components/pwa/PWAInstallPrompt").then(mod => ({ default: mod.PWAInstallPrompt })), {
        ssr: false,
      });

  const BackgroundSyncInit = pwaDisabled
    ? null
    : dynamic(() => import("@/components/pwa/BackgroundSyncInit").then(mod => ({ default: mod.BackgroundSyncInit })), {
        ssr: false,
      });

  return (
    <>
      <ScrollLockReset />
      {RoutePrefetcher && <RoutePrefetcher />}
      {EnhancedPerformanceMonitor && <EnhancedPerformanceMonitor />}
      <AccessibilityEnhancer />
      <CookieConsent />
      <ComparisonBar basePath={basePath} />
      <WhatsAppButton />
      <ExitIntentPopup />
      <MobileStickyCTA />
      <BackToTop />
      {PWAInstallPrompt && <PWAInstallPrompt />}
      {BackgroundSyncInit && <BackgroundSyncInit />}
    </>
  );
}
