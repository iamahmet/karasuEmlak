"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@karasu/ui";
import { createClient, isSupabaseConfigured } from "@karasu/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);

  // Check if Supabase is configured
  const isConfigured = useMemo(() => isSupabaseConfigured(), []);

  // Use singleton client - always return a safe object with auth
  const supabase = useMemo(() => {
    const noop = (msg: string) => Promise.resolve({ data: null, error: { message: msg } });
    const fallback = {
      auth: {
        getUser: () => noop('Client not ready'),
        getSession: () => noop('Client not ready'),
        updateUser: () => noop('Client not ready'),
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

  // Validate the reset token/session
  useEffect(() => {
    async function validateSession() {
      if (!isConfigured || !supabase || !supabase.auth) {
        setValidating(false);
        setError("Supabase yapılandırması eksik.");
        return;
      }

      try {
        // Check if we have a valid session from the reset link
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Geçersiz veya süresi dolmuş şifre sıfırlama linki.");
          setIsValidSession(false);
        } else if (session) {
          setIsValidSession(true);
        } else {
          // Check URL for hash parameters (Supabase sends tokens in hash)
          const hash = window.location.hash;
          if (hash && hash.includes("access_token")) {
            // Let Supabase handle the hash
            const { data, error: hashError } = await supabase.auth.getUser();
            if (hashError || !data.user) {
              setError("Geçersiz veya süresi dolmuş şifre sıfırlama linki.");
              setIsValidSession(false);
            } else {
              setIsValidSession(true);
            }
          } else {
            setError("Geçersiz şifre sıfırlama linki. Lütfen yeni bir link isteyin.");
            setIsValidSession(false);
          }
        }
      } catch (err: any) {
        console.error("Validation error:", err);
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
        setIsValidSession(false);
      } finally {
        setValidating(false);
      }
    }

    validateSession();
  }, [isConfigured, supabase]);

  const validatePassword = (pass: string): string[] => {
    const errors: string[] = [];
    if (pass.length < 8) errors.push("En az 8 karakter olmalı");
    if (!/[A-Z]/.test(pass)) errors.push("En az bir büyük harf içermeli");
    if (!/[a-z]/.test(pass)) errors.push("En az bir küçük harf içermeli");
    if (!/[0-9]/.test(pass)) errors.push("En az bir rakam içermeli");
    return errors;
  };

  const passwordErrors = validatePassword(password);
  const isPasswordValid = password.length > 0 && passwordErrors.length === 0;
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured || !supabase || !supabase.auth) {
      setError("Supabase yapılandırması eksik.");
      return;
    }

    if (!isPasswordValid) {
      setError("Lütfen şifre gereksinimlerini karşılayın.");
      return;
    }

    if (!passwordsMatch) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.replace("/dashboard");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Şifre güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-lg animate-pulse">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/favicon.png"
                  alt="Karasu Emlak"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg font-display font-bold text-foreground leading-tight">Karasu Emlak</span>
                <span className="text-xs text-muted-foreground leading-tight">Admin Panel</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground font-medium">Link doğrulanıyor...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  src="/favicon.png"
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
            Yeni Şifre Belirle
          </h1>
          <p className="text-muted-foreground text-base">
            Hesabınız için yeni bir şifre oluşturun
          </p>
        </div>

        {/* Card */}
        <Card className="shadow-2xl border-border/40 bg-card/95 backdrop-blur-xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Şifre Güncelleme
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Güvenli bir şifre belirleyin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isValidSession && !success ? (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-destructive mb-1">Geçersiz Link</p>
                      <p className="text-sm text-destructive/80">
                        {error || "Bu şifre sıfırlama linki geçersiz veya süresi dolmuş."}
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full h-11 font-semibold">
                  <Link href="/tr/forgot-password">
                    Yeni Şifre Sıfırlama Linki İste
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11">
                  <Link href="/login">Giriş Sayfasına Dön</Link>
                </Button>
              </div>
            ) : success ? (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                        Şifre Güncellendi!
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-300 leading-relaxed">
                        Şifreniz başarıyla güncellendi. Dashboard'a yönlendiriliyorsunuz...
                      </p>
                    </div>
                  </div>
                </div>
                <Button asChild className="w-full h-11 font-semibold">
                  <Link href="/dashboard">Dashboard'a Git</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Yeni Şifre
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Yeni şifrenizi girin"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 pr-10 h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password Requirements */}
                  {password.length > 0 && (
                    <div className="space-y-1 text-xs">
                      {[
                        { check: password.length >= 8, text: "En az 8 karakter" },
                        { check: /[A-Z]/.test(password), text: "En az bir büyük harf" },
                        { check: /[a-z]/.test(password), text: "En az bir küçük harf" },
                        { check: /[0-9]/.test(password), text: "En az bir rakam" },
                      ].map((req, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-1.5 ${
                            req.check ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                          }`}
                        >
                          {req.check ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-current" />
                          )}
                          {req.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                    Şifre Tekrar
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Şifrenizi tekrar girin"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 pr-10 h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div
                      className={`flex items-center gap-1.5 text-xs ${
                        passwordsMatch ? "text-green-600 dark:text-green-400" : "text-destructive"
                      }`}
                    >
                      {passwordsMatch ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Şifreler eşleşiyor
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Şifreler eşleşmiyor
                        </>
                      )}
                    </div>
                  )}
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
                  disabled={loading || !isPasswordValid || !passwordsMatch}
                  className="w-full h-11 font-semibold gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      Şifreyi Güncelle
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
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
