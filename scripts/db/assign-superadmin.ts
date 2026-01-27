/**
 * Assign Super Admin Role Script
 * Assigns super_admin role to ahmettbulutt@gmail.com
 * 
 * Usage: tsx scripts/db/assign-superadmin.ts
 */

import { createServiceClient } from "@karasu/lib/supabase/service";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const dbSupabase = createServiceClient();

async function assignSuperAdmin() {
  console.log("🚀 Assigning super_admin role to ahmettbulutt@gmail.com...\n");

  try {
    // 1. Get user by email
    const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to list users: ${usersError.message}`);
    }

    const user = users.users.find((u) => u.email === "ahmettbulutt@gmail.com");

    if (!user) {
      console.log("⚠️  User ahmettbulutt@gmail.com not found.");
      console.log("   Please create the user first via signup or admin panel.");
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (${user.id})\n`);

    // 2. Ensure super_admin role exists
    let { data: superAdminRole, error: roleError } = await dbSupabase
      .from("roles")
      .select("id, name")
      .eq("name", "super_admin")
      .single();

    if (roleError || !superAdminRole) {
      console.log("📝 Creating super_admin role...");
      const { data: newRole, error: createError } = await dbSupabase
        .from("roles")
        .insert({
          name: "super_admin",
          description: "Super Administrator with full system access",
          permissions: ["*"],
        })
        .select()
        .single();

      if (createError || !newRole) {
        throw new Error(`Failed to create super_admin role: ${createError?.message}`);
      }

      superAdminRole = newRole;
      console.log(`✅ Created super_admin role (${superAdminRole.id})\n`);
    } else {
      console.log(`✅ super_admin role exists (${superAdminRole.id})\n`);
    }

    // 3. Check if user already has super_admin role
    const { data: existingRoles, error: existingError } = await dbSupabase
      .from("user_roles")
      .select("id, role_id")
      .eq("user_id", user.id)
      .eq("role_id", superAdminRole.id)
      .single();

    if (existingRoles && !existingError) {
      console.log("✅ User already has super_admin role assigned.");
      process.exit(0);
    }

    // 4. Remove any existing roles (optional - comment out if you want to keep multiple roles)
    console.log("🔄 Removing existing roles...");
    const { error: deleteError } = await dbSupabase
      .from("user_roles")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.warn(`⚠️  Warning: Failed to remove existing roles: ${deleteError.message}`);
    } else {
      console.log("✅ Removed existing roles\n");
    }

    // 5. Assign super_admin role
    console.log("📝 Assigning super_admin role...");
    const { error: assignError } = await dbSupabase
      .from("user_roles")
      .insert({
        user_id: user.id,
        role_id: superAdminRole.id,
      });

    if (assignError) {
      throw new Error(`Failed to assign super_admin role: ${assignError.message}`);
    }

    console.log("✅ Successfully assigned super_admin role!\n");
    console.log("🎉 User ahmettbulutt@gmail.com is now a super_admin.");
    console.log("   You can now access the admin panel at: https://admin.karasuemlak.net");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

assignSuperAdmin();
