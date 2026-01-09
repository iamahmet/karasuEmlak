import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Ban/Unban User API
 * Ban or unban a user account
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Development mode: Skip auth check
    // await requireStaff();

    const { id } = await params;
    const { action } = await request.json(); // "ban" or "unban"

    if (!["ban", "unban"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Use 'ban' or 'unban'" },
        { status: 400 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    const { createClient: createServiceClient } = await import("@supabase/supabase-js");
    const adminSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    if (action === "ban") {
      // Ban user
      const { data, error } = await adminSupabase.auth.admin.updateUserById(id, {
        ban_duration: "876000h", // ~100 years (effectively permanent)
      });

      if (error) {
        throw error;
      }

      // Update profile is_active status
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ is_active: false })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        message: "User banned successfully",
        user: data.user,
      });
    } else {
      // Unban user
      const { data, error } = await adminSupabase.auth.admin.updateUserById(id, {
        ban_duration: "0s", // Remove ban
      });

      if (error) {
        throw error;
      }

      // Update profile is_active status
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({ is_active: true })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        message: "User unbanned successfully",
        user: data.user,
      });
    }
  } catch (error: any) {
    console.error("Failed to ban/unban user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to ban/unban user" },
      { status: 500 }
    );
  }
}

