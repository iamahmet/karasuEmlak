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
  const isAdminSubdomain =
    process.env.NODE_ENV === 'development'
      ? hostname.includes('localhost:3001') || hostname.includes('127.0.0.1:3001')
      : hostname.startsWith('admin.') || hostname.includes('.admin.');

  // If not admin subdomain, redirect to main site
  if (!isAdminSubdomain && process.env.NODE_ENV === 'production') {
    const mainDomain = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.karasuemlak.net';
    return NextResponse.redirect(new URL(mainDomain));
  }

  // Skip middleware for healthz endpoint
  if (pathname === "/healthz") {
    return NextResponse.next();
  }

  // Handle i18n first
  let response = intlMiddleware(request);

  // Auth check for admin routes (except login, signup, and auth callback)
  const isDevelopment = process.env.NODE_ENV === "development";
  const skipAuth = pathname.includes("/login") ||
                   pathname.includes("/signup") ||
                   pathname.includes("/auth") ||
                   pathname.includes("/api/");

  if (!skipAuth && !isDevelopment) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
              cookiesToSet.forEach(({ name, value, options }) => {
                request.cookies.set(name, value);
                response.cookies.set(name, value, options);
              });
            },
          },
        }
      );

      // Refresh session - this updates cookies
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user || error) {
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
        (ur: any) => ur.roles?.name === "super_admin" || ur.roles?.name === "admin" || ur.roles?.name === "staff"
      );

      if (!isStaff) {
        return NextResponse.redirect(new URL("/tr/login?error=unauthorized", request.url));
      }
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
};
