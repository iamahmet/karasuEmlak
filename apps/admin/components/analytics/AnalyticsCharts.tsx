"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, Download, TrendingUp, TrendingDown } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface AnalyticsChartsProps {
  dailyMetrics: any[];
  contentMetrics: any[];
  period: string;
}

export function AnalyticsCharts({ dailyMetrics, contentMetrics, period }: AnalyticsChartsProps) {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  // Prepare chart data
  const chartData = dailyMetrics.slice(0, 30).reverse().map((metric) => ({
    date: new Date(metric.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
    sessions: metric.sessions || 0,
    pageViews: metric.page_views || 0,
    clicks: metric.clicks || 0,
    bounceRate: metric.bounce_rate || 0,
  }));

  // Calculate trends
  const sessionsTrend = dailyMetrics.length >= 2
    ? ((dailyMetrics[0]?.sessions || 0) - (dailyMetrics[1]?.sessions || 0)) / (dailyMetrics[1]?.sessions || 1) * 100
    : 0;
  const pageViewsTrend = dailyMetrics.length >= 2
    ? ((dailyMetrics[0]?.page_views || 0) - (dailyMetrics[1]?.page_views || 0)) / (dailyMetrics[1]?.page_views || 1) * 100
    : 0;

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    router.push(`?period=${value}`);
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-design-light" />
              Zaman Aralığı
            </CardTitle>
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Son 7 Gün</SelectItem>
                <SelectItem value="30d">Son 30 Gün</SelectItem>
                <SelectItem value="90d">Son 90 Gün</SelectItem>
                <SelectItem value="1y">Son 1 Yıl</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Sessions & Page Views Combined Chart */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
              Oturumlar ve Sayfa Görüntülemeleri
            </CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-design-light"></div>
                <span className="text-design-gray dark:text-gray-400">Oturumlar</span>
                {sessionsTrend !== 0 && (
                  <span className={`flex items-center gap-1 ${sessionsTrend > 0 ? "text-green-600" : "text-red-600"}`}>
                    {sessionsTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(sessionsTrend).toFixed(1)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-design-gray dark:text-gray-400">Sayfa Görüntülemeleri</span>
                {pageViewsTrend !== 0 && (
                  <span className={`flex items-center gap-1 ${pageViewsTrend > 0 ? "text-green-600" : "text-red-600"}`}>
                    {pageViewsTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(pageViewsTrend).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
              <XAxis dataKey="date" stroke="#7B7B7B" fontSize={12} />
              <YAxis stroke="#7B7B7B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E7E7E7",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#9FE870"
                strokeWidth={2}
                name="Oturumlar"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="pageViews"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Sayfa Görüntülemeleri"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Clicks Chart */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
            Tıklamalar
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
              <XAxis dataKey="date" stroke="#7B7B7B" fontSize={12} />
              <YAxis stroke="#7B7B7B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E7E7E7",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="clicks" fill="#9FE870" name="Tıklamalar" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bounce Rate Chart */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
            Bounce Rate (Zıplama Oranı)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
              <XAxis dataKey="date" stroke="#7B7B7B" fontSize={12} />
              <YAxis stroke="#7B7B7B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E7E7E7",
                  borderRadius: "8px",
                }}
                formatter={(value: number | undefined) => `${(value ?? 0).toFixed(1)}%`}
              />
              <Line
                type="monotone"
                dataKey="bounceRate"
                stroke="#ef4444"
                strokeWidth={2}
                name="Bounce Rate (%)"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Content */}
      <Card className="card-professional">
        <CardHeader className="pb-4 px-5 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white">
              En Popüler İçerikler
            </CardTitle>
            <Button variant="outline" size="sm" className="text-xs">
              <Download className="h-3 w-3 mr-2" />
              Dışa Aktar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {contentMetrics.length === 0 ? (
            <div className="text-center py-12 text-design-gray dark:text-gray-400">
              <p>İçerik metrikleri bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-2">
              {contentMetrics.slice(0, 10).map((metric, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-design-light to-green-600 flex items-center justify-center text-white font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-design-dark dark:text-white truncate">
                        {metric.content_slug || "Bilinmeyen"}
                      </p>
                      <p className="text-xs text-design-gray dark:text-gray-400">
                        {metric.views || 0} görüntülenme • Ortalama {metric.avg_time_on_page || 0}s
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {metric.ctr && (
                      <div className="text-sm font-semibold text-design-dark dark:text-white">
                        {(metric.ctr * 100).toFixed(1)}% CTR
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

