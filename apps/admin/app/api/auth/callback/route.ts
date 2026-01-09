import { createClient } from "@/lib/supabase/server";
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
      const supabase = await createClient();
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        return NextResponse.redirect(
          new URL(`/tr/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      }

      if (data.user) {
        // In development, automatically assign admin role if user doesn't have one
        if (process.env.NODE_ENV === "development") {
          const { data: existingRoles } = await supabase
            .from("user_roles")
            .select("role_id")
            .eq("user_id", data.user.id)
            .limit(1);

          if (!existingRoles || existingRoles.length === 0) {
            // Get or create admin role
            let { data: adminRole } = await supabase
              .from("roles")
              .select("id")
              .eq("name", "admin")
              .single();

            if (!adminRole) {
              const { data: newRole } = await supabase
                .from("roles")
                .insert({
                  name: "admin",
                  description: "Administrator role with full access",
                  permissions: ["*"],
                })
                .select()
                .single();
              adminRole = newRole;
            }

            if (adminRole) {
              await supabase.from("user_roles").insert({
                user_id: data.user.id,
                role_id: adminRole.id,
              });
            }
          }
        }

        // Successfully authenticated, redirect to dashboard
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
      }
    } catch (err: any) {
      return NextResponse.redirect(
        new URL(`/tr/login?error=${encodeURIComponent(err.message)}`, requestUrl.origin)
      );
    }
  }

  // No code, redirect to login
  return NextResponse.redirect(new URL("/tr/login?error=no_code", requestUrl.origin));
}

