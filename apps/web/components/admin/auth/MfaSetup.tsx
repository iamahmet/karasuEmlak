"use client";

import { useState, useEffect } from "react";
import { createClient } from "@karasu/lib/supabase/client";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input } from "@karasu/ui";
import { Shield, ShieldAlert, ShieldCheck, Key } from "lucide-react";
import { useRouter } from "next/navigation";

export function MfaSetup() {
    const [supabase] = useState(() => createClient());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [factorId, setFactorId] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const router = useRouter();

    useEffect(() => {
        checkMfaStatus();
    }, []);

    async function checkMfaStatus() {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            if (error) throw error;

            const hasMfaActive = data.currentLevel === 'aal2' || data.nextLevel === 'aal2';
            setMfaEnabled(hasMfaActive);

            if (!hasMfaActive) {
                await initiateMfaEnrollment();
            }
        } catch (err: any) {
            console.error("MFA check failed:", err);
            setError(err.message || "Could not load MFA status");
        } finally {
            setLoading(false);
        }
    }

    async function initiateMfaEnrollment() {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: "totp",
            });
            if (error) throw error;

            setFactorId(data.id);
            setQrCode(data.totp.qr_code);
        } catch (err: any) {
            setError(err.message || "Failed to initialize MFA");
        }
    }

    async function onVerify() {
        if (!factorId) return;
        setLoading(true);
        setError(null);
        try {
            const challenge = await supabase.auth.mfa.challenge({ factorId });
            if (challenge.error) throw challenge.error;

            const verify = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challenge.data.id,
                code: verifyCode,
            });

            if (verify.error) throw verify.error;

            setMfaEnabled(true);
            router.refresh();

            // Optionally redirect to dashboard
            // router.push("/tr/admin/dashboard");
        } catch (err: any) {
            setError(err.message || "Invalid verification code");
        } finally {
            setLoading(false);
        }
    }

    async function onUnenroll() {
        if (!confirm("Are you sure you want to disable Two-Factor Authentication? This is not recommended for admin users.")) {
            return;
        }

        setLoading(true);
        try {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            if (factors && factors.totp.length > 0) {
                for (const factor of factors.totp) {
                    await supabase.auth.mfa.unenroll({ factorId: factor.id });
                }
            }
            setMfaEnabled(false);
            await initiateMfaEnrollment();
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to disable MFA");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {mfaEnabled ? (
                        <ShieldCheck className="h-5 w-5 text-green-500" />
                    ) : (
                        <ShieldAlert className="h-5 w-5 text-amber-500" />
                    )}
                    İki Faktörlü Doğrulama (2FA)
                </CardTitle>
                <CardDescription>
                    Yönetici hesabınızın güvenliğini artırmak için iki faktörlü doğrulamayı kullanın.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-3 mb-4 rounded bg-destructive/10 text-destructive text-sm">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-8">
                        <span className="animate-spin text-2xl">⏳</span>
                    </div>
                ) : mfaEnabled ? (
                    <div className="space-y-4 text-center py-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-medium text-green-700 dark:text-green-500">2FA Etkin</h3>
                        <p className="text-sm text-muted-foreground">
                            Hesabınız başarıyla iki faktörlü doğrulama ile güvence altına alındı. Tüm yetkili admin işlemleri koruma altında.
                        </p>
                        <Button variant="outline" onClick={onUnenroll} className="mt-4 text-destructive hover:text-destructive">
                            2FA Devre Dışı Bırak
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                            1. Google Authenticator veya Authy gibi bir uygulama indirin.
                            <br />
                            2. Aşağıdaki QR kodu uygulamanızla tarayın.
                        </div>

                        {qrCode && (
                            <div className="bg-white p-2 rounded-lg inline-block mx-auto border" dangerouslySetInnerHTML={{ __html: qrCode }} />
                        )}

                        <div className="space-y-2 mt-4">
                            <label htmlFor="verifyCode" className="text-sm font-medium">
                                Doğrulama Kodu
                            </label>
                            <div className="relative">
                                <Input
                                    id="verifyCode"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value)}
                                    placeholder="000 000"
                                    className="pl-9 tracking-widest"
                                    maxLength={6}
                                />
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
            {!mfaEnabled && !loading && (
                <CardFooter>
                    <Button onClick={onVerify} disabled={verifyCode.length < 6 || loading} className="w-full">
                        Kodu Doğrula ve Etkinleştir
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
