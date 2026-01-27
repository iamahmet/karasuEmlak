import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get admin URL for redirects
 */
function getAdminUrl(): string {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (adminUrl) {
    return adminUrl;
  }
  
  // Fallback: construct from site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
  if (siteUrl.includes("www.")) {
    return siteUrl.replace("www.", "admin.");
  }
  if (siteUrl.includes("karasuemlak.net")) {
    return "https://admin.karasuemlak.net";
  }
  
  return "http://localhost:3001";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect") || "/tr/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorCode = requestUrl.hash.includes("otp_expired") ? "otp_expired" : null;

  // Handle OTP expired error - redirect to login with message
  if (error || errorCode === "otp_expired") {
    const adminUrl = getAdminUrl();
    const errorMessage = errorCode === "otp_expired" 
      ? "Email link süresi dolmuş. Lütfen şifrenizle giriş yapın."
      : error || "Bir hata oluştu";
    return NextResponse.redirect(
      new URL(`/tr/login?error=${encodeURIComponent(errorMessage)}`, adminUrl)
    );
  }

  if (code) {
    try {
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                );
              } catch {
                // Cookie setting might fail in some contexts
              }
            },
          },
        }
      );

      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Exchange error:", exchangeError);
        const adminUrl = getAdminUrl();
        
        // Handle PKCE code verifier error specifically
        const isPKCEError = exchangeError.message?.includes('code verifier') || 
                           exchangeError.message?.includes('PKCE');
        
        let errorMessage = exchangeError.message;
        if (isPKCEError) {
          errorMessage = "Güvenlik doğrulaması başarısız. Bu genellikle email linkinin farklı bir tarayıcıda açılması veya tarayıcı verilerinin temizlenmesi durumunda olur. Lütfen yeni bir magic link isteyin.";
        }
        
        return NextResponse.redirect(
          new URL(`/tr/login?error=${encodeURIComponent(errorMessage)}`, adminUrl)
        );
      }

      if (data.user) {
        console.log("User authenticated:", data.user.email);
        // Successfully authenticated, redirect to admin subdomain
        const adminUrl = getAdminUrl();
        const redirectUrl = new URL(redirectTo, adminUrl);
        console.log("Redirecting to:", redirectUrl.toString());
        return NextResponse.redirect(redirectUrl);
      }
    } catch (err: any) {
      console.error("Callback error:", err);
      const adminUrl = getAdminUrl();
      return NextResponse.redirect(
        new URL(`/tr/login?error=${encodeURIComponent(err.message)}`, adminUrl)
      );
    }
  }

  // No code, redirect to login
  const adminUrl = getAdminUrl();
  return NextResponse.redirect(new URL("/tr/login?error=no_code", adminUrl));
}
