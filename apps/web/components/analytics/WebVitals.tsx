"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onLCP, onTTFB, onINP, Metric } from "web-vitals";

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
          try {
            const consent = JSON.parse(cookieConsent);
            if (consent.analytics) {
              window.gtag("event", metric.name, {
                event_category: "Web Vitals",
                value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
                event_label: metric.id,
                non_interaction: true,
              });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      // Send to custom endpoint if provided
      if (onReport) {
        onReport(metric);
      }

      // Send to Supabase for performance tracking (optional)
      if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_URL) {
        fetch("/api/analytics/web-vitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id,
            rating: metric.rating,
            delta: metric.delta,
            navigationType: metric.navigationType,
          }),
        }).catch((error) => {
          // Silently fail - don't break the app if analytics fails
          if (process.env.NODE_ENV === "development") {
            console.warn("[Web Vitals] Failed to send metric:", error);
          }
        });
      }
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

