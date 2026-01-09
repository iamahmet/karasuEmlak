import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { NewsManagement } from "@/components/admin/news/NewsManagement";

export const metadata: Metadata = {
  title: "Haberler | Admin Panel",
  description: "Karasu Emlak Admin Panel - Haber Yönetimi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewsPage({
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
            Haber Yönetimi
          </h1>
          <p className="admin-page-description">
            Haberleri görüntüleyin, düzenleyin ve yönetin
          </p>
        </div>
      </div>

      <NewsManagement locale={locale} />
    </div>
  );
}

