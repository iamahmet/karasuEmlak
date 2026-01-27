"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Badge } from "@karasu/ui";
import { Button } from "@karasu/ui";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  MessageSquare,
  Phone,
  Calendar,
  Users,
  Clock,
  Target,
  Zap,
  Loader2,
  ArrowUp,
  ArrowDown,
  Activity
} from "lucide-react";
import { cn } from "@karasu/lib";
import { formatCurrency, formatNumber } from "@karasu/lib/utils";

interface ListingAnalyticsProps {
  listingId: string;
  className?: string;
}

interface AnalyticsData {
  views: {
    total: number;
    unique: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    trend: number;
  };
  engagement: {
    clicks: number;
    inquiries: number;
    calls: number;
    messages: number;
    conversionRate: number;
    trend: number;
  };
  performance: {
    score: number;
    rank: number;
    competitors: number;
    avgTimeOnPage: number;
    bounceRate: number;
  };
  predictions: {
    estimatedViews: number;
    estimatedInquiries: number;
    timeToSell: string;
    confidence: number;
  };
}

export function ListingAnalytics({ listingId, className }: ListingAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    fetchAnalytics();
  }, [listingId, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data - in production, fetch from API
      const mockData: AnalyticsData = {
        views: {
          total: 1247,
          unique: 892,
          today: 23,
          thisWeek: 156,
          thisMonth: 487,
          trend: 12.5,
        },
        engagement: {
          clicks: 342,
          inquiries: 28,
          calls: 15,
          messages: 13,
          conversionRate: 8.2,
          trend: 5.3,
        },
        performance: {
          score: 87,
          rank: 3,
          competitors: 45,
          avgTimeOnPage: 145,
          bounceRate: 32,
        },
        predictions: {
          estimatedViews: 2100,
          estimatedInquiries: 45,
          timeToSell: "18-24 gün",
          confidence: 0.78,
        },
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={cn("card-professional", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-foreground">
          İlan Analitikleri
        </h3>
        <div className="flex items-center gap-2">
          {(["7d", "30d", "90d", "all"] as const).map((range) => (
            <Button
              key={range}
              type="button"
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="h-8 px-3 text-xs"
            >
              {range === "7d" ? "7 Gün" : range === "30d" ? "30 Gün" : range === "90d" ? "90 Gün" : "Tümü"}
            </Button>
          ))}
        </div>
      </div>

      {/* Views Overview */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Görüntülenmeler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-800 dark:text-blue-200">Toplam</span>
                {analytics.views.trend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatNumber(analytics.views.total)}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {analytics.views.trend > 0 ? "+" : ""}{analytics.views.trend}% değişim
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-purple-800 dark:text-purple-200">Benzersiz</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatNumber(analytics.views.unique)}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                {Math.round((analytics.views.unique / analytics.views.total) * 100)}% benzersiz
              </p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-green-800 dark:text-green-200">Bu Hafta</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatNumber(analytics.views.thisWeek)}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {analytics.views.today} bugün
              </p>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-orange-800 dark:text-orange-200">Bu Ay</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {formatNumber(analytics.views.thisMonth)}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                Ortalama: {Math.round(analytics.views.thisMonth / 30)}/gün
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card className="card-professional">
        <CardHeader>
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            Etkileşim Metrikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <MousePointerClick className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">Tıklamalar</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatNumber(analytics.engagement.clicks)}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {Math.round((analytics.engagement.clicks / analytics.views.total) * 100)}% tıklama oranı
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-semibold text-green-900 dark:text-green-100">İletişimler</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatNumber(analytics.engagement.inquiries)}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {analytics.engagement.calls} arama, {analytics.engagement.messages} mesaj
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">Dönüşüm</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {analytics.engagement.conversionRate}%
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                {analytics.engagement.trend > 0 ? "+" : ""}{analytics.engagement.trend}% trend
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-semibold text-orange-900 dark:text-orange-100">Ortalama Süre</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {analytics.performance.avgTimeOnPage}s
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                {analytics.performance.bounceRate}% çıkış oranı
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Score */}
      <Card className="card-professional border-gradient-to-r from-purple-200 to-pink-200">
        <CardHeader>
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Performans Skoru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="transform -rotate-90 w-full h-full">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200 dark:text-gray-800"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45 * (analytics.performance.score / 100)} ${2 * Math.PI * 45}`}
                    className="text-purple-600 dark:text-purple-400 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                      {analytics.performance.score}
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300">/ 100</p>
                  </div>
                </div>
              </div>
              <p className="text-sm font-semibold text-foreground">
                Genel Performans
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                <span className="text-sm text-muted-foreground">Sıralama</span>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  #{analytics.performance.rank} / {analytics.performance.competitors}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                <span className="text-sm text-muted-foreground">Rakip İlan</span>
                <span className="text-sm font-bold text-foreground">
                  {analytics.performance.competitors}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20">
                <span className="text-sm text-muted-foreground">Çıkış Oranı</span>
                <span className={cn(
                  "text-sm font-bold",
                  analytics.performance.bounceRate < 30 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {analytics.performance.bounceRate}%
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-900 dark:text-green-100">Güçlü Yönler</span>
                </div>
                <ul className="text-xs text-green-800 dark:text-green-200 space-y-1">
                  <li>• Yüksek görüntülenme</li>
                  <li>• İyi dönüşüm oranı</li>
                  <li>• Düşük çıkış oranı</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-semibold text-yellow-900 dark:text-yellow-100">İyileştirme</span>
                </div>
                <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>• Daha fazla fotoğraf ekle</li>
                  <li>• Açıklamayı detaylandır</li>
                  <li>• Fiyatı gözden geçir</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predictions */}
      <Card className="card-professional border-gradient-to-r from-indigo-200 to-purple-200">
        <CardHeader>
          <CardTitle className="text-base font-display font-bold text-foreground flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            AI Tahminleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-100">Tahmini Görüntülenme</span>
              </div>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                {formatNumber(analytics.predictions.estimatedViews)}
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                Sonraki 30 gün için
              </p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-100">Tahmini İletişim</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {analytics.predictions.estimatedInquiries}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                Sonraki 30 gün için
              </p>
            </div>
            <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                <span className="text-xs font-semibold text-pink-900 dark:text-pink-100">Tahmini Satış Süresi</span>
              </div>
              <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                {analytics.predictions.timeToSell}
              </p>
              <p className="text-xs text-pink-700 dark:text-pink-300 mt-1">
                %{Math.round(analytics.predictions.confidence * 100)} güven
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
