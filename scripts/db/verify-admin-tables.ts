/**
 * Database Verification and Migration Script
 * Automatically creates missing tables for admin panel
 * 
 * Usage: tsx scripts/db/verify-admin-tables.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TableDefinition {
  name: string;
  sql: string;
  description: string;
}

const REQUIRED_TABLES: TableDefinition[] = [
  {
    name: "notifications",
    description: "User notifications table",
    sql: `
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        action_url TEXT,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

      -- RLS Policies
      ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

      -- Allow users to read their own notifications
      CREATE POLICY IF NOT EXISTS "Users can read own notifications"
        ON public.notifications FOR SELECT
        USING (auth.uid() = user_id);

      -- Allow service role to manage all notifications
      CREATE POLICY IF NOT EXISTS "Service role can manage all notifications"
        ON public.notifications FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');

      -- Allow staff to read all notifications (for admin panel)
      CREATE POLICY IF NOT EXISTS "Staff can read all notifications"
        ON public.notifications FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.staff_profiles
            WHERE user_id = auth.uid() AND active = true
          )
        );
    `,
  },
  {
    name: "content_items",
    description: "Content Studio items table",
    sql: `
      CREATE TABLE IF NOT EXISTS public.content_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        type TEXT NOT NULL DEFAULT 'normal',
        slug TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
        author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        featured_image_url TEXT,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items(status);
      CREATE INDEX IF NOT EXISTS idx_content_items_slug ON public.content_items(slug);
      CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON public.content_items(created_at DESC);

      -- RLS Policies
      ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

      -- Allow public read for published content
      CREATE POLICY IF NOT EXISTS "Public can read published content"
        ON public.content_items FOR SELECT
        USING (status = 'published');

      -- Allow service role full access
      CREATE POLICY IF NOT EXISTS "Service role can manage all content"
        ON public.content_items FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');

      -- Allow staff to manage all content
      CREATE POLICY IF NOT EXISTS "Staff can manage all content"
        ON public.content_items FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.staff_profiles
            WHERE user_id = auth.uid() AND active = true
          )
        );
    `,
  },
  {
    name: "content_locales",
    description: "Content Studio locales table",
    sql: `
      CREATE TABLE IF NOT EXISTS public.content_locales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content_item_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
        locale TEXT NOT NULL CHECK (locale IN ('tr', 'en', 'et', 'ru', 'ar')),
        title TEXT NOT NULL,
        content TEXT,
        excerpt TEXT,
        meta_description TEXT,
        meta_keywords TEXT[],
        translation_status TEXT DEFAULT 'draft' CHECK (translation_status IN ('draft', 'review', 'approved', 'published')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(content_item_id, locale)
      );

      CREATE INDEX IF NOT EXISTS idx_content_locales_content_item_id ON public.content_locales(content_item_id);
      CREATE INDEX IF NOT EXISTS idx_content_locales_locale ON public.content_locales(locale);

      -- RLS Policies
      ALTER TABLE public.content_locales ENABLE ROW LEVEL SECURITY;

      -- Allow public read for published content
      CREATE POLICY IF NOT EXISTS "Public can read published content locales"
        ON public.content_locales FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.content_items
            WHERE id = content_item_id AND status = 'published'
          )
        );

      -- Allow service role full access
      CREATE POLICY IF NOT EXISTS "Service role can manage all content locales"
        ON public.content_locales FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');

      -- Allow staff to manage all content locales
      CREATE POLICY IF NOT EXISTS "Staff can manage all content locales"
        ON public.content_locales FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.staff_profiles
            WHERE user_id = auth.uid() AND active = true
          )
        );
    `,
  },
  {
    name: "topic_clusters",
    description: "Topic clusters table for content organization",
    sql: `
      CREATE TABLE IF NOT EXISTS public.topic_clusters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_topic_clusters_created_at ON public.topic_clusters(created_at DESC);

      -- RLS Policies
      ALTER TABLE public.topic_clusters ENABLE ROW LEVEL SECURITY;

      -- Allow service role full access
      CREATE POLICY IF NOT EXISTS "Service role can manage all clusters"
        ON public.topic_clusters FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');

      -- Allow staff to manage all clusters
      CREATE POLICY IF NOT EXISTS "Staff can manage all clusters"
        ON public.topic_clusters FOR ALL
        USING (
          EXISTS (
            SELECT 1 FROM public.staff_profiles
            WHERE user_id = auth.uid() AND active = true
          )
        );
    `,
  },
  {
    name: "staff_profiles",
    description: "Staff profiles for RBAC",
    sql: `
      CREATE TABLE IF NOT EXISTS public.staff_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin', 'super_admin')),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_staff_profiles_user_id ON public.staff_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_staff_profiles_active ON public.staff_profiles(active);

      -- RLS Policies
      ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

      -- Users can read their own profile
      CREATE POLICY IF NOT EXISTS "Users can read own staff profile"
        ON public.staff_profiles FOR SELECT
        USING (auth.uid() = user_id);

      -- Service role full access
      CREATE POLICY IF NOT EXISTS "Service role can manage all staff profiles"
        ON public.staff_profiles FOR ALL
        USING (auth.jwt() ->> 'role' = 'service_role');

      -- Admins can read all staff profiles
      CREATE POLICY IF NOT EXISTS "Admins can read all staff profiles"
        ON public.staff_profiles FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.staff_profiles
            WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin') AND active = true
          )
        );
    `,
  },
];

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select("id")
      .limit(1);

    // If error is PGRST116 (table not found), table doesn't exist
    if (error && error.code === "PGRST116") {
      return false;
    }

    // If no error or other error, assume table exists
    return true;
  } catch (err) {
    return false;
  }
}

async function createTable(table: TableDefinition): Promise<boolean> {
  try {
    console.log(`📦 Creating table: ${table.name}...`);
    
    // Split SQL by semicolons and execute each statement
    const statements = table.sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      const { error } = await supabase.rpc("exec_sql", {
        sql: statement,
      });

      // If exec_sql doesn't exist, try direct query (may not work, but worth trying)
      if (error && error.message?.includes("exec_sql")) {
        // Fallback: Use Supabase REST API directly
        console.warn(`   ⚠️  exec_sql not available, trying direct execution...`);
        // Note: Direct SQL execution via Supabase JS client is limited
        // This would require using the Supabase Management API or migrations
        console.error(`   ❌ Cannot execute SQL directly. Please run migration manually.`);
        console.error(`   SQL:\n${statement}`);
        return false;
      }

      if (error && !error.message?.includes("already exists") && !error.message?.includes("duplicate")) {
        console.error(`   ❌ Error executing statement:`, error.message);
        return false;
      }
    }

    console.log(`   ✅ Table ${table.name} created successfully`);
    return true;
  } catch (err: any) {
    console.error(`   ❌ Failed to create table ${table.name}:`, err.message);
    return false;
  }
}

async function verifyAndCreateTables() {
  console.log("🔍 Verifying admin panel database tables...\n");

  const results: Array<{ table: string; exists: boolean; created: boolean }> = [];

  for (const table of REQUIRED_TABLES) {
    const exists = await checkTableExists(table.name);
    results.push({
      table: table.name,
      exists,
      created: false,
    });

    if (exists) {
      console.log(`✅ ${table.name} - exists`);
    } else {
      console.log(`❌ ${table.name} - missing`);
      console.log(`   Description: ${table.description}`);
      
      // Try to create using Supabase migrations API
      // Since we can't execute raw SQL directly, we'll use a migration approach
      const created = await createTable(table);
      if (created) {
        results[results.length - 1].created = true;
      } else {
        console.log(`   ⚠️  Manual migration required. See SQL above.`);
      }
    }
  }

  console.log("\n📊 Summary:");
  console.log("─".repeat(50));
  results.forEach((r) => {
    const status = r.exists
      ? "✅ EXISTS"
      : r.created
      ? "✅ CREATED"
      : "❌ MISSING (manual migration needed)";
    console.log(`${status.padEnd(25)} ${r.table}`);
  });

  const missing = results.filter((r) => !r.exists && !r.created);
  if (missing.length > 0) {
    console.log("\n⚠️  Some tables need manual migration.");
    console.log("   Run migrations via Supabase Dashboard or CLI.");
    return false;
  }

  console.log("\n✅ All required tables verified!");
  return true;
}

// Run verification
verifyAndCreateTables()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
