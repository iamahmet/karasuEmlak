import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { AuthorsManagement } from "@/components/authors/AuthorsManagement";
import { Button } from "@karasu/ui";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Yazarlar | Admin Panel",
  description: "Karasu Emlak Admin Panel - Yazar Yönetimi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function YazarlarPage({
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Yazarlar
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Blog yazarlarını yönetin. Yazar profilleri, uzmanlık alanları ve sosyal medya bağlantıları.
              </p>
            </div>
            <Button asChild>
              <Link href={`/${locale}/yazarlar/yeni`}>
                <Plus className="w-4 h-4 mr-2" />
                Yeni Yazar
              </Link>
            </Button>
          </div>
        </div>

        <AuthorsManagement />
      </div>
    </div>
  );
}
