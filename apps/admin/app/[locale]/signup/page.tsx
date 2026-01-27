"use client";

import { useState, useMemo, useEffect } from "react";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@karasu/ui";
import { createClient, isSupabaseConfigured } from "@karasu/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, UserPlus, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getAdminUrl } from "@/lib/utils/get-admin-url";

// Force dynamic rendering - this page requires runtime environment variables
export const dynamic = 'force-dynamic';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if Supabase is configured
  const isConfigured = useMemo(() => isSupabaseConfigured(), []);

  // Create Supabase client with SSR support for PKCE
  // Use singleton client to prevent NavigatorLockAcquireTimeoutError
  const supabase = useMemo(() => {
    try {
      const client = createClient();
      if (!client || !client.auth) {
        console.error("Supabase client is invalid");
        return null;
      }
      return client;
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      return null;
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      if (!isConfigured || !supabase) {
        setCheckingAuth(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const redirectTo = searchParams.get("redirect") || "/tr/dashboard";
          router.replace(redirectTo);
        }
      } catch (err: any) {
        console.error("Auth check error:", err);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [router, searchParams, supabase, isConfigured]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır");
      setLoading(false);
      return;
    }

    try {
      if (!isConfigured || !supabase) {
        setError("Supabase yapılandırması eksik. Lütfen environment variables'ları kontrol edin.");
        setLoading(false);
        return;
      }

      const redirectTo = searchParams.get("redirect") || "/tr/dashboard";

      // Step 1: Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Don't require email confirmation - auto login instead
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error("Kullanıcı oluşturulamadı");
      }

      // Step 2: Auto-assign super_admin role for ahmettbulutt@gmail.com
      if (email === "ahmettbulutt@gmail.com") {
        try {
          await fetch(`/api/users/${signUpData.user.id}/role`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roleName: "super_admin",
              action: "add",
            }),
          });
        } catch (err) {
          console.error("Failed to assign super_admin role:", err);
        }
      }

      // Step 3: If session exists (email confirmation disabled), login directly
      if (signUpData.session) {
        setSuccess(true);
        // Redirect immediately to dashboard
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000);
        return;
      }

      // Step 4: If no session (email confirmation required), sign in with password
      // This will create a session even if email is not confirmed
      if (!supabase) {
        setError("Supabase client is not available");
        setLoading(false);
        return;
      }
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If sign in fails, still show success but redirect to login
        console.warn("Auto-login failed, user needs to login manually:", signInError);
        setSuccess(true);
        setTimeout(() => {
          router.push(`/tr/login?email=${encodeURIComponent(email)}&message=Kayıt başarılı. Lütfen giriş yapın.`);
        }, 2000);
        return;
      }

      // Step 5: Successfully logged in, redirect to dashboard
      if (signInData.session) {
        setSuccess(true);
        setTimeout(() => {
          router.push(redirectTo);
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
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
            <p className="text-sm text-muted-foreground font-medium">Kontrol ediliyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          {/* Logo - Modern Typography with Favicon */}
          <div className="inline-flex items-center justify-center mb-8">
            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              {/* Favicon as Logo Icon */}
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
              {/* Typography Logo */}
              <div className="flex flex-col items-start text-left">
                <span className="text-2xl font-display font-bold text-foreground leading-tight tracking-tight">
                  Karasu Emlak
                </span>
                <span className="text-xs text-muted-foreground leading-tight font-medium mt-0.5">
                  Gayrimenkul Danışmanlığı
                </span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-2 tracking-tight">
            Kayıt Ol
          </h1>
          <p className="text-muted-foreground text-base">Admin Panel Hesabı Oluştur</p>
        </div>

        {/* Signup Card */}
        <Card className="shadow-2xl border-border/40 bg-card/95 backdrop-blur-xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-display font-bold text-foreground">
              Yeni Hesap
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Admin panel erişimi için kayıt olun
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-1">
                        Kayıt başarılı!
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {email === "ahmettbulutt@gmail.com" 
                          ? "Superadmin rolü atandı. Dashboard'a yönlendiriliyorsunuz..."
                          : "Hesabınız oluşturuldu. Dashboard'a yönlendiriliyorsunuz..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    E-posta
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
                      disabled={loading}
                      className="pl-9 h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                    Şifre
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="En az 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                      className="pl-9 h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                    Şifre Tekrar
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Şifreyi tekrar girin"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
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
                      Kayıt yapılıyor...
                    </>
                  ) : (
                    <>
                      Kayıt Ol
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-border/40">
              <p className="text-sm text-center text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link 
                  href="/tr/login" 
                  className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1"
                >
                  Giriş yapın
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
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

