/**
 * Assign Role Route
 * Automatically assigns admin role to first user in development
 * In production, this should be called manually or via admin panel
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a role
    const { data: existingRoles } = await supabase
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.id)
      .limit(1);

    if (existingRoles && existingRoles.length > 0) {
      return NextResponse.json({ message: "User already has a role" });
    }

    // Get admin role ID
    const { data: adminRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .single();

    if (!adminRole) {
      // Create admin role if it doesn't exist (development only)
      const { data: newRole, error: createError } = await supabase
        .from("roles")
        .insert({
          name: "admin",
          description: "Administrator role with full access",
          permissions: ["*"],
        })
        .select()
        .single();

      if (createError || !newRole) {
        return NextResponse.json(
          { error: "Failed to create admin role" },
          { status: 500 }
        );
      }

      // Assign role to user
      const { error: assignError } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role_id: newRole.id,
        });

      if (assignError) {
        return NextResponse.json(
          { error: "Failed to assign role" },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: "Admin role assigned" });
    }

    // Assign existing admin role to user
    const { error: assignError } = await supabase
      .from("user_roles")
      .insert({
        user_id: user.id,
        role_id: adminRole.id,
      });

    if (assignError) {
      return NextResponse.json(
        { error: "Failed to assign role" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Admin role assigned" });
  } catch (error: any) {
    console.error("Assign role error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

