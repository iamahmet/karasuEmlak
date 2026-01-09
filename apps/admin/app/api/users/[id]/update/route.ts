import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// import { requireStaff } from "@/lib/auth/server";

/**
 * Update User API
 * Update user profile, email, password, or metadata
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { id } = await params;
    const body = await request.json();
    const { email, password, name, avatar_url, metadata } = body;

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

    const updateData: any = {};

    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (metadata) updateData.user_metadata = metadata;

    // Update auth user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.updateUserById(
      id,
      updateData
    );

    if (authError) {
      console.error("Failed to update user:", authError);
      return NextResponse.json(
        { error: authError.message || "Failed to update user" },
        { status: 500 }
      );
    }

    // Update profile
    const supabase = await createClient();
    const profileUpdate: any = {};
    if (name !== undefined) profileUpdate.name = name;
    if (avatar_url !== undefined) profileUpdate.avatar_url = avatar_url;

    if (Object.keys(profileUpdate).length > 0) {
      await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", id);
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      message: "User updated successfully",
    });
  } catch (error: any) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

