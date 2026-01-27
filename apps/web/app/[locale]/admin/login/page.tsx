"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, Mail, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMethod, setAuthMethod] = useState<"magic" | "password">("magic");

  // Use singleton client to prevent NavigatorLockAcquireTimeoutError
  const supabase = useMemo(() => {
    return createClient();
  }, []);

  // Check if user is already logged in or handle callback
  useEffect(() => {
    async function checkAuth() {
      try {
        if (!supabase) {
          setError('Supabase client not available');
          setCheckingAuth(false);
          return;
        }
        // Check for callback code in URL (magic link)
        const code = searchParams.get("code");
        if (code) {
          // Exchange code for session (PKCE handled automatically by @supabase/ssr)
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            setError(exchangeError.message);
            setCheckingAuth(false);
            return;
          }
          
          if (data.user) {
            const redirectTo = searchParams.get("redirect") || "/tr/admin/dashboard";
            window.history.replaceState({}, "", redirectTo);
            router.replace(redirectTo);
            return;
          }
        }
        
        // Check if already logged in
        if (!supabase) {
          setCheckingAuth(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const redirectTo = searchParams.get("redirect") || "/tr/admin/dashboard";
          router.replace(redirectTo);
        }
      } catch (err: any) {
        console.error("Auth check error:", err);
        // Don't show error on initial check, just continue to login form
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router, searchParams, supabase]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      const redirectTo = searchParams.get("redirect") || "/tr/admin/dashboard";
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/tr/admin/login?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (otpError) throw otpError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const redirectTo = searchParams.get("redirect") || "/tr/admin/dashboard";
        router.replace(redirectTo);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <LayoutDashboard className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Karasu Emlak Yönetim Sistemi</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t("login")}</CardTitle>
            <CardDescription>
              Hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Auth Method Toggle */}
            <div className="flex gap-2 mb-4 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("magic");
                  setError(null);
                  setPassword("");
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMethod === "magic"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Magic Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("password");
                  setError(null);
                  setSuccess(false);
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  authMethod === "password"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Şifre ile
              </button>
            </div>

            {success && authMethod === "magic" ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        {t("magicLinkSent")}
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {t("magicLinkInstructions")}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                >
                  Yeni Link İste
                </Button>
              </div>
            ) : (
              <form
                onSubmit={authMethod === "magic" ? handleMagicLink : handlePasswordLogin}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9"
                    />
                  </div>
                </div>

                {authMethod === "password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Şifrenizi girin"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      {authMethod === "magic" ? t("sending") : "Giriş yapılıyor..."}
                    </>
                  ) : (
                    <>
                      {authMethod === "magic" ? t("sendMagicLink") : "Giriş Yap"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                {authMethod === "magic"
                  ? "Magic link e-posta adresinize gönderilecektir. Link'e tıklayarak otomatik giriş yapabilirsiniz."
                  : "Hesabınız yok mu?"}
              </p>
              {authMethod === "password" && (
                <p className="text-sm text-center">
                  <Link href="/tr/admin/signup" className="text-primary hover:underline font-medium">
                    Kayıt olun
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2025 Karasu Emlak. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
