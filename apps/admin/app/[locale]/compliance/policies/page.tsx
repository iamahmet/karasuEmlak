/**
 * Compliance Center - Policy Management
 * Manage KVKK/GDPR/Cookie/Privacy policies (multi-language, versioned)
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PolicyManager } from "@/components/compliance/PolicyManager";

export default async function PoliciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  // Development mode: Skip auth check
  // await requireStaff();
  const t = await getTranslations({ locale, namespace: "compliance" });

  const supabase = await createClient();

  // Get all policies
  const { data: policies } = await supabase
    .from("policies")
    .select("*")
    .order("type, version DESC, locale");

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      {/* Header - Enhanced Modern */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/40 rounded-full opacity-50"></div>
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2 tracking-tight">
            {t("policies.title")}
          </h1>
          <p className="text-design-gray dark:text-gray-400 text-sm md:text-base font-body font-medium">
            {t("policies.description") || "KVKK/GDPR/Cookie/Gizlilik politikalarını yönetin"}
          </p>
        </div>
      </div>

      <PolicyManager policies={policies || []} />
    </div>
  );
}

