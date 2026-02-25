"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@karasu/ui";
import { createClient, isSupabaseConfigured } from "@karasu/lib/supabase/client";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { brandAssetUrl } from "@/lib/branding/assets";
import { getAdminUrl } from "@/lib/utils/get-admin-url";

export default function ForgotPasswordPage() {
  const faviconImageSrc = brandAssetUrl("/favicon.png");
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if Supabase is configured
  const isConfigured = useMemo(() => isSupabaseConfigured(), []);

  // Use singleton client - always return a safe object with auth
  const supabase = useMemo(() => {
    const noop = (msg: string) => Promise.resolve({ data: null, error: { message: msg } });
    const fallback = {
      auth: {
        getUser: () => noop('Client not ready'),
        resetPasswordForEmail: () => noop('Client not ready'),
      },
    } as any;
    try {
      const client = createClient();
      if (!client || !client.auth) {
        return fallback;
      }
      return client;
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      return fallback;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured || !supabase || !supabase.auth) {
      setError("Supabase yapılandırması eksik. Lütfen yönetici ile iletişime geçin.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const adminUrl = getAdminUrl();
      const redirectUrl = `${adminUrl}/tr/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Şifre sıfırlama e-postası gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <div className="relative w-14 h-14 flex-shrink-0">
                <Image
                  src={faviconImageSrc}
                  alt="Karasu Emlak Logo"
                  width={56}
                  height={56}
                  className="object-contain drop-shadow-sm"
                  priority
                />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-2xl font-display font-bold text-foreground leading-tight tracking-tight">
                  Karasu Emlak
                </span>
                <span className="text-xs text-muted-foreground leading-tight font-medium mt-0.5">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
            Şifremi Unuttum
          </h1>
          <p className="text-muted-foreground text-base">
            Şifrenizi sıfırlamak için e-posta adresinizi girin
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-2xl border-border/40 bg-card/95 backdrop-blur-xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-xl font-display font-bold text-foreground">
              Şifre Sıfırlama
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Kayıtlı e-posta adresinize şifre sıfırlama linki göndereceğiz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Environment Variables Warning */}
            {!isConfigured && (
              <div className="mb-6 p-5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      Supabase Yapılandırması Eksik
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 leading-relaxed">
                      Bu özellik şu an kullanılamıyor. Lütfen yönetici ile iletişime geçin.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {success ? (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        E-posta Gönderildi!
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                        Şifre sıfırlama linki <strong>{email}</strong> adresine gönderildi.
                        Lütfen e-postanızı kontrol edin.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-11 font-semibold"
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                  >
                    Yeni E-posta Gönder
                  </Button>
                  <Button asChild variant="ghost" className="w-full h-11">
                    <Link href="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Giriş Sayfasına Dön
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    E-posta Adresi
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading || !isConfigured}
                      className="pl-9 h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading || !isConfigured}
                  className="w-full h-11 font-semibold gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      Şifre Sıfırlama Linki Gönder
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t border-border/40">
                  <Button asChild variant="ghost" className="w-full h-11">
                    <Link href="/login">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Giriş Sayfasına Dön
                    </Link>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2025 Karasu Emlak. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
