#!/usr/bin/env tsx

/**
 * Assert Authors Table Exists
 * 
 * Checks if authors table exists in the connected Supabase project
 * Uses service role to bypass RLS and check information_schema directly
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config({ path: resolve(process.cwd(), 'apps/web/.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error(`  SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}`);
  console.error(`  SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? 'SET' : 'MISSING'}`);
  process.exit(1);
}

// Mask URL for logging (show only project ref)
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || 'unknown';
const maskedUrl = supabaseUrl.replace(/https:\/\/([^.]+)\.supabase\.co/, 'https://***.supabase.co');

console.log('🔍 Checking Authors Table...\n');
console.log(`📡 Connected to: ${maskedUrl}`);
console.log(`   Project Ref: ${projectRef}\n`);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function assertAuthorsTable() {
  try {
    // Method 1: Direct SQL query via RPC (if available)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
            AND table_name = 'authors';
        `,
      });

      if (!rpcError && rpcData) {
        const exists = Array.isArray(rpcData) && rpcData.length > 0;
        console.log(`📊 RPC Query Result: ${exists ? 'FOUND' : 'MISSING'}`);
        if (exists) {
          console.log(`   Table: ${rpcData[0]?.table_name || 'authors'}`);
        }
        return exists;
      }
    } catch (e) {
      // RPC not available, try other methods
    }

    // Method 2: Try to query the table directly
    const { data, error } = await supabase
      .from('authors')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('✅ FOUND - Table exists and is accessible');
      console.log(`   Sample query successful`);
      
      // Get count
      const { count } = await supabase
        .from('authors')
        .select('*', { count: 'exact', head: true });
      
      console.log(`   Total authors: ${count || 0}`);
      
      const { count: activeCount } = await supabase
        .from('authors')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      
      console.log(`   Active authors: ${activeCount || 0}`);
      return true;
    }

    if (error?.code === 'PGRST205' || error?.message?.includes('schema cache')) {
      console.log('❌ MISSING - Table not found in PostgREST schema cache');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      return false;
    }

    console.log('❌ MISSING - Table query failed');
    console.log(`   Error: ${error?.message || 'Unknown error'}`);
    console.log(`   Code: ${error?.code || 'Unknown'}`);
    return false;
  } catch (error: any) {
    console.log('❌ MISSING - Fatal error');
    console.log(`   Error: ${error?.message || 'Unknown error'}`);
    return false;
  }
}

async function main() {
  const exists = await assertAuthorsTable();
  
  console.log('\n' + '='.repeat(50));
  if (exists) {
    console.log('✅ RESULT: FOUND');
    console.log('   Authors table exists and is accessible');
  } else {
    console.log('❌ RESULT: MISSING');
    console.log('   Authors table does not exist or is not accessible');
    console.log('   Action required: Apply migration');
  }
  console.log('='.repeat(50) + '\n');
  
  process.exit(exists ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
