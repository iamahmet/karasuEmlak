import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ArticlesManagement } from "@/components/articles/ArticlesManagement";

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
    <div className="min-h-screen bg-background">
      <div className="admin-container responsive-padding py-6">
        <ArticlesManagement locale={locale} />
      </div>
    </div>
  );
}

