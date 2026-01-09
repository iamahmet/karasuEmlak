import { NextRequest, NextResponse } from "next/server";

import { requireStaff } from "@/lib/auth/server";
export async function POST(request: NextRequest) {
  try {
    await requireStaff();
    const body = await request.json();
    const { service } = body;

    // Generate OAuth URL (in production, use Google OAuth library)
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/integrations/google/oauth/callback`;
    const scopes = service === "gsc"
      ? "https://www.googleapis.com/auth/webmasters.readonly"
      : service === "ga4"
      ? "https://www.googleapis.com/auth/analytics.readonly"
      : "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly";

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`;

    return NextResponse.json({ authUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

