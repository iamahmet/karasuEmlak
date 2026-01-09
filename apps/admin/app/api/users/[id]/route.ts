import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// import { requireStaff } from "@/lib/auth/server";

/**
 * User Management API
 * Get, update, or delete a specific user
 */
export async function GET(
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

    // Create admin client for auth operations
    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const adminSupabase = createAdminClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Use service client for database queries (admin API)
    const { createServiceClient } = await import("@karasu/lib/supabase/service");
    const dbSupabase = createServiceClient();

    // Get user from auth
    const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(id);

    if (authError || !authUser?.user) {
      console.error("Failed to fetch user from auth:", authError?.message);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get profile
    const { data: profile } = await dbSupabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    // Get roles with join to roles table
    const { data: userRoles } = await dbSupabase
      .from("user_roles")
      .select(`
        role_id,
        roles:role_id (
          id,
          name
        )
      `)
      .eq("user_id", id);

    // Extract role names
    const roles = userRoles?.map((ur: any) => ur.roles?.name || ur.role_id).filter(Boolean) || [];

    return NextResponse.json({
      success: true,
      user: {
        ...authUser.user,
        profile,
        roles: roles,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { id } = await params;
    
    // Use service client for database operations (admin API)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Service role key or Supabase URL not configured" },
        { status: 500 }
      );
    }

    const { createClient: createAdminClient } = await import("@supabase/supabase-js");
    const adminSupabase = createAdminClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Delete user roles first
    await adminSupabase.from("user_roles").delete().eq("user_id", id);

    // Delete profile
    await adminSupabase.from("profiles").delete().eq("id", id);

    // Delete user from auth
    const { error } = await adminSupabase.auth.admin.deleteUser(id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

