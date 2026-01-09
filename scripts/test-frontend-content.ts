/**
 * Test Frontend Content Display
 * Tests if articles, news, and listings are being fetched correctly
 */

import dotenv from 'dotenv';
import { createServiceClient } from '../packages/lib/supabase/service';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testFrontendContent() {
  console.log('🔍 Testing Frontend Content Display...\n');

  try {
    const supabase = createServiceClient();
    console.log('✅ Service client created successfully\n');

    // Test 1: Articles (published only)
    console.log('📝 Testing Articles (published)...');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, status, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5);

    if (articlesError) {
      console.error('❌ Articles Error:', articlesError.message);
    } else {
      console.log(`✅ Articles: ${articles?.length || 0} published articles found`);
      if (articles && articles.length > 0) {
        console.log(`   - First article: ${articles[0].title}`);
        console.log(`   - Status: ${articles[0].status}`);
      }
    }

    // Test 2: News Articles (published only)
    console.log('\n📢 Testing News Articles (published)...');
    const { data: news, error: newsError } = await supabase
      .from('news_articles')
      .select('id, title, slug, published, published_at')
      .eq('published', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(5);

    if (newsError) {
      console.error('❌ News Error:', newsError.message);
    } else {
      console.log(`✅ News: ${news?.length || 0} published articles found`);
      if (news && news.length > 0) {
        console.log(`   - First news: ${news[0].title}`);
        console.log(`   - Published: ${news[0].published}`);
      }
    }

    // Test 3: Listings (published and available)
    console.log('\n🏠 Testing Listings (published and available)...');
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('id, title, slug, status, published, available')
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (listingsError) {
      console.error('❌ Listings Error:', listingsError.message);
    } else {
      console.log(`✅ Listings: ${listings?.length || 0} published and available listings found`);
      if (listings && listings.length > 0) {
        console.log(`   - First listing: ${listings[0].title}`);
        console.log(`   - Status: ${listings[0].status}`);
        console.log(`   - Published: ${listings[0].published}`);
        console.log(`   - Available: ${listings[0].available}`);
      }
      
      // Count by status
      const satilik = listings?.filter(l => l.status === 'satilik').length || 0;
      const kiralik = listings?.filter(l => l.status === 'kiralik').length || 0;
      console.log(`   - Satılık: ${satilik}`);
      console.log(`   - Kiralık: ${kiralik}`);
    }

    // Test 4: Featured Listings
    console.log('\n⭐ Testing Featured Listings...');
    const { data: featuredListings, error: featuredError } = await supabase
      .from('listings')
      .select('id, title, slug, featured')
      .eq('published', true)
      .eq('available', true)
      .eq('featured', true)
      .is('deleted_at', null)
      .limit(5);

    if (featuredError) {
      console.error('❌ Featured Listings Error:', featuredError.message);
    } else {
      console.log(`✅ Featured Listings: ${featuredListings?.length || 0} found`);
    }

    console.log('\n✅ All tests completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Published Articles: ${articles?.length || 0}`);
    console.log(`   - Published News: ${news?.length || 0}`);
    console.log(`   - Published & Available Listings: ${listings?.length || 0}`);
    console.log(`   - Featured Listings: ${featuredListings?.length || 0}`);
    
    if ((articles?.length || 0) === 0 && (news?.length || 0) === 0 && (listings?.length || 0) === 0) {
      console.log('\n⚠️  WARNING: No content found! Check if:');
      console.log('   1. Articles have status="published"');
      console.log('   2. News have published=true and deleted_at=null');
      console.log('   3. Listings have published=true, available=true, and deleted_at=null');
    }
  } catch (error: any) {
    console.error('❌ Fatal Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testFrontendContent();
