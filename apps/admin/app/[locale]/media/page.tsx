import { getTranslations, setRequestLocale } from "next-intl/server";

import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";

const MediaLibrary = dynamic(
  () => import("@/components/media/MediaLibrary").then((mod) => ({ default: mod.MediaLibrary })),
  {
    loading: () => <PageSkeleton />,
    ssr: true,
  }
);

export default async function MediaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  const { type, category } = await searchParams;
  
  // Development mode: Skip auth check
  // In production, uncomment the line below to enable role checking
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "media" });

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("title")}
          </h1>
          <p className="admin-page-description">
            {t("description")}
          </p>
        </div>
      </div>

      <MediaLibrary locale={locale} initialType={type} initialCategory={category} />
    </div>
  );
}

