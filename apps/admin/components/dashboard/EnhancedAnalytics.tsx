"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Download, RefreshCw } from "lucide-react";
import { Button } from "@karasu/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@karasu/ui";

interface ListingTrend {
  date: string;
  added: number;
  published: number;
  views: number;
  featured: number;
}

interface NeighborhoodPerformance {
  name: string;
  listings: number;
  avgPrice: number;
  views: number;
  conversion: number;
}

export function EnhancedAnalytics() {
  const [trends, setTrends] = useState<ListingTrend[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodPerformance[]>([]);
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Use dedicated analytics API
      const response = await fetch(`/api/dashboard/analytics?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Analytics fetch failed");
      }

      // Transform API data to component format
      const trendData: ListingTrend[] = data.data.trends.map((t: any) => ({
        date: new Date(t.date).toLocaleDateString("tr-TR", { month: "short", day: "numeric" }),
        added: t.added,
        published: t.published,
        views: 0, // Will be added when analytics are available
        featured: t.featured,
      }));

      setTrends(trendData);

      // Transform neighborhood data
      const neighborhoodData: NeighborhoodPerformance[] = data.data.neighborhoods.map((n: any) => ({
        name: n.name,
        listings: n.listings,
        avgPrice: n.avgPrice,
        views: 0, // Will be added when analytics are available
        conversion: 0, // Will be added when analytics are available
      }));

      setNeighborhoods(neighborhoodData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // Fallback to empty data
      setTrends([]);
      setNeighborhoods([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate trends
  const totalAdded = trends.reduce((sum, t) => sum + t.added, 0);
  const totalPublished = trends.reduce((sum, t) => sum + t.published, 0);
  const avgDailyAdded = trends.length > 0 ? totalAdded / trends.length : 0;
  const avgDailyPublished = trends.length > 0 ? totalPublished / trends.length : 0;

  const recentTrend = trends.length >= 2
    ? ((trends[trends.length - 1]?.added || 0) - (trends[trends.length - 2]?.added || 0))
    : 0;
  const trendPercentage = trends.length >= 2 && trends[trends.length - 2]?.added > 0
    ? ((recentTrend / trends[trends.length - 2].added) * 100).toFixed(1)
    : "0";

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="h-64 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Trend Analizi</h3>
          <p className="text-sm text-muted-foreground">
            Son {period === "7d" ? "7 gün" : period === "30d" ? "30 gün" : "90 gün"} içindeki ilan trendleri
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value: "7d" | "30d" | "90d") => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Son 7 Gün</SelectItem>
              <SelectItem value="30d">Son 30 Gün</SelectItem>
              <SelectItem value="90d">Son 90 Gün</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Toplam Eklenen</div>
            <div className="text-2xl font-bold text-foreground mb-2">{totalAdded}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Günlük Ortalama:</span>
              <span className="font-semibold text-foreground">{avgDailyAdded.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Yayınlanan</div>
            <div className="text-2xl font-bold text-foreground mb-2">{totalPublished}</div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Günlük Ortalama:</span>
              <span className="font-semibold text-foreground">{avgDailyPublished.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Son Trend</div>
            <div className="flex items-center gap-2 mb-2">
              {parseFloat(trendPercentage) >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <span className="text-2xl font-bold text-foreground">
                {parseFloat(trendPercentage) >= 0 ? "+" : ""}{trendPercentage}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Son güne göre değişim
            </div>
          </CardContent>
        </Card>
        <Card className="card-professional">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Aktif Mahalleler</div>
            <div className="text-2xl font-bold text-foreground mb-2">{neighborhoods.length}</div>
            <div className="text-xs text-muted-foreground">
              En çok ilan olan mahalleler
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Trends - Area Chart */}
        <Card className="card-professional">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">İlan Trendleri</CardTitle>
              <Button variant="ghost" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
                <XAxis
                  dataKey="date"
                  stroke="#7B7B7B"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#7B7B7B"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E7E7E7",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="added"
                  name="Eklenen"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorAdded)"
                />
                <Area
                  type="monotone"
                  dataKey="published"
                  name="Yayınlanan"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorPublished)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Neighborhood Performance - Bar Chart */}
        <Card className="card-professional">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Mahalle Performansı</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={neighborhoods} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E7" />
                <XAxis type="number" stroke="#7B7B7B" fontSize={12} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#7B7B7B"
                  fontSize={12}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E7E7E7",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="listings" name="İlan Sayısı" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Neighborhoods Table */}
      {neighborhoods.length > 0 && (
        <Card className="card-professional">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">En Aktif Mahalleler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Mahalle</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">İlan Sayısı</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Ortalama Fiyat</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Görüntülenme</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Dönüşüm</th>
                  </tr>
                </thead>
                <tbody>
                  {neighborhoods.map((neighborhood, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-foreground">{neighborhood.name}</td>
                      <td className="py-3 px-4 text-right text-foreground">{neighborhood.listings}</td>
                      <td className="py-3 px-4 text-right text-foreground">
                        ₺{new Intl.NumberFormat("tr-TR").format(Math.round(neighborhood.avgPrice))}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">{neighborhood.views}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-green-600 font-semibold">{neighborhood.conversion.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
