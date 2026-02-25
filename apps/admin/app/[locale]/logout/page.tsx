"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@karasu/lib/supabase/client";
import Image from "next/image";
import { LogOut, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@karasu/ui";
import Link from "next/link";
import { brandAssetUrl } from "@/lib/branding/assets";

export default function LogoutPage() {
  const faviconImageSrc = brandAssetUrl("/favicon.png");
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    async function performLogout() {
      try {
        const supabase = createClient();
        
        if (!supabase || !supabase.auth) {
          console.warn("Supabase client not available, redirecting to login");
          setStatus("success");
          return;
        }

        const { error: signOutError } = await supabase.auth.signOut();
        
        if (signOutError) {
          console.error("Logout error:", signOutError);
          // Still consider it a success - user will be logged out on client side
          setStatus("success");
          return;
        }

        setStatus("success");
      } catch (err: any) {
        console.error("Logout error:", err);
        setError(err.message || "Çıkış yapılırken bir hata oluştu");
        setStatus("error");
      }
    }

    performLogout();
  }, []);

  // Countdown and redirect after successful logout
  useEffect(() => {
    if (status !== "success") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.replace("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, router]);

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

      <div className="w-full max-w-md relative z-10 text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center mb-8">
          <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/40 shadow-xl">
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

        {/* Status Card */}
        <div className="bg-card/95 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl p-8">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Çıkış Yapılıyor...
              </h1>
              <p className="text-muted-foreground">
                Lütfen bekleyin, oturumunuz kapatılıyor.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Çıkış Yapıldı
              </h1>
              <p className="text-muted-foreground">
                Oturumunuz başarıyla kapatıldı.
              </p>
              <div className="pt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {countdown} saniye içinde giriş sayfasına yönlendirileceksiniz...
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    <LogOut className="h-4 w-4 mr-2" />
                    Hemen Giriş Sayfasına Git
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                Hata Oluştu
              </h1>
              <p className="text-muted-foreground">
                {error || "Çıkış yapılırken bir sorun oluştu."}
              </p>
              <div className="pt-4 space-y-3">
                <Button asChild className="w-full">
                  <Link href="/login">
                    <LogOut className="h-4 w-4 mr-2" />
                    Giriş Sayfasına Git
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.reload()}
                >
                  Tekrar Dene
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2025 Karasu Emlak. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
