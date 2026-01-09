import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ArticlesManagement } from "@/components/admin/articles/ArticlesManagement";

export const metadata: Metadata = {
  title: "Makaleler | Admin Panel",
  description: "Karasu Emlak Admin Panel - Makale Yönetimi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            Makale Yönetimi
          </h1>
          <p className="admin-page-description">
            Blog makalelerini görüntüleyin, düzenleyin ve yönetin
          </p>
        </div>
      </div>

      <ArticlesManagement locale={locale} />
    </div>
  );
}

