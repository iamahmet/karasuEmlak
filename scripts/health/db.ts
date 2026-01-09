/**
 * Database Health Check
 * Checks: Supabase connection, RLS policies, table counts, anon vs service role
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const checks: HealthCheck[] = [];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check 1: Environment variables
function checkEnvVars() {
  if (!supabaseUrl) {
    checks.push({
      name: 'Supabase URL',
      status: 'fail',
      message: 'Missing NEXT_PUBLIC_SUPABASE_URL',
    });
    return false;
  }
  
  if (!supabaseAnonKey) {
    checks.push({
      name: 'Supabase Anon Key',
      status: 'fail',
      message: 'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY',
    });
    return false;
  }
  
  if (!supabaseServiceKey) {
    checks.push({
      name: 'Supabase Service Key',
      status: 'fail',
      message: 'Missing SUPABASE_SERVICE_ROLE_KEY',
    });
    return false;
  }
  
  checks.push({
    name: 'Environment Variables',
    status: 'pass',
    message: 'All required env vars present',
  });
  
  return true;
}

// Check 2: Connection test
async function checkConnection() {
  if (!supabaseUrl || !supabaseAnonKey) return;
  
  try {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { error } = await anonClient.from('articles').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      checks.push({
        name: 'Anon Client Connection',
        status: 'fail',
        message: `Error: ${error.message}`,
      });
    } else {
      checks.push({
        name: 'Anon Client Connection',
        status: 'pass',
        message: 'Connected successfully',
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'Anon Client Connection',
      status: 'fail',
      message: `Exception: ${error.message}`,
    });
  }
  
  if (!supabaseServiceKey) return;
  
  try {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { error } = await serviceClient.from('articles').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      checks.push({
        name: 'Service Client Connection',
        status: 'fail',
        message: `Error: ${error.message}`,
      });
    } else {
      checks.push({
        name: 'Service Client Connection',
        status: 'pass',
        message: 'Connected successfully',
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'Service Client Connection',
      status: 'fail',
      message: `Exception: ${error.message}`,
    });
  }
}

// Check 3: Table counts (anon vs service)
async function checkTableCounts() {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) return;
  
  const tables = [
    'articles',
    'news_articles',
    'listings',
    'neighborhoods',
    'qa_entries',
    'content_comments',
  ];
  
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  for (const table of tables) {
    try {
      // Anon count
      const { count: anonCount, error: anonError } = await anonClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      // Service count
      const { count: serviceCount, error: serviceError } = await serviceClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (anonError && anonError.code !== 'PGRST116') {
        checks.push({
          name: `Table: ${table} (Anon)`,
          status: 'fail',
          message: `Error: ${anonError.message}`,
        });
      } else if (serviceError && serviceError.code !== 'PGRST116') {
        checks.push({
          name: `Table: ${table} (Service)`,
          status: 'fail',
          message: `Error: ${serviceError.message}`,
        });
      } else {
        const anon = anonCount ?? 0;
        const service = serviceCount ?? 0;
        const status = service >= anon ? 'pass' : 'warn';
        const message = service >= anon
          ? `Anon: ${anon}, Service: ${service} (RLS working)`
          : `Anon: ${anon}, Service: ${service} (RLS mismatch - service should see more)`;
        
        checks.push({
          name: `Table: ${table}`,
          status,
          message,
        });
      }
    } catch (error: any) {
      checks.push({
        name: `Table: ${table}`,
        status: 'fail',
        message: `Exception: ${error.message}`,
      });
    }
  }
}

// Check 4: RLS policy check (service should see more than anon for content tables)
async function checkRLS() {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) return;
  
  const contentTables = ['articles', 'news_articles', 'listings', 'neighborhoods'];
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  let rlsWorking = true;
  
  for (const table of contentTables) {
    try {
      const { count: anonCount } = await anonClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      const { count: serviceCount } = await serviceClient
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (serviceCount !== null && anonCount !== null && serviceCount < anonCount) {
        rlsWorking = false;
        break;
      }
    } catch {
      // Skip if table doesn't exist
    }
  }
  
  checks.push({
    name: 'RLS Policies',
    status: rlsWorking ? 'pass' : 'warn',
    message: rlsWorking
      ? 'RLS policies appear correct (service sees >= anon)'
      : 'RLS mismatch detected (service sees less than anon - check policies)',
  });
}

// Check 5: PostgREST schema cache
async function checkPostgRESTCache() {
  if (!supabaseUrl || !supabaseServiceKey) return;
  
  const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Try a simple query that would fail if cache is stale
    const { error } = await serviceClient.from('articles').select('id').limit(1);
    
    if (error && (error.code === 'PGRST205' || error.code === 'PGRST202')) {
      checks.push({
        name: 'PostgREST Schema Cache',
        status: 'fail',
        message: 'Schema cache is stale - run: pnpm supabase:reload-postgrest',
      });
    } else {
      checks.push({
        name: 'PostgREST Schema Cache',
        status: 'pass',
        message: 'Schema cache is fresh',
      });
    }
  } catch (error: any) {
    checks.push({
      name: 'PostgREST Schema Cache',
      status: 'warn',
      message: `Could not check: ${error.message}`,
    });
  }
}

// Main function
async function runHealthCheck() {
  console.log('🔍 Running Database Health Check...\n');

  if (!checkEnvVars()) {
    console.log('❌ Missing required environment variables. Cannot proceed.\n');
    process.exit(1);
  }

  await checkConnection();
  await checkTableCounts();
  await checkRLS();
  await checkPostgRESTCache();

  // Print results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DATABASE HEALTH CHECK RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const warned = checks.filter(c => c.status === 'warn').length;

  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${passed} passed, ${warned} warnings, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runHealthCheck().catch(console.error);
}

export { runHealthCheck };
