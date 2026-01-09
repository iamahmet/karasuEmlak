/**
 * Compliance Center - Consent Logs
 * View consent history and logs
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/admin/supabase/server";
import { ConsentLogsViewer } from "@/components/admin/compliance/ConsentLogsViewer";

export default async function ConsentLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; subject?: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  const { page, subject } = await searchParams;
  // Development mode: Skip auth check
  // await requireStaff();
  const t = await getTranslations({ locale, namespace: "compliance" });

  const supabase = await createClient();

  const pageNum = parseInt(page || "1");
  const limit = 50;
  const offset = (pageNum - 1) * limit;

  let query = supabase.from("consents").select("*", { count: "exact" });

  if (subject) {
    query = query.eq("subject_id", subject);
  }

  const { data: logs, error: _error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      {/* Header - Enhanced Modern */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight">
            {t("logs.title")}
          </h1>
          <p className="text-design-gray dark:text-gray-400 text-sm md:text-base font-body font-medium">
            {t("logs.description") || "Onay geçmişi ve log kayıtlarını görüntüleyin"}
          </p>
        </div>
      </div>

      <ConsentLogsViewer
        logs={logs || []}
        totalCount={count || 0}
        currentPage={pageNum}
        limit={limit}
        subjectFilter={subject}
      />
    </div>
  );
}

