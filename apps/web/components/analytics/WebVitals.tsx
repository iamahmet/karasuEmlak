"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from "web-vitals";
import { reportWebVitalToApi } from "@/lib/analytics/report-web-vital";
import { safeJsonParse } from "@/lib/utils/safeJsonParse";

interface WebVitalsProps {
  onReport?: (metric: Metric) => void;
}

/**
 * Web Vitals Monitoring Component
 * Tracks Core Web Vitals and other performance metrics
 * Always active (necessary for performance monitoring, not tracking)
 */
export function WebVitals({ onReport }: WebVitalsProps) {
  useEffect(() => {
    const reportMetric = (metric: Metric) => {
      // Log to console in development
      if (process.env.NODE_ENV === "development") {
        console.log("[Web Vitals]", metric.name, metric.value, metric.id);
      }

      // Send to analytics if consent given
      if (typeof window !== "undefined" && window.gtag) {
        const cookieConsent = localStorage.getItem("cookie-consent");
        if (cookieConsent) {
          const consent = safeJsonParse(cookieConsent, { analytics: false, marketing: false, necessary: true }, {
            context: 'cookie-consent',
            dedupeKey: 'cookie-consent',
          });
          if (!consent.analytics) return;
          window.gtag("event", metric.name, {
            event_category: "Web Vitals",
            value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
            event_label: metric.id,
            non_interaction: true,
          });
        }
      }

      // Send to custom endpoint if provided
      if (onReport) {
        onReport(metric);
      }

      reportWebVitalToApi({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        rating: metric.rating,
        delta: metric.delta,
        navigationType: metric.navigationType,
      });
    };

    // Track Core Web Vitals
    // Note: onFID is deprecated in web-vitals v5+, replaced by onINP
    onCLS(reportMetric);
    onFCP(reportMetric);
    onLCP(reportMetric);
    onTTFB(reportMetric);
    onINP(reportMetric); // Replaces onFID (Interaction to Next Paint)
  }, [onReport]);

  return null;
}

