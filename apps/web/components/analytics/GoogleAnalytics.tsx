"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

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

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;

    // Check if analytics cookies are allowed
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) return;

    try {
      const consent = JSON.parse(cookieConsent);
      if (!consent.analytics) return;
    } catch {
      return;
    }

    // Track page view
    if (window.gtag) {
      window.gtag("config", measurementId, {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
      });
    }
  }, [pathname, searchParams, measurementId]);

  if (!measurementId) return null;

  return (
    <>
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            // Check cookie consent before loading GA4
            (function() {
              const cookieConsent = localStorage.getItem('cookie-consent');
              if (!cookieConsent) return;
              
              try {
                const consent = JSON.parse(cookieConsent);
                if (!consent.analytics) return;
              } catch {
                return;
              }

              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}', {
                page_path: window.location.pathname,
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false,
              });
            })();
          `,
        }}
      />
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

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

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

  try {
    const consent = JSON.parse(cookieConsent);
    if (!consent.analytics) return;
  } catch {
    return;
  }

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

