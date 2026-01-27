import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";

const ArticlesEditor = dynamic(
  () => import("@/components/articles/ArticlesEditor").then((mod) => ({ default: mod.ArticlesEditor })),
  {
    loading: () => <PageSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "Yeni Makale | Admin Panel",
  description: "Karasu Emlak Admin Panel - Yeni Makale Oluştur",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewArticlePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">Yeni Makale</h1>
          <p className="admin-page-description">
            Yeni bir blog makalesi oluşturun
          </p>
        </div>
      </div>

      <ArticlesEditor locale={locale} />
    </div>
  );
}
