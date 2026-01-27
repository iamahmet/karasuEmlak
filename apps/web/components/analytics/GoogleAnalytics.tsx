"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { safeJsonParse } from "@/lib/utils/safeJsonParse";

interface GoogleAnalyticsProps {
  measurementId?: string;
  nonce?: string;
}

/**
 * Google Analytics 4 Component
 * Only loads if analytics cookies are allowed (KVKK/GDPR compliant)
 * 
 * Note: Nonce should be passed from server component parent
 */
export function GoogleAnalytics({ measurementId, nonce }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;

    // Check if analytics cookies are allowed
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) return;

    const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
      context: 'cookie-consent',
      dedupeKey: 'cookie-consent',
    });
    if (!consent.analytics) return;
    setCanLoad(true);
  }, [measurementId]);

  useEffect(() => {
    if (!canLoad || !measurementId || typeof window === "undefined") return;
    if (window.gtag) {
      window.gtag("config", measurementId, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
      });
    }
  }, [pathname, searchParams, measurementId, canLoad]);

  if (!measurementId || !canLoad) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        nonce={nonce}
        onLoad={() => {
          // Initialize gtag function
          if (typeof window !== "undefined" && !window.gtag) {
            window.dataLayer = window.dataLayer || [];
            window.gtag = function (...args: any[]) {
              if (window.dataLayer) {
                window.dataLayer.push(args);
              }
            };
            window.gtag("js", new Date());
            window.gtag("config", measurementId, {
              page_path: window.location.pathname,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
            });
          }
        }}
      />
    </>
  );
}

/**
 * Track custom event
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window === "undefined" || !window.gtag) return;

  // Check cookie consent
  const cookieConsent = localStorage.getItem("cookie-consent");
  if (!cookieConsent) return;

  const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
    context: 'cookie-consent',
    dedupeKey: 'cookie-consent',
  });
  if (!consent.analytics) return;

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined" || !window.gtag) return;

  // Check cookie consent
  const cookieConsent = localStorage.getItem("cookie-consent");
  if (!cookieConsent) return;

  const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
    context: 'cookie-consent',
    dedupeKey: 'cookie-consent',
  });
  if (!consent.analytics) return;

  window.gtag("event", "page_view", {
    page_path: path,
    page_title: title,
  });
}

// Type declarations
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

