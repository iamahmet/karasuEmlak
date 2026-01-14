import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Karasu Emlak Admin Panel - Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};
import {
  FileText,
  Folder,
  Users,
  Eye,
} from "lucide-react";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";

const RealTimeStats = dynamic(
  () => import("@/components/dashboard/RealTimeStats").then((mod) => ({ default: mod.RealTimeStats })),
  { loading: () => <PageSkeleton />, ssr: true }
);

const ActivityFeed = dynamic(
  () => import("@/components/activity-feed/ActivityFeed").then((mod) => ({ default: mod.ActivityFeed })),
  { loading: () => <PageSkeleton /> }
);

const QuickStats = dynamic(
  () => import("@/components/dashboard/QuickStats").then((mod) => ({ default: mod.QuickStats })),
  { loading: () => <PageSkeleton /> }
);

const RecentActivity = dynamic(
  () => import("@/components/dashboard/RecentActivity").then((mod) => ({ default: mod.RecentActivity })),
  { loading: () => <PageSkeleton /> }
);

const TopContent = dynamic(
  () => import("@/components/dashboard/TopContent").then((mod) => ({ default: mod.TopContent })),
  { loading: () => <PageSkeleton /> }
);

const PerformanceMetrics = dynamic(
  () => import("@/components/dashboard/PerformanceMetrics").then((mod) => ({ default: mod.PerformanceMetrics })),
  { loading: () => <PageSkeleton /> }
);

const SystemHealth = dynamic(
  () => import("@/components/dashboard/SystemHealth").then((mod) => ({ default: mod.SystemHealth })),
  { loading: () => <PageSkeleton /> }
);

const QuickActions = dynamic(
  () => import("@/components/dashboard/QuickActions").then((mod) => ({ default: mod.QuickActions })),
  { loading: () => <PageSkeleton /> }
);

const TrendingContent = dynamic(
  () => import("@/components/dashboard/TrendingContent").then((mod) => ({ default: mod.TrendingContent })),
  { loading: () => <PageSkeleton /> }
);

const ContentCalendar = dynamic(
  () => import("@/components/dashboard/ContentCalendar").then((mod) => ({ default: mod.ContentCalendar })),
  { loading: () => <PageSkeleton /> }
);

const QuickInsights = dynamic(
  () => import("@/components/dashboard/QuickInsights").then((mod) => ({ default: mod.QuickInsights })),
  { loading: () => <PageSkeleton /> }
);

const AICheckerInfo = dynamic(
  () => import("@/components/content/AICheckerInfo").then((mod) => ({ default: mod.AICheckerInfo })),
  { loading: () => <PageSkeleton /> }
);

const StatsChart = dynamic(
  () => import("@/components/dashboard/StatsChart").then((mod) => ({ default: mod.StatsChart })),
  { loading: () => <PageSkeleton /> }
);

const RealTimeUpdates = dynamic(
  () => import("@/components/dashboard/RealTimeUpdates").then((mod) => ({ default: mod.RealTimeUpdates })),
  { loading: () => <PageSkeleton /> }
);

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  
  // Development mode: Skip auth check
  // In production, uncomment the line below to enable role checking
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "admin.dashboard" });

  const supabase = await createClient();

  // Get real stats with error handling
  let totalArticles = 0;
  let totalCategories = 0;
  let totalUsers = 0;
  let totalViews = 0;
  let publishedCount = 0;
  let recentActivity: any[] = [];

  // Check if Supabase is configured
  const isSupabaseConfigured = 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co';

  if (!isSupabaseConfigured) {
    // Return mock data for development
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">⚠️ Supabase Not Configured</h2>
          <p className="text-muted-foreground">
            Please set up your environment variables in <code>.env.local</code>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Required variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
          </p>
        </div>
      </div>
    );
  }

  try {
    const [articlesResult, categoriesResult, usersResult, viewsResult] = await Promise.all([
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("views").limit(1000),
    ]);

    totalArticles = articlesResult.count || 0;
    totalCategories = categoriesResult.count || 0;
    totalUsers = usersResult.count || 0;
    totalViews = viewsResult.data?.reduce((sum, a) => sum + (a.views || 0), 0) || 0;

    // Recent articles are handled by TopContent component

    // Get published articles count
    const { count: publishedCountData } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    publishedCount = publishedCountData || 0;

    // Get recent activity from audit logs
    try {
      const { data: recentActivityData, error: auditError } = await supabase
        .from("audit_logs")
        .select("id, action, resource_type, resource_id, user_id, created_at, details")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (!auditError && recentActivityData) {
        // Map to expected format (resource_type -> entity_type, resource_id -> entity_id, details -> metadata)
        recentActivity = recentActivityData.map((log: any) => ({
          id: log.id,
          action: log.action,
          entity_type: log.resource_type || log.entity_type,
          entity_id: log.resource_id || log.entity_id,
          user_id: log.user_id,
          created_at: log.created_at,
          metadata: log.details || log.metadata || {},
        }));
      }
    } catch (auditError: any) {
      console.error("Failed to fetch audit logs:", auditError);
      recentActivity = [];
    }
  } catch (error: any) {
    console.error("Failed to fetch dashboard data:", error);
    // Continue with default values
  }

  const stats = [
    {
      label: t("stats.articles"),
      value: totalArticles,
      icon: FileText,
      change: "+12%",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: `/${locale}/seo/content-studio`,
    },
    {
      label: t("stats.categories"),
      value: totalCategories,
      icon: Folder,
      change: "+5%",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: t("stats.users"),
      value: totalUsers,
      icon: Users,
      change: "+8%",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Toplam Görüntülenme",
      value: totalViews.toLocaleString("tr-TR"),
      icon: Eye,
      change: "+23%",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];


  return (
    <div className="admin-container responsive-padding space-section animate-fade-in max-w-[1920px] mx-auto">
      {/* Header - Professional */}
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("title")}
          </h1>
          <p className="admin-page-description">
            Hoş geldiniz! İşte genel bakışınız.
          </p>
        </div>
      </div>

      {/* Stats Grid - Professional */}
      <div className="admin-grid-4 gap-4 md:gap-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const progressWidth = Math.min(100, parseInt(stat.change.replace('+', '').replace('%', '')) * 5);
          return (
            <Card 
              key={stat.label} 
              className="card-modern card-elevated bg-white dark:bg-[#0a3d35] hover-lift animate-slide-up group cursor-pointer relative overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-design-light/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-3 px-5 pt-5 relative z-10">
                <CardTitle className="text-[10px] md:text-xs font-ui font-bold text-design-gray dark:text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-design-light/20 via-design-light/10 to-design-light/5 group-hover:from-design-light/30 group-hover:via-design-light/20 group-hover:to-design-light/10 transition-all duration-300 micro-bounce shadow-sm group-hover:shadow-md">
                  <Icon className="h-4 w-4 text-design-dark dark:text-design-light relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/30 to-transparent"></div>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 relative z-10">
                <div className="flex items-baseline justify-between mb-4">
                  <div className="text-3xl md:text-4xl font-display font-bold text-design-dark dark:text-white tracking-tight bg-gradient-to-br from-design-dark to-design-dark/80 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <span className="text-[10px] md:text-xs font-bold bg-gradient-to-r from-design-light/20 to-design-light/10 text-design-dark dark:text-design-light px-2.5 py-1 rounded-lg font-ui shadow-sm border border-design-light/20">
                    {stat.change}
                  </span>
                </div>
                <div className="relative h-1.5 bg-[#E7E7E7]/50 dark:bg-[#062F28]/50 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-design-light via-design-light/90 to-design-dark rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{ width: `${progressWidth}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions - Enhanced Grid */}
      <QuickActions />

      {/* AI Checker Info */}
      <AICheckerInfo />

      {/* Quick Stats - Additional Metrics */}
      <QuickStats />

      {/* Performance Metrics */}
      <PerformanceMetrics />

      {/* Real-time Stats */}
      <RealTimeStats
        initialStats={{
          totalViews,
          totalUsers,
          totalArticles,
          publishedArticles: publishedCount || 0,
        }}
      />

      {/* Main Content Grid - Professional */}
      <div className="admin-grid-2 gap-6">
        {/* Recent Activity from Audit Logs */}
        <RecentActivity />

        {/* Top Content */}
        <TopContent locale={locale} />
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Content */}
        <TrendingContent locale={locale} />

        {/* Content Calendar */}
        <ContentCalendar />
      </div>

      {/* Stats Charts - New */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatsChart title="Son 7 Gün - Yeni İçerikler" type="articles" days={7} />
        <StatsChart title="Son 7 Gün - Görüntülenmeler" type="views" days={7} />
      </div>

      {/* Real-time Updates */}
      <RealTimeUpdates />

      {/* Quick Insights */}
      <QuickInsights />

      {/* System Health */}
      <SystemHealth />

      {/* Activity Feed */}
      <Card className="card-modern card-elevated bg-white dark:bg-[#0a3d35] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-design-light/5 to-transparent rounded-full blur-3xl"></div>
        <CardHeader className="pb-4 px-5 pt-5 relative z-10">
          <CardTitle className="text-lg md:text-xl font-display font-bold text-design-dark dark:text-white flex items-center gap-3">
            <span className="w-1 h-6 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full shadow-lg"></span>
            Canlı Aktivite Akışı
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 relative z-10">
          <ActivityFeed limit={10} initialActivity={recentActivity || []} />
        </CardContent>
      </Card>

      {/* Additional Info - Enhanced Modern */}
      <div className="grid grid-cols-3 gap-4 md:gap-5">
        <Card className="card-modern card-elevated bg-white dark:bg-[#0a3d35] hover-lift relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-design-light/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 px-4 pt-4 relative z-10">
            <CardTitle className="text-[10px] md:text-xs font-ui font-bold text-design-gray dark:text-gray-400 uppercase tracking-wider">Yayınlanan</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <div className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-br from-design-dark to-design-dark/80 dark:from-design-light dark:to-design-light/80 bg-clip-text text-transparent mb-2">{publishedCount || 0}</div>
            <p className="text-[10px] md:text-xs text-design-gray dark:text-gray-400 font-ui font-medium">
              {totalArticles} içerikten
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern card-elevated bg-white dark:bg-[#0a3d35] hover-lift relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-design-light/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 px-4 pt-4 relative z-10">
            <CardTitle className="text-[10px] md:text-xs font-ui font-bold text-design-gray dark:text-gray-400 uppercase tracking-wider">Taslak</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <div className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-br from-design-dark to-design-dark/80 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
              {(totalArticles || 0) - (publishedCount || 0)}
            </div>
            <p className="text-[10px] md:text-xs text-design-gray dark:text-gray-400 font-ui font-medium">Bekliyor</p>
          </CardContent>
        </Card>

        <Card className="card-modern card-elevated bg-white dark:bg-[#0a3d35] hover-lift relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-design-light/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 px-4 pt-4 relative z-10">
            <CardTitle className="text-[10px] md:text-xs font-ui font-bold text-design-gray dark:text-gray-400 uppercase tracking-wider">Ortalama</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <div className="text-3xl md:text-4xl font-display font-bold bg-gradient-to-br from-design-dark to-design-dark/80 dark:from-design-light dark:to-design-light/80 bg-clip-text text-transparent mb-2">
              {totalArticles > 0
                ? Math.round(totalViews / totalArticles).toLocaleString("tr-TR")
                : 0}
            </div>
            <p className="text-[10px] md:text-xs text-design-gray dark:text-gray-400 font-ui font-medium">Görüntülenme</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
