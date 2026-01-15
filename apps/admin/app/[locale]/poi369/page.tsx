import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import type { Metadata } from "next";
import {
  Code,
  Zap,
  Search,
  BarChart3,
  Activity,
  Database,
  Sparkles,
  Bot,
  Settings,
  Shield,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";

const PerformanceMetrics = dynamic(
  () => import("@/components/dashboard/PerformanceMetrics").then((mod) => ({ default: mod.PerformanceMetrics })),
  { loading: () => <PageSkeleton /> }
);

const SystemHealth = dynamic(
  () => import("@/components/dashboard/SystemHealth").then((mod) => ({ default: mod.SystemHealth })),
  { loading: () => <PageSkeleton /> }
);

const StatsChart = dynamic(
  () => import("@/components/dashboard/StatsChart").then((mod) => ({ default: mod.StatsChart })),
  { loading: () => <PageSkeleton /> }
);

const RealTimeStats = dynamic(
  () => import("@/components/dashboard/RealTimeStats").then((mod) => ({ default: mod.RealTimeStats })),
  { loading: () => <PageSkeleton />, ssr: true }
);

export const metadata: Metadata = {
  title: "POI369 Developer Dashboard",
  description: "POI369 Studio - Geliştirici Araçları ve Sistem Yönetimi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function POI369DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();

  // Get developer-focused stats
  let totalArticles = 0;
  let totalListings = 0;
  let totalUsers = 0;
  let seoScore = 0;
  let aiImagesGenerated = 0;
  let systemHealth = "healthy";

  const isSupabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co";

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">⚠️ Supabase Not Configured</h2>
          <p className="text-muted-foreground">
            Please set up your environment variables in <code>.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  try {
    const [articlesResult, listingsResult, usersResult, aiImagesResult] = await Promise.all([
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("media_assets")
        .select("id", { count: "exact", head: true })
        .eq("ai_generated", true),
    ]);

    totalArticles = articlesResult.count || 0;
    totalListings = listingsResult.count || 0;
    totalUsers = usersResult.count || 0;
    aiImagesGenerated = aiImagesResult.count || 0;

    // Calculate SEO score (mock for now)
    seoScore = 85;
  } catch (error: any) {
    console.error("Failed to fetch POI369 dashboard data:", error);
  }

  const devStats = [
    {
      label: "SEO Skoru",
      value: `${seoScore}%`,
      icon: Search,
      change: "+5%",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: `/${locale}/seo/control`,
    },
    {
      label: "AI Görseller",
      value: aiImagesGenerated,
      icon: Sparkles,
      change: "+12%",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: `/${locale}/ai-images`,
    },
    {
      label: "Toplam İçerik",
      value: totalArticles,
      icon: Database,
      change: "+8%",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Sistem Durumu",
      value: systemHealth === "healthy" ? "Sağlıklı" : "Uyarı",
      icon: Activity,
      change: "100%",
      color: systemHealth === "healthy" ? "text-green-600" : "text-orange-600",
      bgColor: systemHealth === "healthy" ? "bg-green-100" : "bg-orange-100",
      href: `/${locale}/analytics/dashboard`,
    },
  ];

  const quickLinks = [
    {
      title: "SEO Control",
      description: "SEO ayarları ve kontrol paneli",
      icon: Search,
      href: `/${locale}/seo/control`,
      color: "text-blue-600",
    },
    {
      title: "Content Studio",
      description: "AI destekli içerik oluşturma",
      icon: Code,
      href: `/${locale}/seo/content-studio`,
      color: "text-purple-600",
    },
    {
      title: "Project Bot",
      description: "Otomasyon ve bot yönetimi",
      icon: Bot,
      href: `/${locale}/project-bot`,
      color: "text-orange-600",
    },
    {
      title: "Analytics",
      description: "Detaylı analitik ve raporlar",
      icon: BarChart3,
      href: `/${locale}/analytics/dashboard`,
      color: "text-green-600",
    },
    {
      title: "Compliance",
      description: "KVKK/GDPR uyumluluk yönetimi",
      icon: Shield,
      href: `/${locale}/compliance/consent`,
      color: "text-red-600",
    },
    {
      title: "System Settings",
      description: "Gelişmiş sistem ayarları",
      icon: Settings,
      href: `/${locale}/settings`,
      color: "text-gray-600",
    },
  ];

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in max-w-[1920px] mx-auto">
      {/* Header */}
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-orange-400 to-orange-600 rounded-full opacity-60"></div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
              <Code className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="admin-page-title">POI369 Developer Dashboard</h1>
              <p className="admin-page-description">
                Geliştirici araçları, SEO yönetimi ve sistem sağlığı
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="mb-6 border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-1">
                Gelişmiş Araçlar
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Bu panel geliştirici araçları içerir. Değişiklikler sistem genelinde etkili olabilir.
                Lütfen dikkatli kullanın.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developer Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {devStats.map((stat) => {
          const Icon = stat.icon;
          const progressWidth = Math.min(
            100,
            parseInt(stat.change.replace("+", "").replace("%", "")) * 5
          );
          return (
            <Card
              key={stat.label}
              className="card-professional hover-subtle group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/8 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 relative z-10">
                <CardTitle className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className="relative p-2 rounded-lg transition-all duration-200 shadow-sm bg-orange-500/10">
                  <Icon className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 transition-transform duration-200 group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 relative z-10">
                <div className="flex items-baseline justify-between mb-3">
                  <div className="text-xl md:text-2xl font-bold text-foreground tracking-tight font-['Urbanist']">
                    {stat.value}
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md border bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20">
                    {stat.change}
                  </span>
                </div>
                <div className="relative h-1 rounded-full overflow-hidden bg-muted/40">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-orange-500 to-orange-400"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Card
              key={link.title}
              className="card-professional hover-lift cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="pb-3 px-5 pt-5 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Icon className={`h-5 w-5 ${link.color}`} />
                  </div>
                  <CardTitle className="text-base font-bold">{link.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 relative z-10">
                <p className="text-sm text-muted-foreground mb-4">{link.description}</p>
                <a
                  href={link.href}
                  className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-1"
                >
                  Aç
                  <TrendingUp className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance & System Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <PerformanceMetrics />
        <SystemHealth />
      </div>

      {/* Stats Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        <StatsChart title="Son 7 Gün - SEO Performansı" type="articles" days={7} />
        <StatsChart title="Son 7 Gün - Sistem Kullanımı" type="views" days={7} />
      </div>

      {/* Real-time Stats */}
      <div className="mb-6">
        <RealTimeStats
          initialStats={{
            totalViews: 0,
            totalUsers,
            totalArticles,
            publishedArticles: 0,
          }}
        />
      </div>
    </div>
  );
}
