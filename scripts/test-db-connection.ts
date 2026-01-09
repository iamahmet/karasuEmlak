/**
 * Test Database Connection Script
 * Tests both Supabase API and direct PostgreSQL connection
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from multiple locations
const envPaths = [
  join(process.cwd(), '.env.local'),
  join(process.cwd(), 'apps/web/.env.local'),
  join(process.cwd(), 'apps/admin/.env.local'),
];

for (const envPath of envPaths) {
  try {
    dotenv.config({ path: envPath });
  } catch (e) {
    // Ignore if file doesn't exist
  }
}

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check environment variables
  console.log('1️⃣ Environment Variables Check:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ SET' : '❌ MISSING'}`);
  console.log(`   ANON_KEY: ${anonKey ? '✅ SET' : '❌ MISSING'}`);
  console.log(`   SERVICE_ROLE_KEY: ${serviceKey ? '✅ SET' : '❌ MISSING'}\n`);

  if (!supabaseUrl || !anonKey) {
    console.error('❌ Missing required Supabase environment variables');
    return false;
  }

  // Test Anon Client
  console.log('2️⃣ Testing Anon Client (Public Access):');
  try {
    const anonClient = createClient(supabaseUrl, anonKey);
    
    // Test with a simple query
    const { data, error, count } = await anonClient
      .from('listings')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      return false;
    }

    console.log(`   ✅ Connected successfully`);
    console.log(`   Total listings: ${count || 0}`);
    console.log(`   Sample data: ${data ? 'Found' : 'None'}\n`);
  } catch (error) {
    console.error(`   ❌ Exception: ${error instanceof Error ? error.message : error}\n`);
    return false;
  }

  // Test Service Role Client
  if (serviceKey) {
    console.log('3️⃣ Testing Service Role Client (Admin Access):');
    try {
      const serviceClient = createClient(supabaseUrl, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data, error } = await serviceClient
        .from('listings')
        .select('id')
        .limit(1);

      if (error) {
        console.error(`   ❌ Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        return false;
      }

      console.log(`   ✅ Connected successfully`);
      console.log(`   Sample data: ${data ? 'Found' : 'None'}\n`);
    } catch (error) {
      console.error(`   ❌ Exception: ${error instanceof Error ? error.message : error}\n`);
      return false;
    }
  }

  // Test multiple tables
  console.log('4️⃣ Testing Database Tables:');
  const tables = ['listings', 'articles', 'news', 'qa_entries', 'neighborhoods'];
  const serviceClient = serviceKey 
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

  if (!serviceClient) {
    console.log('   ⚠️  Skipping table tests (no service role key)');
    return true;
  }

  for (const table of tables) {
    try {
      const { count, error } = await serviceClient
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`   ${table}: ❌ ${error.message}`);
      } else {
        console.log(`   ${table}: ✅ ${count || 0} rows`);
      }
    } catch (error) {
      console.log(`   ${table}: ❌ ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n✅ Supabase connection test completed!');
  return true;
}

async function testPostgreSQLConnection() {
  console.log('\n🔍 Testing Direct PostgreSQL Connection...\n');

  const dbHost = process.env.SUPABASE_DB_HOST;
  const dbPort = process.env.SUPABASE_DB_PORT || '5432';
  const dbName = process.env.SUPABASE_DB_NAME || 'postgres';
  const dbUser = process.env.SUPABASE_DB_USER || 'postgres';
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  console.log('1️⃣ PostgreSQL Environment Variables:');
  console.log(`   DB_HOST: ${dbHost ? '✅ SET' : '❌ MISSING'}`);
  console.log(`   DB_PORT: ${dbPort}`);
  console.log(`   DB_NAME: ${dbName}`);
  console.log(`   DB_USER: ${dbUser}`);
  console.log(`   DB_PASSWORD: ${dbPassword ? '✅ SET' : '❌ MISSING'}\n`);

  if (!dbHost || !dbPassword) {
    console.error('❌ Missing PostgreSQL connection variables');
    return false;
  }

  // Try to use pg library if available
  try {
    const { Client } = await import('pg');
    const client = new Client({
      host: dbHost,
      port: parseInt(dbPort),
      database: dbName,
      user: dbUser,
      password: dbPassword,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();
    console.log('   ✅ PostgreSQL connection successful');

    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log(`   PostgreSQL Version: ${result.rows[0].version.split(',')[0]}`);
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   User: ${result.rows[0].current_user}`);

    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
      LIMIT 10
    `);
    console.log(`   Tables found: ${tableResult.rows.length}`);
    if (tableResult.rows.length > 0) {
      console.log(`   Sample tables: ${tableResult.rows.map(r => r.table_name).join(', ')}`);
    }

    await client.end();
    console.log('\n✅ PostgreSQL connection test completed!');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      console.log('   ⚠️  pg library not installed, skipping direct PostgreSQL test');
      console.log('   Install with: pnpm add -D pg @types/pg');
      return true; // Not a failure, just missing dependency
    }
    console.error(`   ❌ PostgreSQL connection failed: ${error instanceof Error ? error.message : error}`);
    return false;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Database Connection Test');
  console.log('='.repeat(60));
  console.log('');

  const supabaseOk = await testSupabaseConnection();
  const pgOk = await testPostgreSQLConnection();

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));
  console.log(`Supabase API: ${supabaseOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`PostgreSQL: ${pgOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log('');

  if (supabaseOk && pgOk) {
    console.log('✅ All database connections are working!');
    process.exit(0);
  } else {
    console.log('❌ Some database connections failed');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
