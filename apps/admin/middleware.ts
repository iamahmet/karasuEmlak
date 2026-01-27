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
                   pathname.includes("/api/") ||
                   pathname.includes("/healthz");

  // Always check auth, even in development (but allow access if no user_roles table)
  if (!skipAuth) {
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (!user || authError) {
        const loginUrl = new URL(`/tr/login`, request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check staff role via user_roles table
      // Handle case where user_roles table might not exist
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", user.id);

      // If table doesn't exist, allow access in development only
      if (rolesError && (rolesError.code === "PGRST116" || rolesError.code === "42P01")) {
        if (isDevelopment) {
          console.warn("⚠️  user_roles table not found, allowing access in development");
          // In development, allow authenticated users even without roles table
        } else {
          console.error("❌ user_roles table not found in production");
          return NextResponse.redirect(new URL("/tr/login?error=unauthorized", request.url));
        }
      } else {
        // Check staff role only if roles table exists
        const isStaff = roles?.some(
          (ur: any) => ur.roles?.name === "super_admin" || ur.roles?.name === "admin" || ur.roles?.name === "staff"
        );

        // Allow access if:
        // 1. User has staff/admin role, OR
        // 2. User has no roles (new user - will be assigned role by superadmin), OR
        // 3. In development mode
        if (!isStaff && roles && roles.length > 0) {
          // User has roles but none are staff/admin (e.g., editor, viewer)
          // Allow access - they can view dashboard but with limited permissions
          console.log(`User ${user.email} has non-staff roles, allowing access`);
        } else if (!isStaff && (!roles || roles.length === 0)) {
          // No roles found - new user, allow access so superadmin can assign role
          console.log(`User ${user.email} has no roles yet, allowing access for role assignment`);
        }
        // If isStaff is true, user already has access, no need to check further
      }
    } catch (error) {
      console.error("Admin middleware auth error:", error);
      // Always redirect to login on error (even in development)
      return NextResponse.redirect(new URL("/tr/login?error=auth_error", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|healthz|.*\\..*).*)",
  ],
};
