/**
 * Project Bot V2 - Main Page
 * Overview dashboard with scores, trends, and quick actions
 */

import { getTranslations, setRequestLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { ProjectBotOverview } from "@/components/project-bot/ProjectBotOverview";
import { ProjectBotTabs } from "@/components/project-bot/ProjectBotTabs";

export default async function ProjectBotPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab } = await searchParams;
  
  // Enable static rendering
  setRequestLocale(locale);
  
  // Development mode: Skip auth check
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "projectBot" });

  const supabase = await createClient();

  // Get latest bot run summary
  const { data: latestRuns } = await supabase
    .from("bot_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(5);

  // Get findings summary
  const { data: findingsSummary } = await supabase
    .from("bot_findings")
    .select("severity, status")
    .limit(1000);

  const errorCount = findingsSummary?.filter((f) => f.severity === "error" && f.status === "open").length || 0;
  const warningCount = findingsSummary?.filter((f) => f.severity === "warning" && f.status === "open").length || 0;
  const infoCount = findingsSummary?.filter((f) => f.severity === "info" && f.status === "open").length || 0;

  // Get recommendations summary
  const { data: recommendationsSummary } = await supabase
    .from("bot_recommendations")
    .select("kanban_column, status")
    .limit(1000);

  const nowCount = recommendationsSummary?.filter((r) => r.kanban_column === "Now" && r.status !== "completed").length || 0;
  const nextCount = recommendationsSummary?.filter((r) => r.kanban_column === "Next" && r.status !== "completed").length || 0;
  const laterCount = recommendationsSummary?.filter((r) => r.kanban_column === "Later" && r.status !== "completed").length || 0;

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("title")}
          </h1>
          <p className="admin-page-description">
            {t("description") || "Kod kalitesi, güvenlik, SEO, performans ve i18n kontrolleri"}
          </p>
        </div>
      </div>

      <ProjectBotOverview
        errorCount={errorCount}
        warningCount={warningCount}
        infoCount={infoCount}
        nowCount={nowCount}
        nextCount={nextCount}
        laterCount={laterCount}
        latestRuns={latestRuns || []}
      />

      <ProjectBotTabs defaultTab={tab || "findings"} locale={locale} />
    </div>
  );
}

