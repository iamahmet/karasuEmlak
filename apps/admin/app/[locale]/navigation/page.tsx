import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";

const NavigationMenuManager = dynamic(
  () => import("@/components/navigation/NavigationMenuManager").then((mod) => ({ default: mod.NavigationMenuManager })),
  {
    loading: () => <PageSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "Menü Yönetimi | Admin Panel",
  description: "Karasu Emlak Admin Panel - Menü Yönetimi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NavigationPage({
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
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            Menü Yönetimi
          </h1>
          <p className="admin-page-description">
            Header ve footer menülerini buradan yönetebilirsiniz. Menü öğelerini ekleyin, düzenleyin veya silin.
          </p>
        </div>
      </div>

      <NavigationMenuManager />
    </div>
  );
}
