/**
 * Analytics Dashboard
 * Big data aggregates, metrics, and visualizations
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";

export default async function AnalyticsDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ period?: string; start?: string; end?: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  const { period = "7d", start: _start, end: _end } = await searchParams;
  
  // Development mode: Skip auth check
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "analytics" });

  const supabase = await createClient();

  // Get daily metrics
  const { data: dailyMetrics } = await supabase
    .from("daily_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  // Get content metrics
  const { data: contentMetrics } = await supabase
    .from("content_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  // Get SEO metrics
  const { data: seoMetrics } = await supabase
    .from("seo_metrics")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("dashboard.title")}
          </h1>
          <p className="admin-page-description">
            {t("dashboard.description") || "Site performans metrikleri ve analitik veriler"}
          </p>
        </div>
      </div>

      <AnalyticsOverview
        dailyMetrics={dailyMetrics || []}
        contentMetrics={contentMetrics || []}
        seoMetrics={seoMetrics || []}
      />

      <AnalyticsCharts
        dailyMetrics={dailyMetrics || []}
        contentMetrics={contentMetrics || []}
        period={period}
      />
    </div>
  );
}

