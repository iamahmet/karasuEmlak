import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programatik Sayfalar | Admin",
  robots: {
    index: false,
    follow: false,
  },
};

const ProgrammaticPagesManagement = dynamic(
  () => import("@/components/programmatic-pages/ProgrammaticPagesManagement").then((mod) => ({ default: mod.ProgrammaticPagesManagement })),
  {
    loading: () => <PageSkeleton />,
    ssr: true,
  }
);

import { setRequestLocale } from "next-intl/server";

export default async function ProgrammaticPagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Development mode: Skip auth check
  // await requireStaff();

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            Programatik Sayfalar
          </h1>
          <p className="admin-page-description">
            Dinamik içerik sayfalarını yönetin (Namaz vakitleri, Hava durumu, İş ilanları, vb.)
          </p>
        </div>
      </div>

      {/* Programmatic Pages Management Component */}
      <ProgrammaticPagesManagement locale={locale} />
    </div>
  );
}

