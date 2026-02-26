import { getTranslations, setRequestLocale } from "next-intl/server";
import { MfaSetup } from "@/components/admin/auth/MfaSetup";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "MFA Ayarları - Güvenlik",
    description: "İki Faktörlü Kimlik Doğrulama (2FA) Ayarları",
    robots: {
        index: false,
        follow: false,
    },
};

export default async function MfaSettingsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    let locale = 'tr';
    try {
        const paramsResult = await params;
        locale = paramsResult.locale || 'tr';
        setRequestLocale(locale);
    } catch (error) {
        console.error('Error in MFA Settings Page:', error);
    }

    return (
        <div className="admin-container responsive-padding space-section animate-fade-in max-w-4xl mx-auto">
            <div className="admin-page-header">
                <h1 className="admin-page-title text-2xl font-bold">Güvenlik ve İki Faktörlü Doğrulama</h1>
                <p className="admin-page-description text-muted-foreground mt-2">
                    Yönetici hesabınızın güvenliğini artırmak için iki faktörlü doğrulamayı etkinleştirin veya yönetin.
                    Sistem ayarları ve kullanıcı yönetimi gibi kritik işlemler için MFA zorunludur.
                </p>
            </div>

            <div className="mt-8">
                <MfaSetup />
            </div>
        </div>
    );
}
