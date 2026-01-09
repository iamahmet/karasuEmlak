"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Users, Eye, MousePointerClick, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@karasu/lib";

interface AnalyticsOverviewProps {
  dailyMetrics: any[];
  contentMetrics: any[];
  seoMetrics: any[];
}

export function AnalyticsOverview({
  dailyMetrics,
  contentMetrics: _contentMetrics,
  seoMetrics: _seoMetrics,
}: AnalyticsOverviewProps) {
  // Calculate totals from latest metrics
  const latestDaily = dailyMetrics[0] || {};
  const previousDaily = dailyMetrics[1] || {};

  const totalSessions = dailyMetrics.reduce((sum, m) => sum + (m.sessions || 0), 0);
  const totalPageViews = dailyMetrics.reduce((sum, m) => sum + (m.page_views || 0), 0);
  const totalClicks = dailyMetrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const avgBounceRate = dailyMetrics.length > 0
    ? dailyMetrics.reduce((sum, m) => sum + (m.bounce_rate || 0), 0) / dailyMetrics.length
    : 0;

  // Calculate trends
  const sessionsTrend = previousDaily.sessions
    ? ((latestDaily.sessions || 0) - previousDaily.sessions) / previousDaily.sessions * 100
    : 0;
  const pageViewsTrend = previousDaily.page_views
    ? ((latestDaily.page_views || 0) - previousDaily.page_views) / previousDaily.page_views * 100
    : 0;
  const clicksTrend = previousDaily.clicks
    ? ((latestDaily.clicks || 0) - previousDaily.clicks) / previousDaily.clicks * 100
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="card-professional hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
          <CardTitle className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">
            Oturumlar
          </CardTitle>
          <Users className="h-4 w-4 text-design-light" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-3xl font-display font-bold text-design-dark dark:text-white mb-2">
            {totalSessions.toLocaleString("tr-TR")}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-design-gray dark:text-gray-400">
              Bugün: {latestDaily.sessions || 0}
            </p>
            {sessionsTrend !== 0 && (
              <span className={cn(
                "text-xs font-semibold flex items-center gap-1",
                sessionsTrend > 0 ? "text-green-600" : "text-red-600"
              )}>
                {sessionsTrend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(sessionsTrend).toFixed(1)}%
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="card-professional hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
          <CardTitle className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">
            Sayfa Görüntülemeleri
          </CardTitle>
          <Eye className="h-4 w-4 text-design-light" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-3xl font-display font-bold text-design-dark dark:text-white mb-2">
            {totalPageViews.toLocaleString("tr-TR")}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-design-gray dark:text-gray-400">
              Bugün: {latestDaily.page_views || 0}
            </p>
            {pageViewsTrend !== 0 && (
              <span className={cn(
                "text-xs font-semibold flex items-center gap-1",
                pageViewsTrend > 0 ? "text-green-600" : "text-red-600"
              )}>
                {pageViewsTrend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(pageViewsTrend).toFixed(1)}%
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="card-professional hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
          <CardTitle className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">
            Tıklamalar
          </CardTitle>
          <MousePointerClick className="h-4 w-4 text-design-light" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-3xl font-display font-bold text-design-dark dark:text-white mb-2">
            {totalClicks.toLocaleString("tr-TR")}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-design-gray dark:text-gray-400">
              Bugün: {latestDaily.clicks || 0}
            </p>
            {clicksTrend !== 0 && (
              <span className={cn(
                "text-xs font-semibold flex items-center gap-1",
                clicksTrend > 0 ? "text-green-600" : "text-red-600"
              )}>
                {clicksTrend > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(clicksTrend).toFixed(1)}%
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="card-professional hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-5 pt-5">
          <CardTitle className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400 uppercase tracking-wider">
            Bounce Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-design-light" />
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="text-3xl font-display font-bold text-design-dark dark:text-white mb-2">
            {avgBounceRate.toFixed(1)}%
          </div>
          <p className="text-xs text-design-gray dark:text-gray-400">
            Ortalama (30 gün)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

