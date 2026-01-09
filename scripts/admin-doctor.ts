/**
 * Admin Panel Doctor Script
 * Comprehensive health check and verification for admin panel
 * 
 * Usage: tsx scripts/admin-doctor.ts
 * 
 * Note: This script now includes PostgREST cache verification.
 * If cache is stale, it will suggest running: pnpm supabase:reload-postgrest
 */

import { execSync } from "child_process";
import { readFileSync } from "fs";

// Enable top-level await
const main = async () => {

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  fix?: string;
}

const results: CheckResult[] = [];

function check(name: string, condition: boolean, message: string, fix?: string) {
  results.push({
    name,
    status: condition ? "pass" : "fail",
    message,
    fix,
  });
}

function warn(name: string, message: string) {
  results.push({
    name,
    status: "warn",
    message,
  });
}

  console.log("🏥 Admin Panel Doctor - Comprehensive Health Check\n");
  console.log("=".repeat(60));

  // 1. Environment Variables
console.log("\n📋 1. Environment Variables");
const envVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

check(
  "NEXT_PUBLIC_SUPABASE_URL",
  !!envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder.supabase.co",
  envVars.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
  "Add NEXT_PUBLIC_SUPABASE_URL to .env.local"
);

check(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  !!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY && envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "placeholder-anon-key",
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
  "Add NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
);

check(
  "SUPABASE_SERVICE_ROLE_KEY",
  !!envVars.SUPABASE_SERVICE_ROLE_KEY,
  envVars.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set (server-only)" : "✗ Missing",
  "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (server-only, never expose to client)"
);

  // 2. Port Availability
  console.log("\n📋 2. Port Availability");
try {
  const port3001 = execSync("lsof -ti:3001", { encoding: "utf-8", stdio: "pipe" }).trim();
  warn("Port 3001", `In use by PID: ${port3001}`);
} catch {
  check("Port 3001", true, "✓ Available", undefined);
}

  // 3. Health Endpoints
  console.log("\n📋 3. Health Endpoints");
try {
  const healthz = execSync("curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://localhost:3001/healthz", {
    encoding: "utf-8",
  }).trim();
  check("GET /healthz", healthz === "200", healthz === "200" ? "✓ Responding" : `✗ Status: ${healthz}`);
} catch {
  check("GET /healthz", false, "✗ Not responding (server may not be running)");
}

  // 4. Database Tables & PostgREST Cache
  console.log("\n📋 4. Database Tables & PostgREST Cache");
const requiredTables = [
  "notifications",
  "content_items",
  "content_locales",
  "topic_clusters",
  "staff_profiles",
  "content_comments",
];

// Check PostgREST cache by verifying tables are accessible (async)
async function checkPostgRESTCache() {
  if (envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        envVars.NEXT_PUBLIC_SUPABASE_URL!,
        envVars.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
        }
      );

      // Test critical table
      const { error } = await supabase
        .from("content_comments")
        .select("id", { count: "exact", head: true })
        .limit(0);

      if (error?.code === "PGRST205" || error?.code === "PGRST202") {
        check(
          "PostgREST Cache",
          false,
          "✗ Schema cache is stale",
          "Run: pnpm supabase:reload-postgrest"
        );
      } else if (error?.code === "PGRST116") {
        warn("PostgREST Cache", "content_comments table doesn't exist (this is OK if not migrated yet)");
      } else {
        check("PostgREST Cache", true, "✓ Schema cache is fresh");
      }
    } catch (err) {
      warn("PostgREST Cache", "Could not verify (check manually)");
    }
  } else {
    warn("PostgREST Cache", "Cannot verify (missing env vars)");
  }
}

  // Run async check
  await checkPostgRESTCache();

  // 5. API Routes
  console.log("\n📋 5. API Routes");
const apiRoutes = [
  "/api/content-studio",
  "/api/content-studio/clusters",
  "/api/notifications",
];

apiRoutes.forEach((route) => {
  try {
    const status = execSync(
      `curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://localhost:3001${route}`,
      { encoding: "utf-8" }
    ).trim();
    const isOk = status === "200" || status === "401"; // 401 is acceptable if not logged in
    check(`GET ${route}`, isOk, isOk ? `✓ Status: ${status}` : `✗ Status: ${status}`);
  } catch {
    check(`GET ${route}`, false, "✗ Not responding");
  }
});

  // 6. Build Status
  console.log("\n📋 6. Build Status");
try {
  const buildCheck = execSync("cd apps/admin && pnpm typecheck 2>&1 | head -5", {
    encoding: "utf-8",
  });
  const hasErrors = buildCheck.includes("error");
  check("TypeScript", !hasErrors, hasErrors ? "✗ Type errors found" : "✓ No type errors");
} catch {
  warn("TypeScript", "Could not check (run 'pnpm typecheck' manually)");
}

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const warnings = results.filter((r) => r.status === "warn").length;

  results.forEach((result) => {
    const icon = result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⚠️ ";
    console.log(`${icon} ${result.name.padEnd(40)} ${result.message}`);
    if (result.fix) {
      console.log(`   💡 Fix: ${result.fix}`);
    }
  });

  console.log("\n" + "=".repeat(60));
  console.log(`✅ Passed: ${passed} | ❌ Failed: ${failed} | ⚠️  Warnings: ${warnings}`);
  console.log("=".repeat(60));

  if (failed > 0) {
    console.log("\n⚠️  Some checks failed. Please review and fix issues above.");
    process.exit(1);
  } else {
    console.log("\n✅ All critical checks passed!");
    process.exit(0);
  }
};

// Run main function
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
