import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import type { Metadata } from "next";
import { AuditLogsTable } from "@/components/audit-logs/AuditLogsTable";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "Admin panel aktivite logları",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuditLogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  await setRequestLocale(locale);
  const t = await getTranslations("admin");

  const resolvedSearchParams = await searchParams;
  const userId = resolvedSearchParams.userId as string | undefined;
  const action = resolvedSearchParams.action as string | undefined;
  const resourceType = resolvedSearchParams.resourceType as string | undefined;
  const startDate = resolvedSearchParams.startDate as string | undefined;
  const endDate = resolvedSearchParams.endDate as string | undefined;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">
          Tüm admin panel aktivitelerini görüntüleyin ve filtreleyin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivite Logları</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditLogsTable
            initialFilters={{
              userId,
              action,
              resourceType,
              startDate: startDate ? new Date(startDate) : undefined,
              endDate: endDate ? new Date(endDate) : undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
