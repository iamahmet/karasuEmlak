import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/server";

import { requireStaff } from "@/lib/auth/server";
export async function GET(request: NextRequest) {
  try {
    await requireStaff();
    const supabase = await createClient();
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `/tr/integrations/google?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect("/tr/integrations/google?error=no_code");
    }

    // Exchange code for tokens (in production, use Google OAuth library)
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/google/oauth/callback`;

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return NextResponse.redirect("/tr/integrations/google?error=token_failed");
    }

    // Save integration account
    await supabase.from("integration_accounts").insert({
      provider: "google",
      service_type: "gsc", // Determine from scopes
      user_id: user?.id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      status: "active",
    });

    return NextResponse.redirect("/tr/integrations/google?success=true");
  } catch (error: any) {
    return NextResponse.redirect(
      `/tr/integrations/google?error=${encodeURIComponent(error.message)}`
    );
  }
}

