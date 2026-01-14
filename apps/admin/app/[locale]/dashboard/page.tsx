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

const PendingReviewsWidget = dynamic(
  () => import("@/components/workflow/PendingReviewsWidget").then((mod) => ({ default: mod.PendingReviewsWidget })),
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
      {/* Header - Modern & Compact */}
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-design-light via-design-light/60 to-design-dark rounded-full opacity-40"></div>
          <h1 className="admin-page-title">
            {t("title")}
          </h1>
          <p className="admin-page-description">
            Hoş geldiniz! İşte genel bakışınız.
          </p>
        </div>
      </div>

      {/* Primary Stats Grid - Modern & Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 md:mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const progressWidth = Math.min(100, parseInt(stat.change.replace('+', '').replace('%', '')) * 5);
          return (
            <Card 
              key={stat.label} 
              className="card-professional hover-subtle group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-design-light/8 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 pt-4 relative z-10">
                <CardTitle className="text-[9px] font-medium uppercase tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {stat.label}
                </CardTitle>
                <div className="relative p-2 rounded-lg transition-all duration-200 shadow-sm" style={{ background: 'linear-gradient(to bottom right, hsl(var(--design-light-green) / 0.15), hsl(var(--design-light-green) / 0.05))' }}>
                  <Icon className="h-3.5 w-3.5 text-design-dark dark:text-design-light transition-transform duration-200 group-hover:scale-110" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 relative z-10">
                <div className="flex items-baseline justify-between mb-3">
                  <div className="text-xl md:text-2xl font-bold text-design-dark dark:text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                    {stat.value}
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md font-ui border" style={{ 
                    background: 'linear-gradient(to right, hsl(var(--design-light-green) / 0.15), hsl(var(--design-light-green) / 0.1))',
                    color: 'hsl(var(--design-dark-green))',
                    borderColor: 'hsl(var(--design-light-green) / 0.2)'
                  }}>
                    {stat.change}
                  </span>
                </div>
                <div className="relative h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(231, 231, 231, 0.4)' }}>
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${progressWidth}%`,
                      background: 'linear-gradient(to right, hsl(var(--design-light-green)), hsl(var(--design-light-green) / 0.8))'
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions - Enhanced Grid */}
      <div className="mb-6">
        <QuickActions />
      </div>

      {/* Workflow & AI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 md:mb-6">
        <PendingReviewsWidget />
        <AICheckerInfo />
      </div>

      {/* Additional Stats - Compact Grid */}
      <div className="mb-4 md:mb-6">
        <QuickStats />
      </div>

      {/* Main Content Grid - Professional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <RecentActivity />
        <TopContent locale={locale} />
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <TrendingContent locale={locale} />
        <ContentCalendar />
      </div>

      {/* Stats Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <StatsChart title="Son 7 Gün - Yeni İçerikler" type="articles" days={7} />
        <StatsChart title="Son 7 Gün - Görüntülenmeler" type="views" days={7} />
      </div>

      {/* Performance & System Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <PerformanceMetrics />
        <SystemHealth />
      </div>

      {/* Real-time Updates & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <RealTimeStats
          initialStats={{
            totalViews,
            totalUsers,
            totalArticles,
            publishedArticles: publishedCount || 0,
          }}
        />
        <QuickInsights />
      </div>

      {/* Activity Feed - Full Width */}
      <Card className="card-modern card-elevated bg-white dark:bg-[#0a3d35] relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-design-light/5 to-transparent rounded-full blur-3xl"></div>
        <CardHeader className="pb-4 px-5 pt-5 relative z-10">
          <CardTitle className="text-lg md:text-xl font-bold text-design-dark dark:text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
            <span className="w-1 h-6 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full shadow-lg"></span>
            Canlı Aktivite Akışı
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 relative z-10">
          <ActivityFeed limit={10} initialActivity={recentActivity || []} />
        </CardContent>
      </Card>

      {/* Real-time Updates */}
      <div className="mb-6">
        <RealTimeUpdates />
      </div>

      {/* Summary Cards - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="card-modern card-elevated bg-white dark:bg-[#0a3d35] hover-lift relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-design-light/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 px-4 pt-4 relative z-10">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--design-medium-gray))' }}>
              Yayınlanan
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <div className="text-3xl md:text-4xl font-bold mb-2" style={{ 
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              background: 'linear-gradient(to bottom right, hsl(var(--design-dark-green)), hsl(var(--design-dark-green) / 0.8))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}>
              {publishedCount || 0}
            </div>
            <p className="text-[10px] md:text-xs font-medium" style={{ color: 'hsl(var(--design-medium-gray))' }}>
              {totalArticles} içerikten
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern card-elevated bg-white dark:bg-[#0a3d35] hover-lift relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-design-light/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 px-4 pt-4 relative z-10">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--design-medium-gray))' }}>
              Taslak
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <div className="text-3xl md:text-4xl font-bold mb-2" style={{ 
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              background: 'linear-gradient(to bottom right, hsl(var(--design-dark-green)), hsl(var(--design-dark-green) / 0.8))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}>
              {(totalArticles || 0) - (publishedCount || 0)}
            </div>
            <p className="text-[10px] md:text-xs font-medium" style={{ color: 'hsl(var(--design-medium-gray))' }}>
              Bekliyor
            </p>
          </CardContent>
        </Card>

        <Card className="card-modern card-elevated bg-white dark:bg-[#0a3d35] hover-lift relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-design-light/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="pb-3 px-4 pt-4 relative z-10">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--design-medium-gray))' }}>
              Ortalama
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 relative z-10">
            <div className="text-3xl md:text-4xl font-bold mb-2" style={{ 
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              background: 'linear-gradient(to bottom right, hsl(var(--design-dark-green)), hsl(var(--design-dark-green) / 0.8))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent'
            }}>
              {totalArticles > 0
                ? Math.round(totalViews / totalArticles).toLocaleString("tr-TR")
                : 0}
            </div>
            <p className="text-[10px] md:text-xs font-medium" style={{ color: 'hsl(var(--design-medium-gray))' }}>
              Görüntülenme
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
