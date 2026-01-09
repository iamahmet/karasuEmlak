/**
 * Test Admin Panel API Endpoints
 * This script tests if admin panel APIs are working correctly
 */

import dotenv from 'dotenv';
import { createServiceClient } from '../packages/lib/supabase/service';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAdminAPIs() {
  console.log('🔍 Testing Admin Panel APIs...\n');

  try {
    const supabase = createServiceClient();
    console.log('✅ Service client created successfully\n');

    // Test 1: Listings
    console.log('📋 Testing Listings API...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('*')
      .is('deleted_at', null)
      .limit(5);

    if (listingsError) {
      console.error('❌ Listings Error:', listingsError.message);
    } else {
      console.log(`✅ Listings: ${listings?.length || 0} items found`);
      if (listings && listings.length > 0) {
        console.log(`   - First listing: ${listings[0].title}`);
        console.log(`   - Published: ${listings.filter(l => l.published).length}/${listings.length}`);
      }
    }

    // Test 2: Content Items
    console.log('\n📝 Testing Content Items API...');
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('*')
      .limit(5);

    if (contentError) {
      console.error('❌ Content Items Error:', contentError.message);
      if (contentError.code === 'PGRST116' || contentError.code === '42P01') {
        console.log('   ℹ️  Table does not exist (this is OK if not using content_items)');
      }
    } else {
      console.log(`✅ Content Items: ${contentItems?.length || 0} items found`);
    }

    // Test 3: Articles
    console.log('\n📰 Testing Articles API...');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .limit(5);

    if (articlesError) {
      console.error('❌ Articles Error:', articlesError.message);
      if (articlesError.code === 'PGRST116' || articlesError.code === '42P01') {
        console.log('   ℹ️  Table does not exist (this is OK if not using articles)');
      }
    } else {
      console.log(`✅ Articles: ${articles?.length || 0} items found`);
    }

    // Test 4: News
    console.log('\n📢 Testing News API...');
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('*')
      .limit(5);

    if (newsError) {
      console.error('❌ News Error:', newsError.message);
      if (newsError.code === 'PGRST116' || newsError.code === '42P01') {
        console.log('   ℹ️  Table does not exist (this is OK if not using news)');
      }
    } else {
      console.log(`✅ News: ${news?.length || 0} items found`);
    }

    console.log('\n✅ All tests completed!');
  } catch (error: any) {
    console.error('❌ Fatal Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testAdminAPIs();
