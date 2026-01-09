import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";

const SEOBoosterDashboard = dynamic(
  () => import("@/components/seo/SEOBoosterDashboard").then((mod) => ({ default: mod.SEOBoosterDashboard })),
  {
    loading: () => <PageSkeleton />,
    ssr: true,
  }
);

import { setRequestLocale } from "next-intl/server";

export default async function SEOBoosterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Development mode: Skip auth check
  // await requireStaff();

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            SEO Booster
          </h1>
          <p className="admin-page-description">
            Kapsamlı SEO analiz ve optimizasyon araçları
          </p>
        </div>
      </div>

      {/* SEO Booster Dashboard */}
      <SEOBoosterDashboard locale={locale} />
    </div>
  );
}

