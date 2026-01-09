import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/admin/loading/PageSkeleton";

const HomepageManager = dynamic(
  () => import("@/components/admin/homepage/HomepageManager").then((mod) => ({ default: mod.HomepageManager })),
  {
    loading: () => <PageSkeleton />,
  }
);

export const metadata: Metadata = {
  title: "Ana Sayfa Yönetimi | Admin Panel",
  description: "Karasu Emlak Admin Panel - Ana Sayfa Yönetimi",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function HomepagePage({
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
            Ana Sayfa Yönetimi
          </h1>
          <p className="admin-page-description">
            Ana sayfa bölümlerini, içeriklerini ve görünürlüğünü buradan yönetebilirsiniz.
          </p>
        </div>
      </div>

      <HomepageManager />
    </div>
  );
}
