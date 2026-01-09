/**
 * Compliance Center - Consent Management
 * Configure consent banner, preference center, and consent purposes
 */

import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ConsentConfig } from "@/components/compliance/ConsentConfig";
import { ConsentStats } from "@/components/compliance/ConsentStats";

export default async function ConsentManagementPage({
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

  // Get active policies
  const { data: policies } = await supabase
    .from("policies")
    .select("*")
    .eq("status", "active")
    .order("effective_date", { ascending: false });

  // Get consent stats
  const { data: consents } = await supabase
    .from("consents")
    .select("granted, created_at")
    .limit(1000);

  const totalConsents = consents?.length || 0;
  const grantedConsents = consents?.filter((c) => c.granted).length || 0;
  const consentRate = totalConsents > 0 ? (grantedConsents / totalConsents) * 100 : 0;

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            {t("consent.title")}
          </h1>
          <p className="admin-page-description">
            {t("consent.description") || "KVKK/GDPR uyumluluk yönetimi ve onay yapılandırması"}
          </p>
        </div>
      </div>

      <ConsentStats
        totalConsents={totalConsents}
        grantedConsents={grantedConsents}
        consentRate={consentRate}
      />

      <ConsentConfig policies={policies || []} />
    </div>
  );
}

