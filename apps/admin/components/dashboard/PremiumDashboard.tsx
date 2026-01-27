"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import {
  Home,
  TrendingUp,
  Eye,
  DollarSign,
  Plus,
  Search,
  ImageIcon,
  Settings,
  Activity,
  FileText,
  Newspaper,
  Edit,
  ExternalLink,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Users,
  Clock,
  ChevronRight,
  Zap,
  Target,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn } from "@karasu/lib";
import { createClient } from "@/lib/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// ============================================================================
// TYPES
// ============================================================================

interface ListingsStats {
  total: number;
  published: number;
  drafts: number;
  featured: number;
  satilik: number;
  kiralik: number;
  totalValue: number;
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  status: string;
  property_type: string;
  price: number;
  published: boolean;
  featured: boolean;
  created_at: string;
  location_neighborhood?: string;
}

interface ActivityItem {
  id: string;
  type: "listing" | "article" | "news";
  action: string;
  title: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface TrendData {
  date: string;
  added: number;
  published: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatPrice = (price: number) => {
  if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(0)}K`;
  return price.toLocaleString("tr-TR");
};

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}g önce`;
  if (hours > 0) return `${hours}s önce`;
  if (minutes > 0) return `${minutes}dk önce`;
  return "Şimdi";
};

// ============================================================================
// ANIMATED COUNTER COMPONENT
// ============================================================================

function AnimatedCounter({ value, suffix = "" }: { value: number | string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "string" ? parseFloat(value) || 0 : value;

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepValue = numericValue / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [numericValue]);

  return (
    <span className="tabular-nums">
      {typeof value === "string" && value.includes(".")
        ? displayValue.toFixed(1)
        : displayValue.toLocaleString("tr-TR")}
      {suffix}
    </span>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  delay?: number;
}

function StatCard({
  label,
  value,
  suffix = "",
  icon: Icon,
  change,
  changeType = "neutral",
  subtitle,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/40",
        "bg-card/95 backdrop-blur-xl",
        "shadow-sm shadow-black/5 dark:shadow-black/20",
        "transition-all duration-200",
        "hover:border-border/60 hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-2"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-lg transition-all duration-200",
              "bg-primary/10 text-primary",
              "group-hover:bg-primary/15"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {change && (
            <div
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium",
                "border border-border/40",
                changeType === "positive" &&
                  "bg-primary/10 text-primary border-primary/20",
                changeType === "negative" &&
                  "bg-destructive/10 text-destructive border-destructive/20",
                changeType === "neutral" &&
                  "bg-muted/50 text-muted-foreground border-border/40"
              )}
            >
              {changeType === "positive" && <ArrowUpRight className="h-3 w-3" />}
              {changeType === "negative" && <ArrowDownRight className="h-3 w-3" />}
              {change}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            <AnimatedCounter value={value} suffix={suffix} />
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>

        {/* Subtle bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </div>
  );
}

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

interface QuickActionProps {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  delay?: number;
}

function QuickActionButton({
  label,
  description,
  icon: Icon,
  href,
  delay = 0,
}: QuickActionProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl p-4",
          "border border-border/40",
          "bg-card/95 backdrop-blur-xl",
          "hover:border-border/60 hover:bg-card",
          "transition-all duration-200",
          "hover:shadow-md",
          "animate-in fade-in slide-in-from-bottom-2"
        )}
        style={{ animationDelay: `${delay}ms`, animationFillMode: "backwards" }}
      >
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        <div className="relative flex items-center gap-3">
          <div
            className={cn(
              "p-2.5 rounded-lg",
              "bg-primary/10 text-primary",
              "group-hover:bg-primary/15",
              "transition-all duration-200"
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {label}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {description}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// LISTING ITEM COMPONENT
// ============================================================================

function ListingItem({ listing }: { listing: Listing }) {
  const getStatusBadge = (status: string, published: boolean) => {
    if (!published) {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-muted/50 text-muted-foreground font-medium border border-border/40">
          Taslak
        </span>
      );
    }
    if (status === "satilik") {
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20">
          Satılık
        </span>
      );
    }
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20">
        Kiralık
      </span>
    );
  };

  return (
    <div className="group flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer border-b border-border/40 last:border-b-0">
      {/* Property Icon */}
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <Home className="h-5 w-5 text-primary" />
        </div>
        {listing.featured && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-sm border-2 border-card">
            <Sparkles className="h-2.5 w-2.5 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {listing.title}
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {getStatusBadge(listing.status, listing.published)}
          <span className="text-muted-foreground/60">•</span>
          <span>{listing.property_type}</span>
          {listing.location_neighborhood && (
            <>
              <span className="text-muted-foreground/60">•</span>
              <span>{listing.location_neighborhood}</span>
            </>
          )}
        </div>
      </div>

      {/* Price & Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="font-bold text-primary">{formatPrice(listing.price)} ₺</p>
          <p className="text-[10px] text-muted-foreground">
            {formatTimeAgo(new Date(listing.created_at))}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/listings/${listing.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary hover:text-white"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </Link>
          {listing.published && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-blue-500 hover:text-white"
              onClick={() => {
                const webUrl =
                  typeof window !== "undefined"
                    ? window.location.origin
                        .replace("admin.", "")
                        .replace(":3001", ":3000") + `/ilan/${listing.slug}`
                    : `/ilan/${listing.slug}`;
                window.open(webUrl, "_blank");
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

function ActivityItemComponent({ activity }: { activity: ActivityItem }) {
  const Icon = activity.icon;

  return (
    <div className="group flex items-start gap-3 py-3 hover:bg-muted/50 px-2 -mx-2 rounded-lg transition-colors">
      <div
        className={cn(
          "p-2 rounded-lg transition-colors",
          "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {activity.action} • {formatTimeAgo(new Date(activity.timestamp))}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export function PremiumDashboard() {
  const [stats, setStats] = useState<ListingsStats>({
    total: 0,
    published: 0,
    drafts: 0,
    featured: 0,
    satilik: 0,
    kiralik: 0,
    totalValue: 0,
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch listings
        const listingsRes = await fetch("/api/listings?limit=100");
        const listingsData = listingsRes.ok ? await listingsRes.json() : { data: { listings: [] } };
        const allListings = listingsData.data?.listings || [];

        // Process stats
        const getPrice = (l: any) => l.price_amount || 0;
        const total = allListings.length;
        const published = allListings.filter((l: any) => l.published).length;
        const drafts = total - published;
        const featured = allListings.filter((l: any) => l.featured).length;
        const satilik = allListings.filter((l: any) => l.status === "satilik").length;
        const kiralik = allListings.filter((l: any) => l.status === "kiralik").length;
        const totalValue = allListings.reduce((sum: number, l: any) => sum + getPrice(l), 0);

        setStats({ total, published, drafts, featured, satilik, kiralik, totalValue });

        // Map listings for display
        const mappedListings = allListings.slice(0, 5).map((l: any) => ({
          id: l.id,
          title: l.title,
          slug: l.slug,
          status: l.status,
          property_type: l.property_type,
          price: l.price_amount || 0,
          published: l.published,
          featured: l.featured,
          created_at: l.created_at,
          location_neighborhood: l.location_neighborhood,
        }));
        setListings(mappedListings);

        // Fetch articles and news for activity
        const [articlesRes, newsRes] = await Promise.all([
          fetch("/api/articles?limit=5"),
          fetch("/api/news?limit=5"),
        ]);
        const articles = articlesRes.ok
          ? (await articlesRes.json()).data?.articles || []
          : [];
        const news = newsRes.ok ? (await newsRes.json()).data?.news || [] : [];

        const activityItems: ActivityItem[] = [
          ...allListings.slice(0, 3).map((item: any) => ({
            id: `listing-${item.id}`,
            type: "listing" as const,
            action: item.published ? "yayınlandı" : "oluşturuldu",
            title: item.title,
            timestamp: item.updated_at || item.created_at,
            icon: Home,
            color: "text-blue-600",
          })),
          ...articles.slice(0, 2).map((item: any) => ({
            id: `article-${item.id}`,
            type: "article" as const,
            action: item.published ? "yayınlandı" : "oluşturuldu",
            title: item.title,
            timestamp: item.updated_at || item.created_at,
            icon: FileText,
            color: "text-green-600",
          })),
          ...news.slice(0, 2).map((item: any) => ({
            id: `news-${item.id}`,
            type: "news" as const,
            action: item.published ? "yayınlandı" : "oluşturuldu",
            title: item.title,
            timestamp: item.updated_at || item.created_at,
            icon: Newspaper,
            color: "text-purple-600",
          })),
        ]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 7);

        setActivities(activityItems);

        // Fetch trends
        const trendsRes = await fetch("/api/dashboard/analytics?period=30d");
        if (trendsRes.ok) {
          const trendsData = await trendsRes.json();
          if (trendsData.success && trendsData.data?.trends) {
            const trendData = trendsData.data.trends.map((t: any) => ({
              date: new Date(t.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
              added: t.added,
              published: t.published,
            }));
            setTrends(trendData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const greeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-16 bg-muted/50 rounded-xl w-1/2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-40 bg-muted/50 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-80 bg-muted/50 rounded-xl" />
              <div className="h-80 bg-muted/50 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const quickActions: QuickActionProps[] = [
    {
      label: "Yeni İlan",
      description: "Hızlıca yeni ilan ekle",
      icon: Plus,
      href: "/listings/new",
    },
    {
      label: "İlanları Yönet",
      description: "Tüm ilanları görüntüle",
      icon: Search,
      href: "/listings",
    },
    {
      label: "Medya",
      description: "Görselleri yönet",
      icon: ImageIcon,
      href: "/media",
    },
    {
      label: "Ayarlar",
      description: "Site ayarlarını düzenle",
      icon: Settings,
      href: "/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div
              className="animate-in fade-in slide-in-from-left-4 duration-700"
              style={{ animationFillMode: "backwards" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1.5 w-12 bg-gradient-to-r from-primary to-emerald-400 rounded-full" />
                <span className="text-sm font-medium text-muted-foreground">
                  {currentTime.toLocaleDateString("tr-TR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                {greeting()},{" "}
                <span className="text-primary">
                  Admin
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-2 max-w-xl">
                Emlak portföyünüzün güncel durumu ve hızlı işlemler
              </p>
            </div>

            <div
              className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-700"
              style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
            >
              <Button
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Yenile
              </Button>
              <Link href="/listings/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni İlan
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <StatCard
            label="Toplam İlan"
            value={stats.total}
            icon={Home}
            change="+12%"
            changeType="positive"
            gradient=""
            iconBg=""
            delay={100}
          />
          <StatCard
            label="Yayında"
            value={stats.published}
            icon={Eye}
            change={`${stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%`}
            changeType="positive"
            subtitle={`${stats.drafts} taslak`}
            gradient=""
            iconBg=""
            delay={200}
          />
          <StatCard
            label="Öne Çıkan"
            value={stats.featured}
            icon={Sparkles}
            change="+5%"
            changeType="positive"
            gradient=""
            iconBg=""
            delay={300}
          />
          <StatCard
            label="Toplam Değer"
            value={(stats.totalValue / 1000000).toFixed(1)}
            suffix="M ₺"
            icon={DollarSign}
            change="+8%"
            changeType="positive"
            subtitle={`${stats.satilik} satılık, ${stats.kiralik} kiralık`}
            gradient=""
            iconBg=""
            delay={400}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-semibold text-foreground">Hızlı İşlemler</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <QuickActionButton key={action.label} {...action} delay={500 + i * 100} />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div
            className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: "600ms", animationFillMode: "backwards" }}
          >
            <Card className="overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">İlan Trendleri</CardTitle>
                      <p className="text-xs text-muted-foreground">Son 30 günlük aktivite</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Detaylı Rapor <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={trends}>
                      <defs>
                        <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9762" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0D9762" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPublished" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255,255,255,0.95)",
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="added"
                        name="Eklenen"
                        stroke="#0D9762"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAdded)"
                      />
                      <Area
                        type="monotone"
                        dataKey="published"
                        name="Yayınlanan"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPublished)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Henüz trend verisi yok</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Feed */}
          <div
            className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: "700ms", animationFillMode: "backwards" }}
          >
            <Card className="h-full overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Son Aktiviteler</CardTitle>
                    <p className="text-xs text-muted-foreground">Güncel değişiklikler</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {activities.length > 0 ? (
                  <div className="space-y-1 max-h-[320px] overflow-y-auto scrollbar-modern pr-1">
                    {activities.map((activity) => (
                      <ActivityItemComponent key={activity.id} activity={activity} />
                    ))}
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Henüz aktivite yok</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Listings */}
        <div
          className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "800ms", animationFillMode: "backwards" }}
        >
          <Card className="overflow-hidden border-border/40 bg-card/95 backdrop-blur-xl shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Son Eklenen İlanlar</CardTitle>
                    <p className="text-xs text-muted-foreground">En güncel emlak ilanları</p>
                  </div>
                </div>
                <Link href="/listings">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5">
                    Tümünü Gör <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {listings.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {listings.map((listing) => (
                    <ListingItem key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Home className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm mb-4">Henüz ilan bulunmuyor</p>
                  <Link href="/listings/new">
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      İlk İlanını Ekle
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Stats */}
        <footer
          className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{ animationDelay: "900ms", animationFillMode: "backwards" }}
        >
          {[
            { label: "Satılık", value: stats.satilik, icon: Target },
            { label: "Kiralık", value: stats.kiralik, icon: Home },
            { label: "Taslak", value: stats.drafts, icon: FileText },
            { label: "Öne Çıkan", value: stats.featured, icon: Sparkles },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-4 rounded-xl bg-card/95 backdrop-blur-xl border border-border/40"
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </footer>
      </div>
    </div>
  );
}
