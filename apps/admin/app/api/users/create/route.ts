import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// import { requireStaff } from "@/lib/auth/server";

/**
 * Create User API
 * Create a new user account with email/password or magic link
 */
export async function POST(request: NextRequest) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const body = await request.json();
    const { email, password, name, role, sendMagicLink } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

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

    let userData: any;

    if (sendMagicLink) {
      // Create user with magic link
      const { data, error } = await adminSupabase.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
        },
      });

      if (error) {
        const { handleAPIError, getUserFriendlyMessage, logError } = await import("@/lib/errors/handle-api-error");
        logError(error, "POST /api/users/create (magic link)");
        const errorInfo = handleAPIError(error);
        return NextResponse.json(
          { error: getUserFriendlyMessage(errorInfo), code: errorInfo.code },
          { status: errorInfo.statusCode }
        );
      }

      userData = data.user;
    } else {
      // Create user with password
      if (!password) {
        return NextResponse.json(
          { error: "Password is required when not using magic link" },
          { status: 400 }
        );
      }

      const { data, error } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: name || email.split("@")[0],
        },
      });

      if (error) {
        const { handleAPIError, getUserFriendlyMessage, logError } = await import("@/lib/errors/handle-api-error");
        logError(error, "POST /api/users/create (password)");
        const errorInfo = handleAPIError(error);
        return NextResponse.json(
          { error: getUserFriendlyMessage(errorInfo), code: errorInfo.code },
          { status: errorInfo.statusCode }
        );
      }

      userData = data.user;
    }

    // Update profile if name provided
    const supabase = await createClient();
    if (name && userData.id) {
      await supabase
        .from("profiles")
        .update({ name })
        .eq("id", userData.id);
    }

    // Assign role if provided (skip if empty string or undefined)
    if (role && role !== "none" && userData.id) {
      const { data: roleData, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", role)
        .single();

      if (roleError) {
        console.warn("Failed to fetch role:", roleError.message);
      } else if (roleData) {
        const { error: insertError } = await supabase.from("user_roles").insert({
          user_id: userData.id,
          role_id: roleData.id,
        });

        if (insertError) {
          console.warn("Failed to assign role:", insertError.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: userData,
      message: sendMagicLink
        ? "Magic link sent to user email"
        : "User created successfully",
    });
  } catch (error: unknown) {
    const { handleAPIError, getUserFriendlyMessage, logError } = await import("@/lib/errors/handle-api-error");
    logError(error, "POST /api/users/create");
    const errorInfo = handleAPIError(error);
    return NextResponse.json(
      { error: getUserFriendlyMessage(errorInfo), code: errorInfo.code },
      { status: errorInfo.statusCode }
    );
  }
}

