import { setRequestLocale } from "next-intl/server";
import { AuditLogViewer } from "@/components/admin/security/AuditLogViewer";
import { getAuditLogs } from "@karasu/lib/audit";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Güvenlik - Audit Logları",
    description: "Admin panel güvenlik denetim kayıtları",
    robots: { index: false, follow: false },
};

export default async function AuditLogsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    let locale = "tr";
    try {
        const p = await params;
        locale = p.locale || "tr";
        setRequestLocale(locale);
    } catch (e) {
        console.error("Locale error:", e);
    }

    // Fetch initial logs server-side for SSR
    const initialLogs = await getAuditLogs({ limit: 50 });

    return (
        <div className="admin-container responsive-padding space-section animate-fade-in max-w-6xl mx-auto">
            <div className="admin-page-header mb-8">
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50" />
                    <h1 className="admin-page-title text-2xl font-bold">Güvenlik Denetim Kayıtları</h1>
                    <p className="admin-page-description text-muted-foreground mt-1">
                        Tüm yönetici işlemlerinin izlenebilir kaydı. Filtreleme, arama ve CSV dışa aktarma desteklenir.
                    </p>
                </div>
            </div>

            <AuditLogViewer initialLogs={initialLogs as any} />
        </div>
    );
}
