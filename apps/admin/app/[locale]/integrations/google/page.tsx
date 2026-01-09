/**
 * Google Integrations
 * GSC/GA4 OAuth wizard, daily sync, dashboards
 */

import { getTranslations, setRequestLocale } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { GoogleIntegrationWizard } from "@/components/integrations/GoogleIntegrationWizard";
import { GoogleIntegrationStatus } from "@/components/integrations/GoogleIntegrationStatus";

export default async function GoogleIntegrationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);
  
  // Development mode: Skip auth check
  // await requireStaff();
  
  const t = await getTranslations({ locale, namespace: "integrations" });

  const supabase = await createClient();

  // Get integration accounts
  const { data: accounts } = await supabase
    .from("integration_accounts")
    .select("*")
    .eq("provider", "google")
    .order("created_at", { ascending: false });

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("google.title")}
          </h1>
          <p className="admin-page-description">
            {t("google.description") || "Google Search Console ve Google Analytics 4 entegrasyonları"}
          </p>
        </div>
      </div>

      <GoogleIntegrationStatus accounts={accounts || []} />

      <GoogleIntegrationWizard />
    </div>
  );
}

