"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@karasu/lib";

interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

interface StatsChartProps {
  title?: string;
  type?: "articles" | "views" | "users" | "comments";
  days?: number;
  className?: string;
}

export function StatsChart({ 
  title = "İstatistik Grafiği", 
  type = "articles",
  days = 7,
  className 
}: StatsChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const [trendPercentage, setTrendPercentage] = useState(0);

  useEffect(() => {
    fetchChartData();
  }, [type, days]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let chartData: ChartDataPoint[] = [];

      if (type === "articles") {
        const { data: articles } = await supabase
          .from("articles")
          .select("created_at")
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());

        // Group by date
        const grouped = (articles || []).reduce((acc: Record<string, number>, article: any) => {
          const date = new Date(article.created_at).toLocaleDateString("tr-TR", { 
            day: "2-digit", 
            month: "2-digit" 
          });
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});

        chartData = Object.entries(grouped).map(([date, value]) => ({
          date,
          value: value as number,
          label: date,
        }));
      } else if (type === "views") {
        const { data: articles } = await supabase
          .from("articles")
          .select("views, updated_at")
          .gte("updated_at", startDate.toISOString())
          .lte("updated_at", endDate.toISOString());

        // Group by date
        const grouped = (articles || []).reduce((acc: Record<string, number>, article: any) => {
          const date = new Date(article.updated_at).toLocaleDateString("tr-TR", { 
            day: "2-digit", 
            month: "2-digit" 
          });
          acc[date] = (acc[date] || 0) + (article.views || 0);
          return acc;
        }, {});

        chartData = Object.entries(grouped).map(([date, value]) => ({
          date,
          value: value as number,
          label: date,
        }));
      }

      // Fill missing dates with 0
      const allDates: string[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        allDates.push(date.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit" }));
      }

      const filledData = allDates.map((date) => {
        const existing = chartData.find((d) => d.date === date);
        return existing || { date, value: 0, label: date };
      });

      setData(filledData);

      // Calculate trend
      if (filledData.length >= 2) {
        const firstHalf = filledData.slice(0, Math.floor(filledData.length / 2));
        const secondHalf = filledData.slice(Math.floor(filledData.length / 2));
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.value, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.value, 0) / secondHalf.length;
        
        if (firstAvg === 0) {
          setTrend("stable");
          setTrendPercentage(0);
        } else {
          const change = ((secondAvg - firstAvg) / firstAvg) * 100;
          setTrend(change > 5 ? "up" : change < -5 ? "down" : "stable");
          setTrendPercentage(Math.abs(change));
        }
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (loading) {
    return (
      <Card className={cn("card-professional bg-white dark:bg-[#0a3d35] relative overflow-hidden", className)}>
        <CardHeader className="pb-4 px-5 pt-5 relative z-10">
          <CardTitle className="text-lg md:text-xl font-display font-bold text-design-dark dark:text-white">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 relative z-10">
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-design-light"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("card-professional bg-white dark:bg-[#0a3d35] relative overflow-hidden", className)}>
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-design-light/5 to-transparent rounded-full blur-3xl"></div>
      <CardHeader className="pb-4 px-5 pt-5 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg md:text-xl font-display font-bold text-design-dark dark:text-white flex items-center gap-3">
            <span className="w-1 h-6 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full shadow-lg"></span>
            {title}
          </CardTitle>
          {trend !== "stable" && (
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold",
              trend === "up" 
                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            )}>
              {trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {trendPercentage.toFixed(1)}%
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 relative z-10">
        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-design-gray dark:text-gray-400">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Veri bulunamadı</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-64 flex items-end justify-between gap-1">
              {data.map((point, index) => {
                const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full flex items-end justify-center h-full">
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-80",
                          "bg-gradient-to-t from-design-light via-design-light/90 to-design-light/70",
                          "hover:from-design-light hover:via-design-light hover:to-design-light/90",
                          "shadow-sm hover:shadow-md"
                        )}
                        style={{ height: `${height}%`, minHeight: point.value > 0 ? "4px" : "0" }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent rounded-t-lg"></div>
                      </div>
                      {point.value > 0 && (
                        <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-design-dark dark:bg-design-light text-white dark:text-design-dark text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                          {point.value}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-design-gray dark:text-gray-400 font-medium">
                      {point.date.split(".")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-design-gray dark:text-gray-400 pt-2 border-t border-[#E7E7E7]/50 dark:border-[#062F28]/50">
              <span>Toplam: {data.reduce((sum, d) => sum + d.value, 0).toLocaleString("tr-TR")}</span>
              <span>Ortalama: {Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length).toLocaleString("tr-TR")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
