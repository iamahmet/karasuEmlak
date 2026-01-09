/**
 * Content Studio v2 - Main Page
 * AI-powered content creation with workflows, templates, and quality gates
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/admin/supabase/server";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/admin/loading/PageSkeleton";

const ContentStudioOverview = dynamic(
  () => import("@/components/admin/content-studio/ContentStudioOverview").then((mod) => ({ default: mod.ContentStudioOverview })),
  {
    loading: () => <PageSkeleton />,
    ssr: true,
  }
);

const ContentStudioTabs = dynamic(
  () => import("@/components/admin/content-studio/ContentStudioTabs").then((mod) => ({ default: mod.ContentStudioTabs })),
  {
    loading: () => <PageSkeleton />,
  }
);

const ContentExportImport = dynamic(
  () => import("@/components/admin/content-studio/ContentExportImport").then((mod) => ({ default: mod.ContentExportImport })),
  {
    loading: () => <PageSkeleton />,
  }
);

const ContentSearch = dynamic(
  () => import("@/components/admin/content-studio/ContentSearch").then((mod) => ({ default: mod.ContentSearch })),
  {
    loading: () => <PageSkeleton />,
  }
);

export default async function ContentStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; type?: string }>;
}) {
  const { locale } = await params;
  const { tab, type } = await searchParams;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Development mode: Skip auth check
  // In production, uncomment the line below to enable role checking
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "contentStudio" });

  const supabase = await createClient();

  // Get content items summary
  const { data: contentSummary } = await supabase
    .from("content_items")
    .select("status, type")
    .limit(1000);

  const draftCount = contentSummary?.filter((c) => c.status === "draft").length || 0;
  const reviewCount = contentSummary?.filter((c) => c.status === "review").length || 0;
  const publishedCount = contentSummary?.filter((c) => c.status === "published").length || 0;

  // Get recent content items
  const { data: recentContent } = await supabase
    .from("content_items")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("title")}
          </h1>
          <p className="admin-page-description">
            {t("description") || "AI-powered content creation with workflows, templates, and quality gates"}
          </p>
        </div>
      </div>

      <ContentStudioOverview
        draftCount={draftCount}
        reviewCount={reviewCount}
        publishedCount={publishedCount}
        recentContent={recentContent || []}
        locale={locale}
      />

      <ContentStudioTabs defaultTab={tab || "create"} locale={locale} contentType={type} />
      
      {/* Advanced Search */}
      <div className="mt-8">
        <ContentSearch locale={locale} />
      </div>
      
      {/* Export/Import Section */}
      <div className="mt-8">
        <ContentExportImport locale={locale} />
      </div>
    </div>
  );
}

