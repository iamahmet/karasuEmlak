import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Karasu Emlak Admin Panel - Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";

const ListingsStats = dynamic(
  () => import("@/components/dashboard/ListingsStats").then((mod) => ({ default: mod.ListingsStats })),
  { loading: () => <PageSkeleton /> }
);

const RecentListings = dynamic(
  () => import("@/components/dashboard/RecentListings").then((mod) => ({ default: mod.RecentListings })),
  { loading: () => <PageSkeleton /> }
);

const QuickActions = dynamic(
  () => import("@/components/dashboard/QuickActions").then((mod) => ({ default: mod.QuickActions })),
  { loading: () => <PageSkeleton /> }
);

const EnhancedAnalytics = dynamic(
  () => import("@/components/dashboard/EnhancedAnalytics").then((mod) => ({ default: mod.EnhancedAnalytics })),
  { loading: () => <PageSkeleton /> }
);

const ActivityFeed = dynamic(
  () => import("@/components/dashboard/ActivityFeed").then((mod) => ({ default: mod.ActivityFeed })),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="admin-container responsive-padding space-section animate-fade-in max-w-[1920px] mx-auto py-6">
        {/* Header - Modern & Enhanced */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-green-400 to-blue-500 rounded-full opacity-60 shadow-lg"></div>
            <div className="pl-6">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-['Urbanist'] bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                İlan Yönetimi Dashboard
              </h1>
              <p className="text-base text-muted-foreground font-medium">
                İlanlarınızın genel bakışı ve hızlı erişim
              </p>
            </div>
          </div>
        </div>

        {/* Listings Stats - Özet İstatistikler */}
        <div className="mb-8">
          <ListingsStats />
        </div>

        {/* Quick Actions - Hızlı İşlemler */}
        <div className="mb-8">
          <QuickActions />
        </div>

        {/* Enhanced Analytics - Trend Grafikleri */}
        <div className="mb-8">
          <EnhancedAnalytics />
        </div>

        {/* Activity Feed & Recent Listings - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ActivityFeed />
          <RecentListings />
        </div>
      </div>
    </div>
  );
}
