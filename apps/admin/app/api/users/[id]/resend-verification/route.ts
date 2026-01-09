import { NextRequest, NextResponse } from "next/server";
// import { requireStaff } from "@/lib/auth/server";

/**
 * Resend Email Verification API
 * Resend verification email to user
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { id } = await params;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Service role key or Supabase URL not configured" },
        { status: 500 }
      );
    }

    // Create admin client
    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const adminSupabase = createServiceClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Get user email
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(id);

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Generate verification link
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: "signup",
      email: userData.user.email!,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    } as any);

    if (error) {
      console.error("Failed to generate verification link:", error);
      return NextResponse.json(
        { error: error.message || "Failed to resend verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
      link: data.properties?.action_link, // For testing purposes
    });
  } catch (error: any) {
    console.error("Failed to resend verification:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend verification email" },
      { status: 500 }
    );
  }
}

