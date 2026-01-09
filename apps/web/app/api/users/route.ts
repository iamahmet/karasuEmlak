import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { handleAPIError, getUserFriendlyMessage, logError } from "@/lib/errors/handle-api-error";
// import { requireStaff } from "@/lib/auth/server";

export async function GET() {
  try {

    // Development mode: Skip auth check
    // In production, uncomment the line below to enable role checking
    // await requireStaff();

    // Use service client for database queries (admin API)
    const { createServiceClient } = await import("@karasu/lib/supabase/service");
    const dbSupabase = createServiceClient();

    // Get service role key for admin operations
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;


    if (!serviceRoleKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
      return NextResponse.json(
        { 
          success: false,
          error: "Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file." 
        },
        { status: 500 }
      );
    }

    if (!supabaseUrl) {
      console.error("NEXT_PUBLIC_SUPABASE_URL is not configured");
      return NextResponse.json(
        { 
          success: false,
          error: "Supabase URL not configured. Please add NEXT_PUBLIC_SUPABASE_URL to your .env.local file." 
        },
        { status: 500 }
      );
    }

    // Create admin client
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


    // Fetch users
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers();


    if (authError) {
      console.error("Failed to fetch users from Supabase Auth:", authError);
      return NextResponse.json(
        { 
          success: false,
          error: `Failed to fetch users: ${authError.message}. Please check your SUPABASE_SERVICE_ROLE_KEY.` 
        },
        { status: 500 }
      );
    }

    // Fetch profiles (handle case where profiles table might not exist)
    const userIds = authUsers.users.map((u) => u.id);
    let profiles: any[] = [];
    let userRoles: any[] = [];


    if (userIds.length > 0) {
      const { data: profilesData, error: profilesError } = await dbSupabase
        .from("profiles")
        .select("id, name, avatar_url")
        .in("id", userIds);

      if (profilesError) {
        console.warn("Failed to fetch profiles (table might not exist):", profilesError.message);
      } else {
        profiles = profilesData || [];
      }

      // Fetch user roles (user_roles table has role_id, need to join with roles table)
        const { data: userRolesData, error: userRolesError } = await dbSupabase
          .from("user_roles")
          .select("user_id, role_id")
          .in("user_id", userIds);

      if (userRolesError) {
        console.warn("Failed to fetch user roles (table might not exist):", userRolesError.message);
      } else {
        userRoles = userRolesData || [];
        
        // Fetch role names from roles table
        const roleIds = [...new Set(userRoles.map((ur: any) => ur.role_id))];
        if (roleIds.length > 0) {
          const { data: rolesData, error: rolesError } = await dbSupabase
            .from("roles")
            .select("id, name")
            .in("id", roleIds);


          if (!rolesError && rolesData) {
            // Map role_id to role name
            const roleMap = new Map(rolesData.map((r: any) => [r.id, r.name]));
            userRoles = userRoles.map((ur: any) => ({
              ...ur,
              role: roleMap.get(ur.role_id) || ur.role_id,
            }));
          }
        }
      }
    }

    // Combine data
    const users = authUsers.users.map((user) => {
      const profile = profiles?.find((p) => p.id === user.id);
      const userRoleEntries = userRoles?.filter((ur: any) => ur.user_id === user.id) || [];
      
      // Extract role names
      const roles = userRoleEntries.map((ur: any) => ({
        role: ur.role || ur.role_id,
      }));


      return {
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: (user as any).email_confirmed_at,
        banned_until: (user as any).banned_until,
        roles: roles,
        profile: profile
          ? {
              name: profile.name,
              avatar_url: profile.avatar_url,
            }
          : undefined,
      };
    });


    const response = NextResponse.json({ success: true, users });
    
    // Cache for 30 seconds (short cache for user list)
    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    
    return response;
  } catch (error: unknown) {
    logError(error, "GET /api/users");
    const errorInfo = handleAPIError(error);
    return NextResponse.json(
      { 
        success: false,
        error: getUserFriendlyMessage(errorInfo),
        code: errorInfo.code,
      },
      { status: errorInfo.statusCode }
    );
  }
}

