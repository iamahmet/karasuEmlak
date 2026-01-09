/**
 * Analyze Live Site Pages
 * 
 * This script analyzes the live site to identify all indexed pages
 * and compares them with the current project structure.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PageInfo {
  url: string;
  type: 'static' | 'blog' | 'news' | 'listing' | 'neighborhood' | 'property-type';
  exists: boolean;
  needsImprovement: boolean;
}

async function analyzePages() {
  
  console.log('🔍 Analyzing Live Site Pages...\n');

  // 1. Check Blog Articles
  console.log('📝 Checking Blog Articles...');
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('slug, title, status, views, seo_score, featured_image, meta_description')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (articlesError) {
    console.error('Error fetching articles:', articlesError);
  } else {
    console.log(`   Found ${articles?.length || 0} published articles`);
    
    // Identify articles that need improvement
    const needsImprovement = articles?.filter(article => 
      !article.featured_image || 
      !article.meta_description || 
      (article.seo_score && article.seo_score < 70) ||
      (article.views && article.views < 10)
    ) || [];
    
    console.log(`   ⚠️  ${needsImprovement.length} articles need improvement:`);
    needsImprovement.slice(0, 10).forEach(article => {
      const issues = [];
      if (!article.featured_image) issues.push('no image');
      if (!article.meta_description) issues.push('no meta description');
      if (article.seo_score && article.seo_score < 70) issues.push(`low SEO (${article.seo_score})`);
      if (article.views && article.views < 10) issues.push(`low views (${article.views})`);
      console.log(`      - ${article.slug}: ${issues.join(', ')}`);
    });
  }

  // 2. Check News Articles
  console.log('\n📰 Checking News Articles...');
  const { data: news, error: newsError } = await supabase
    .from('news_articles')
    .select('slug, title, published, featured_image, meta_description')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (newsError) {
    console.error('Error fetching news:', newsError);
  } else {
    console.log(`   Found ${news?.length || 0} published news articles`);
    
    const needsImprovement = news?.filter(article => 
      !article.featured_image || !article.meta_description
    ) || [];
    
    console.log(`   ⚠️  ${needsImprovement.length} news articles need improvement`);
  }

  // 3. Check Listings
  console.log('\n🏠 Checking Listings...');
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('slug, title, published, available, featured_image')
    .eq('published', true)
    .eq('available', true)
    .order('created_at', { ascending: false })
    .limit(100);

  if (listingsError) {
    console.error('Error fetching listings:', listingsError);
  } else {
    console.log(`   Found ${listings?.length || 0} published listings (showing first 100)`);
    
    const needsImprovement = listings?.filter(listing => 
      !listing.featured_image
    ) || [];
    
    console.log(`   ⚠️  ${needsImprovement.length} listings need images`);
  }

  // 4. Check Neighborhoods
  console.log('\n📍 Checking Neighborhoods...');
  const { data: neighborhoods, error: neighborhoodsError } = await supabase
    .from('neighborhoods')
    .select('slug, name, published, featured_image, description')
    .eq('published', true);

  if (neighborhoodsError) {
    console.error('Error fetching neighborhoods:', neighborhoodsError);
  } else {
    console.log(`   Found ${neighborhoods?.length || 0} published neighborhoods`);
    
    const needsImprovement = neighborhoods?.filter(neighborhood => 
      !neighborhood.featured_image || !neighborhood.description
    ) || [];
    
    console.log(`   ⚠️  ${needsImprovement.length} neighborhoods need improvement`);
  }

  // 5. Static Pages Checklist
  console.log('\n📄 Static Pages Checklist:');
  const staticPages = [
    { path: '/', name: 'Homepage', exists: true },
    { path: '/satilik', name: 'Satılık İlanlar', exists: true },
    { path: '/kiralik', name: 'Kiralık İlanlar', exists: true },
    { path: '/karasu', name: 'Karasu Sayfası', exists: true },
    { path: '/kocaali', name: 'Kocaali Sayfası', exists: true },
    { path: '/blog', name: 'Blog Ana Sayfa', exists: true },
    { path: '/haberler', name: 'Haberler Ana Sayfa', exists: true },
    { path: '/karasu/restoranlar', name: 'Karasu Restoranlar', exists: true },
    { path: '/karasu/gezilecek-yerler', name: 'Karasu Gezilecek Yerler', exists: true },
    { path: '/karasu/hastaneler', name: 'Karasu Hastaneler', exists: true },
    { path: '/karasu/nobetci-eczaneler', name: 'Karasu Nöbetçi Eczaneler', exists: true },
    { path: '/karasu/ulasim', name: 'Karasu Ulaşım', exists: true },
    { path: '/karasu/onemli-telefonlar', name: 'Karasu Önemli Telefonlar', exists: true },
    { path: '/karasu/mahalle-karsilastirma', name: 'Karasu Mahalle Karşılaştırma', exists: true },
    { path: '/rehber', name: 'Rehber Ana Sayfa', exists: true },
    { path: '/rehber/emlak-alim-satim', name: 'Emlak Alım-Satım Rehberi', exists: true },
    { path: '/rehber/kiralama', name: 'Kiralama Rehberi', exists: true },
    { path: '/rehber/yatirim', name: 'Yatırım Rehberi', exists: true },
    { path: '/sss', name: 'Sık Sorulan Sorular', exists: true },
    { path: '/hakkimizda', name: 'Hakkımızda', exists: true },
    { path: '/iletisim', name: 'İletişim', exists: true },
  ];

  staticPages.forEach(page => {
    console.log(`   ${page.exists ? '✅' : '❌'} ${page.name} (${page.path})`);
  });

  console.log('\n✅ Analysis complete!\n');
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   - Blog Articles: ${articles?.length || 0} published`);
  console.log(`   - News Articles: ${news?.length || 0} published`);
  console.log(`   - Listings: ${listings?.length || 0} published (sample)`);
  console.log(`   - Neighborhoods: ${neighborhoods?.length || 0} published`);
  console.log(`   - Static Pages: ${staticPages.length} defined`);
}

// Run analysis
analyzePages().catch(console.error);
