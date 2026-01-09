import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// import { requireStaff } from "@/lib/auth/server";

/**
 * User Role Management API
 * Add or remove roles from a user
 * Uses role_id from roles table, not direct role name
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
    const { role, roleName, action } = body;

    // Support both 'role' and 'roleName' for backward compatibility
    const roleToUse = roleName || role;

    if (!roleToUse || !["admin", "staff", "editor", "viewer"].includes(roleToUse)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: admin, staff, editor, viewer" },
        { status: 400 }
      );
    }

    if (!action || !["add", "remove"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'add' or 'remove'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First, get the role_id from roles table
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleToUse)
      .single();

    if (roleError || !roleData) {
      return NextResponse.json(
        { error: `Role '${roleToUse}' not found in database` },
        { status: 404 }
      );
    }

    const roleId = roleData.id;

    if (action === "add") {
      // Check if role already exists
      const { data: existing } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", id)
        .eq("role_id", roleId)
        .single();

      if (existing) {
        return NextResponse.json(
          { success: true, message: "Role already assigned" },
          { status: 200 }
        );
      }

      // Insert new role
      const { error } = await supabase.from("user_roles").insert({
        user_id: id,
        role_id: roleId,
      });

      if (error) {
        console.error("Failed to add role:", error);
        return NextResponse.json(
          { error: error.message || "Failed to add role" },
          { status: 500 }
        );
      }
    } else if (action === "remove") {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", id)
        .eq("role_id", roleId);

      if (error) {
        console.error("Failed to remove role:", error);
        return NextResponse.json(
          { error: error.message || "Failed to remove role" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Role ${action === "add" ? "added" : "removed"} successfully`,
    });
  } catch (error: any) {
    console.error("Failed to update user role:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}

