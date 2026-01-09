#!/usr/bin/env npx tsx

/**
 * Supabase Connection Test Script
 *
 * Usage: npx tsx scripts/test-supabase.ts
 *
 * Tests:
 * 1. Environment variables are set
 * 2. Anon client can connect
 * 3. Service client can connect
 * 4. Database tables are accessible
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

function log(emoji: string, message: string) {
  console.log(`${emoji} ${message}`);
}

function addResult(result: TestResult) {
  results.push(result);
  const emoji = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
  log(emoji, `${result.name}: ${result.message}${result.duration ? ` (${result.duration}ms)` : ''}`);
}

async function testEnvironmentVariables(): Promise<void> {
  log('🔍', 'Checking environment variables...');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_JWT_SECRET',
  ];

  const optionalVars = [
    'SUPABASE_DB_HOST',
    'SUPABASE_DB_PORT',
    'SUPABASE_DB_NAME',
    'SUPABASE_DB_USER',
    'SUPABASE_DB_PASSWORD',
  ];

  let allRequired = true;
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      addResult({
        name: `ENV: ${varName}`,
        status: 'fail',
        message: 'Missing required environment variable',
      });
      allRequired = false;
    } else {
      addResult({
        name: `ENV: ${varName}`,
        status: 'pass',
        message: 'Set correctly',
      });
    }
  }

  for (const varName of optionalVars) {
    if (!process.env[varName]) {
      addResult({
        name: `ENV: ${varName}`,
        status: 'warn',
        message: 'Optional variable not set',
      });
    } else {
      addResult({
        name: `ENV: ${varName}`,
        status: 'pass',
        message: 'Set correctly',
      });
    }
  }

  if (!allRequired) {
    throw new Error('Missing required environment variables');
  }
}

async function testAnonConnection(): Promise<void> {
  log('🔌', 'Testing anon client connection...');

  const start = Date.now();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Simple health check - try to fetch from a public table
    const { error } = await supabase.from('listings').select('id').limit(1);

    if (error) {
      // RLS might be blocking, but connection is working
      if (error.code === 'PGRST301' || error.message.includes('RLS')) {
        addResult({
          name: 'Anon Client',
          status: 'warn',
          message: `Connected but RLS is blocking: ${error.message}`,
          duration: Date.now() - start,
        });
      } else {
        throw error;
      }
    } else {
      addResult({
        name: 'Anon Client',
        status: 'pass',
        message: 'Connected successfully',
        duration: Date.now() - start,
      });
    }
  } catch (error: any) {
    addResult({
      name: 'Anon Client',
      status: 'fail',
      message: `Connection failed: ${error.message}`,
      duration: Date.now() - start,
    });
  }
}

async function testServiceConnection(): Promise<void> {
  log('🔐', 'Testing service role client connection...');

  const start = Date.now();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    const { data, error } = await supabase.from('listings').select('id').limit(1);

    if (error) throw error;

    addResult({
      name: 'Service Client',
      status: 'pass',
      message: 'Connected successfully (bypasses RLS)',
      duration: Date.now() - start,
    });
  } catch (error: any) {
    addResult({
      name: 'Service Client',
      status: 'fail',
      message: `Connection failed: ${error.message}`,
      duration: Date.now() - start,
    });
  }
}

async function testDatabaseTables(): Promise<void> {
  log('📊', 'Testing database tables...');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const tables = ['listings', 'articles', 'neighborhoods', 'qa_items', 'users'];

  for (const table of tables) {
    const start = Date.now();
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      addResult({
        name: `Table: ${table}`,
        status: 'pass',
        message: `Accessible (${count ?? 0} rows)`,
        duration: Date.now() - start,
      });
    } catch (error: any) {
      addResult({
        name: `Table: ${table}`,
        status: 'fail',
        message: `Error: ${error.message}`,
        duration: Date.now() - start,
      });
    }
  }
}

async function testStorageBuckets(): Promise<void> {
  log('📁', 'Testing storage buckets...');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const start = Date.now();
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) throw error;

    const bucketNames = data?.map(b => b.name).join(', ') || 'none';
    addResult({
      name: 'Storage Buckets',
      status: 'pass',
      message: `Found ${data?.length ?? 0} buckets: ${bucketNames}`,
      duration: Date.now() - start,
    });
  } catch (error: any) {
    addResult({
      name: 'Storage Buckets',
      status: 'warn',
      message: `Could not list buckets: ${error.message}`,
      duration: Date.now() - start,
    });
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║       SUPABASE CONNECTION TEST                    ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  try {
    await testEnvironmentVariables();
    console.log('');
    await testAnonConnection();
    console.log('');
    await testServiceConnection();
    console.log('');
    await testDatabaseTables();
    console.log('');
    await testStorageBuckets();
  } catch (error: any) {
    log('💥', `Fatal error: ${error.message}`);
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                   SUMMARY                         ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warn').length;

  console.log(`✅ Passed:   ${passed}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📊 Total:    ${results.length}`);

  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please check your configuration.');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  All critical tests passed, but some warnings were raised.');
    process.exit(0);
  } else {
    console.log('\n✅ All tests passed! Supabase is configured correctly.');
    process.exit(0);
  }
}

main();
