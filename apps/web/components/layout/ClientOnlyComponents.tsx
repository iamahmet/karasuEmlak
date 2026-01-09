'use client';

import dynamic from 'next/dynamic';

// Client-only components that need ssr: false
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

const PWAInstallPrompt = dynamic(() => import("@/components/pwa/PWAInstallPrompt").then(mod => ({ default: mod.PWAInstallPrompt })), {
  ssr: false,
});

const BackgroundSyncInit = dynamic(() => import("@/components/pwa/BackgroundSyncInit").then(mod => ({ default: mod.BackgroundSyncInit })), {
  ssr: false,
});

const RoutePrefetcher = dynamic(() => import("@/components/performance/RoutePrefetcher").then(mod => ({ default: mod.RoutePrefetcher })), {
  ssr: false,
});

const EnhancedPerformanceMonitor = dynamic(() => import("@/components/performance/EnhancedPerformanceMonitor").then(mod => ({ default: mod.EnhancedPerformanceMonitor })), {
  ssr: false,
});

const AccessibilityEnhancer = dynamic(() => import("@/components/accessibility/AccessibilityEnhancer").then(mod => ({ default: mod.AccessibilityEnhancer })), {
  ssr: false,
});

interface ClientOnlyComponentsProps {
  basePath?: string;
}

export function ClientOnlyComponents({ basePath = '' }: ClientOnlyComponentsProps) {
  return (
    <>
      <RoutePrefetcher />
      <EnhancedPerformanceMonitor />
      <AccessibilityEnhancer />
      <CookieConsent />
      <ComparisonBar basePath={basePath} />
      <WhatsAppButton />
      <ExitIntentPopup />
      <MobileStickyCTA />
      <BackToTop />
      <PWAInstallPrompt />
      <BackgroundSyncInit />
    </>
  );
}
