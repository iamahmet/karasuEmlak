import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect") || "/tr/dashboard";
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/tr/login?error=${encodeURIComponent(error)}`, requestUrl.origin)
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
        return NextResponse.redirect(
          new URL(`/tr/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      }

      if (data.user) {
        console.log("User authenticated:", data.user.email);
        // Successfully authenticated, redirect to dashboard
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
      }
    } catch (err: any) {
      console.error("Callback error:", err);
      return NextResponse.redirect(
        new URL(`/tr/login?error=${encodeURIComponent(err.message)}`, requestUrl.origin)
      );
    }
  }

  // No code, redirect to login
  return NextResponse.redirect(new URL("/tr/login?error=no_code", requestUrl.origin));
}
