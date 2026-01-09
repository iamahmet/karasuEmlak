import { getTranslations, setRequestLocale } from "next-intl/server";
// import { requireStaff } from "@/lib/auth/server";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kullanıcı Yönetimi",
  description: "Karasu Emlak Admin Panel - Kullanıcı yönetimi ve yetkilendirme",
  robots: {
    index: false,
    follow: false,
  },
};

const UsersManagement = dynamic(
  () => import("@/components/users/UsersManagement").then((mod) => ({ default: mod.UsersManagement })),
  {
    loading: () => <PageSkeleton />,
    ssr: true,
  }
);

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string; role?: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  const { tab, role } = await searchParams;
  
  // Development mode: Skip auth check
  // In production, uncomment the line below to enable role checking
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "users" });

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("title")}
          </h1>
          <p className="admin-page-description">
            {t("description")}
          </p>
        </div>
      </div>

      {/* Users Management Component */}
      <UsersManagement locale={locale} initialTab={tab || "all"} initialRole={role} />
    </div>
  );
}

