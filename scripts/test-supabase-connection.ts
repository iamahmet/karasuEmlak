/**
 * Test Supabase Connection Script
 * 
 * This script tests the Supabase connection using both anon and service role clients
 * to verify that environment variables are correctly set and RLS policies work.
 */

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Helper functions
async function createAnonServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase URL or Anon Key');
  }
  
  // For server-side testing, we'll use the regular client
  return createClient(supabaseUrl, supabaseAnonKey);
}

function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or Service Role Key');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getQAEntries(category?: string, region?: string, limit = 100) {
  const supabase = await createAnonServerClient();
  
  let query = supabase
    .from('qa_entries')
    .select('*')
    .order('priority', { ascending: false, nullsFirst: false })
    .order('category', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  if (region) {
    query = query.eq('region', region);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch Q&A entries: ${error.message}`);
  }

  return (data || []) as any[];
}

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  // Test 1: Environment Variables
  console.log('1️⃣ Checking Environment Variables...');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing');
    return;
  }
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${url}`);

  if (!anonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    return;
  }
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey.substring(0, 20)}...`);

  if (!serviceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing');
    return;
  }
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${serviceKey.substring(0, 20)}...\n`);

  // Test 2: Anon Client Connection
  console.log('2️⃣ Testing Anon Client Connection...');
  try {
    const anonClient = await createAnonServerClient();
    const { data: anonData, error: anonError } = await anonClient
      .from('qa_entries')
      .select('id')
      .limit(1);

    if (anonError) {
      console.error('❌ Anon client error:', anonError.message);
      console.error('   Code:', anonError.code);
      console.error('   Details:', anonError.details);
    } else {
      console.log(`✅ Anon client connected successfully`);
      console.log(`   Sample data: ${anonData ? 'Found' : 'None'}\n`);
    }
  } catch (error) {
    console.error('❌ Anon client exception:', error instanceof Error ? error.message : error);
    console.error('\n');
  }

  // Test 3: Service Client Connection
  console.log('3️⃣ Testing Service Client Connection...');
  try {
    const serviceClient = createServiceClient();
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('qa_entries')
      .select('id')
      .limit(1);

    if (serviceError) {
      console.error('❌ Service client error:', serviceError.message);
      console.error('   Code:', serviceError.code);
      console.error('   Details:', serviceError.details);
    } else {
      console.log(`✅ Service client connected successfully`);
      console.log(`   Sample data: ${serviceData ? 'Found' : 'None'}\n`);
    }
  } catch (error) {
    console.error('❌ Service client exception:', error instanceof Error ? error.message : error);
    console.error('\n');
  }

  // Test 4: Repository Function (getQAEntries)
  console.log('4️⃣ Testing Repository Function (getQAEntries)...');
  try {
    const qaEntries = await getQAEntries(undefined, undefined, 10);
    console.log(`✅ getQAEntries() returned ${qaEntries.length} entries`);
    if (qaEntries.length > 0) {
      console.log(`   First entry: ${qaEntries[0].question.substring(0, 50)}...`);
    }
    console.log('\n');
  } catch (error) {
    console.error('❌ Repository function error:', error instanceof Error ? error.message : error);
    console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('\n');
  }

  // Test 5: Full Query Test
  console.log('5️⃣ Testing Full Query...');
  try {
    const anonClient = await createAnonServerClient();
    const { data, error, count } = await anonClient
      .from('qa_entries')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.error('❌ Query error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log(`✅ Query successful`);
      console.log(`   Total count: ${count || 0}`);
      console.log(`   Returned: ${data?.length || 0} entries`);
      if (data && data.length > 0) {
        console.log(`   Sample entry:`);
        console.log(`     ID: ${data[0].id}`);
        console.log(`     Question: ${data[0].question?.substring(0, 60)}...`);
        console.log(`     Category: ${data[0].category}`);
        console.log(`     Priority: ${data[0].priority}`);
      }
    }
  } catch (error) {
    console.error('❌ Query exception:', error instanceof Error ? error.message : error);
  }

  console.log('\n✅ Connection test completed!');
}

// Run the test
testConnection().catch(console.error);
