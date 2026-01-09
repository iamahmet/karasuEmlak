import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Check if request is coming from admin subdomain
  // In development, allow localhost:3001, in production check for admin.* subdomain
  const isAdminSubdomain = 
    process.env.NODE_ENV === 'development' 
      ? hostname.includes('localhost:3001') || hostname.includes('127.0.0.1:3001')
      : hostname.startsWith('admin.') || hostname.includes('.admin.');
  
  // If not admin subdomain, redirect to main site (optional - can be removed if you want separate domains)
  if (!isAdminSubdomain && process.env.NODE_ENV === 'production') {
    const mainDomain = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karasuemlak.net';
    return NextResponse.redirect(new URL(mainDomain));
  }

  // Skip middleware for healthz endpoint (must be ultra-light, no i18n)
  if (pathname === "/healthz") {
    return NextResponse.next();
  }

  // Handle i18n first
  const response = intlMiddleware(request);

  // Auth check for admin routes (except login, signup, and auth callback)
  // DEVELOPMENT MODE: Temporarily disabled for easier development
  const isDevelopment = process.env.NODE_ENV === "development";
  const skipAuth = pathname.includes("/login") || 
                   pathname.includes("/signup") || 
                   pathname.includes("/auth") || 
                   pathname.includes("/api/auth/callback");

  if (!skipAuth && !isDevelopment) {
    let supabase;
    try {
      supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            },
          },
        }
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const loginUrl = new URL(`/tr/login`, request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check staff role via user_roles table
      const { data: roles } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", user.id);

      const isStaff = roles?.some(
        (ur: any) => ur.roles?.name === "admin" || ur.roles?.name === "staff"
      );

      if (!isStaff) {
        return NextResponse.redirect(new URL("/tr/login?error=unauthorized", request.url));
      }

      // Check MFA requirement for admin users (if enabled in settings)
      // In production, verify MFA status from user profile or auth metadata
      // For now, skip MFA check in development mode
      if (process.env.NODE_ENV === "production") {
        // TODO: Implement MFA verification
        // const { data: settings } = await supabase
        //   .from("site_settings")
        //   .select("two_factor_enabled")
        //   .single();
        // if (settings?.two_factor_enabled) {
        //   // Verify MFA token or redirect to MFA setup
        // }
      }
      // For now, MFA check is documented but not enforced
      // In production, implement MFA check here
    } catch (error) {
      console.error("Admin middleware auth error:", error);
      return NextResponse.redirect(new URL("/tr/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|healthz|.*\\..*).*)",
  ],
  // Skip middleware in development for easier testing
  // Set NODE_ENV=production to enable auth checks
  // healthz is excluded from matcher for instant response
};

