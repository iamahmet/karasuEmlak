"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@karasu/ui";
import { createClient, isSupabaseConfigured } from "@karasu/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, Mail, ArrowRight, Lock, AlertCircle, ExternalLink, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { brandAssetPath } from "@/lib/branding/assets";
import { getAdminUrl } from "@/lib/utils/get-admin-url";

export default function LoginPage() {
  const faviconImageSrc = brandAssetPath("/favicon.png");
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
  const [availableUsers, setAvailableUsers] = useState<Array<{ email: string; name?: string }>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  // Check if Supabase is configured
  const isConfigured = useMemo(() => isSupabaseConfigured(), []);
  const isConfigError = searchParams.get("error") === "config";

  // Use singleton client to prevent NavigatorLockAcquireTimeoutError
  const supabase = useMemo(() => {
    try {
      const client = createClient();
      // Double-check: client should never be null/undefined from createClient()
      if (!client) {
        console.error("CRITICAL: createClient returned null/undefined");
        // Return a safe fallback instead of null
        return {
          auth: {
            getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Client initialization failed' } }),
            signOut: () => Promise.resolve({ error: { message: 'Client initialization failed' } }),
            signInWithOtp: () => Promise.resolve({ error: { message: 'Client initialization failed' } }),
            signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Client initialization failed' } }),
            signUp: () => Promise.resolve({ data: null, error: { message: 'Client initialization failed' } }),
            exchangeCodeForSession: () => Promise.resolve({ data: null, error: { message: 'Client initialization failed' } }),
          },
          from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Client initialization failed' } }) }) }),
        } as any;
      }
      if (!client.auth) {
        console.error("CRITICAL: Supabase client missing auth property");
        // Return a safe fallback instead of null
        return {
          auth: {
            getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Client auth missing' } }),
            signOut: () => Promise.resolve({ error: { message: 'Client auth missing' } }),
            signInWithOtp: () => Promise.resolve({ error: { message: 'Client auth missing' } }),
            signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Client auth missing' } }),
            signUp: () => Promise.resolve({ data: null, error: { message: 'Client auth missing' } }),
            exchangeCodeForSession: () => Promise.resolve({ data: null, error: { message: 'Client auth missing' } }),
          },
          from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Client auth missing' } }) }) }),
        } as any;
      }
      return client;
    } catch (error: any) {
      console.error("Error creating Supabase client:", error?.message || error);
      // Return a safe fallback instead of null
      return {
        auth: {
          getUser: () => Promise.resolve({ data: { user: null }, error: { message: 'Client creation error' } }),
          signOut: () => Promise.resolve({ error: { message: 'Client creation error' } }),
          signInWithOtp: () => Promise.resolve({ error: { message: 'Client creation error' } }),
          signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Client creation error' } }),
          signUp: () => Promise.resolve({ data: null, error: { message: 'Client creation error' } }),
          exchangeCodeForSession: () => Promise.resolve({ data: null, error: { message: 'Client creation error' } }),
        },
        from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: null, error: { message: 'Client creation error' } }) }) }),
      } as any;
    }
  }, []);

  // Fetch available users for login
  useEffect(() => {
    async function fetchUsers() {
      if (!isConfigured) {
        setLoadingUsers(false);
        return;
      }

      try {
        setLoadingUsers(true);
        const response = await fetch("/api/users?limit=10");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.users) {
            const users = data.users
              .filter((u: any) => u.email)
              .map((u: any) => ({
                email: u.email,
                name: u.profile?.name || u.name || null,
              }))
              .slice(0, 5); // Show max 5 users
            setAvailableUsers(users);
          }
        }
      } catch (error) {
        // Silently fail - users list is optional
        console.warn("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchUsers();
  }, [isConfigured]);

  // Check if user is already logged in or handle callback
  useEffect(() => {
    async function checkAuth() {
      // Skip auth check if Supabase is not configured
      if (!isConfigured) {
        setCheckingAuth(false);
        return;
      }
      
      // supabase should never be null from useMemo, but check anyway
      if (!supabase || !supabase.auth) {
        console.error("Supabase client is invalid in checkAuth");
        setCheckingAuth(false);
        return;
      }

      try {
        // Check for callback code in URL (magic link)
        const code = searchParams.get("code");
        if (code) {
          // Exchange code for session (PKCE handled automatically by @supabase/ssr)
          if (!supabase.auth) {
            setError("Supabase yapılandırması eksik.");
            setCheckingAuth(false);
            return;
          }
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            setError(exchangeError.message);
            setCheckingAuth(false);
            return;
          }
          
          if (data.user) {
            const redirectTo = searchParams.get("redirect") || "/dashboard";
            window.history.replaceState({}, "", redirectTo);
            router.replace(redirectTo);
            return;
          }
        }
        
        // Check if already logged in
        if (!supabase.auth) {
          setCheckingAuth(false);
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const redirectTo = searchParams.get("redirect") || "/dashboard";
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
  }, [router, searchParams, supabase, isConfigured]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured || !supabase) {
      setError("Supabase yapılandırması eksik. Lütfen environment variables'ları kontrol edin.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      // Use admin URL instead of window.location.origin to ensure correct subdomain
      const adminUrl = getAdminUrl();
      const callbackUrl = `${adminUrl}/api/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
      
      console.log("Magic link callback URL:", callbackUrl);
      
      if (!supabase.auth) {
        setError("Supabase yapılandırması eksik.");
        setLoading(false);
        return;
      }
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl,
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
    
    if (!isConfigured || !supabase) {
      setError("Supabase yapılandırması eksik. Lütfen environment variables'ları kontrol edin.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!supabase.auth) {
        setError("Supabase yapılandırması eksik.");
        setLoading(false);
        return;
      }
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const redirectTo = searchParams.get("redirect") || "/dashboard";
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          {/* Logo Animation */}
          <div className="inline-flex items-center justify-center">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-lg animate-pulse">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src={faviconImageSrc}
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
                  src={faviconImageSrc}
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
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-base">Yönetim Sistemi</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-border/40 bg-card/95 backdrop-blur-xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl font-display font-bold text-foreground">
              {t("login")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Environment Variables Warning */}
            {(!isConfigured || isConfigError) && (
              <div className="mb-6 p-5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                      Supabase Yapılandırması Eksik
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-4 leading-relaxed">
                      Admin paneli çalışması için Supabase environment variables'ları eklenmelidir.
                    </p>
                    <div className="space-y-3 text-xs text-yellow-700 dark:text-yellow-400">
                      <div>
                        <p className="font-semibold mb-2">Gerekli Environment Variables:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li><code className="bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                          <li><code className="bg-yellow-100 dark:bg-yellow-900/30 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-yellow-200 dark:border-yellow-800">
                        <p className="font-semibold mb-2">Nasıl eklenir:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Vercel Dashboard → Admin Projesi → Settings → Environment Variables</li>
                          <li>Yukarıdaki environment variables'ları ekleyin</li>
                          <li>Redeploy yapın</li>
                        </ol>
                      </div>
                      <div className="pt-2 border-t border-yellow-200 dark:border-yellow-800">
                        <a
                          href="https://vercel.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 font-semibold transition-colors"
                        >
                          Vercel Dashboard'a Git
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auth Method Toggle */}
            <div className="flex gap-2 mb-6 p-1 bg-muted/50 rounded-xl border border-border/40">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("magic");
                  setError(null);
                  setPassword("");
                }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authMethod === "magic"
                    ? "bg-card text-foreground shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authMethod === "password"
                    ? "bg-card text-foreground shadow-sm border border-border/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                Şifre ile
              </button>
            </div>

            {success && authMethod === "magic" ? (
              <div className="space-y-4">
                <div className="p-5 rounded-xl bg-primary/10 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-1">
                        {t("magicLinkSent")}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t("magicLinkInstructions")}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-11 font-semibold"
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
                  <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                    {t("email")}
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

                {authMethod === "password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                      Şifre
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Şifrenizi girin"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-9 h-11 border-border/40 focus:border-primary focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

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
                      {authMethod === "magic" ? t("sending") : "Giriş yapılıyor..."}
                    </>
                  ) : (
                    <>
                      {authMethod === "magic" ? t("sendMagicLink") : "Giriş Yap"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-border/40 space-y-4">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                {authMethod === "magic"
                  ? "Magic link e-posta adresinize gönderilecektir. Link'e tıklayarak otomatik giriş yapabilirsiniz."
                  : "Hesabınız yok mu?"}
              </p>
                {authMethod === "password" && (
                <div className="space-y-2">
                  <p className="text-sm text-center">
                    <Link 
                      href="/tr/forgot-password" 
                      className="text-muted-foreground hover:text-primary font-medium transition-colors"
                    >
                      Şifremi unuttum
                    </Link>
                  </p>
                  <p className="text-sm text-center">
                    <span className="text-muted-foreground">Hesabınız yok mu? </span>
                    <Link 
                      href="/tr/signup" 
                      className="text-primary hover:text-primary/80 font-semibold transition-colors inline-flex items-center gap-1"
                    >
                      Kayıt olun
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </p>
                </div>
              )}

              {/* Available Users List */}
              {availableUsers.length > 0 && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowUsers(!showUsers)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm text-muted-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Mevcut Kullanıcılar ({availableUsers.length})</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${showUsers ? "rotate-90" : ""}`} />
                  </button>
                  {showUsers && (
                    <div className="space-y-1.5 pl-6">
                      {availableUsers.map((user, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setEmail(user.email);
                            setError(null);
                            setShowUsers(false);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary text-xs font-semibold">
                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              {user.name && (
                                <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                              )}
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
