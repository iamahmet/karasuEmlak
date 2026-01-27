import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Karasu Emlak Admin Panel - Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/loading/PageSkeleton";

const PremiumDashboard = dynamic(
  () => import("@/components/dashboard/PremiumDashboard").then((mod) => ({ default: mod.PremiumDashboard })),
  { loading: () => <PageSkeleton /> }
);

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  // Development mode: Skip auth check
  // In production, uncomment the line below to enable role checking
  // await requireStaff();

  return <PremiumDashboard />;
}
