#!/usr/bin/env tsx
/**
 * Import all news articles from Karasu Gündem RSS feed
 * 
 * Fetches news articles and imports them into news_articles table
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getLatestGundemArticles } from '../apps/web/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '../apps/web/lib/rss/gundem-integration';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function rewriteForRealEstate(article: any): {
  title: string;
  emlak_analysis: string;
  related_neighborhoods: string[];
} {
  const neighborhoods = ['Karasu', 'Kocaali', 'Merkez', 'Sahil'];
  const relatedNeighborhoods = neighborhoods.filter(n => 
    article.title.toLowerCase().includes(n.toLowerCase()) ||
    (article.description || '').toLowerCase().includes(n.toLowerCase())
  );

  const emlakAnalysis = `Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. ${article.description || ''} Emlak yatırımcıları ve alıcılar için bu haber önemli bilgiler içermektedir.`;

  return {
    title: article.title,
    emlak_analysis: emlakAnalysis,
    related_neighborhoods: relatedNeighborhoods.length > 0 ? relatedNeighborhoods : ['Karasu'],
  };
}

async function importAllNews() {
  console.log('📰 Importing News Articles from Karasu Gündem\n');
  
  try {
    // Fetch articles from RSS (get more to have variety)
    const gundemArticles = await getLatestGundemArticles(50);
    const enhancedArticles = gundemArticles.map(article => 
      enhanceArticleSEO(article, process.env.NEXT_PUBLIC_SITE_URL || 'https://karasuemlak.com')
    );
    
    // Filter for real estate related or include all for now
    const articlesToImport = enhancedArticles; // Import all for now
    
    console.log(`📰 Found ${articlesToImport.length} articles to import\n`);
    
    let imported = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const article of articlesToImport) {
      try {
        const slug = article.slug || 
          article.title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        // Check if already exists
        const { data: existing, error: checkError } = await supabase
          .from('news_articles')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        
        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`  ✗ Error checking existing: ${checkError.message}`);
          failed++;
          continue;
        }
        
        if (existing) {
          console.log(`  ⚠ Already exists: ${slug}`);
          skipped++;
          continue;
        }
        
        const rewritten = rewriteForRealEstate(article);
        
        // Insert news article
        const { error } = await supabase
          .from('news_articles')
          .insert({
            title: rewritten.title,
            slug: slug,
            source_url: article.link,
            source_domain: 'karasugundem.com',
            original_summary: article.description || article.content || '',
            emlak_analysis: rewritten.emlak_analysis,
            emlak_analysis_generated: true,
            related_neighborhoods: rewritten.related_neighborhoods,
            related_listings: [],
            seo_title: article.title,
            seo_description: article.description || rewritten.emlak_analysis.substring(0, 150),
            seo_keywords: ['karasu emlak', 'karasu haberleri', ...rewritten.related_neighborhoods],
            published_at: article.pubDate ? new Date(article.pubDate) : new Date(),
            published: true,
            featured: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (error) {
          console.error(`  ✗ Error: ${article.title.substring(0, 50)}... - ${error.message}`);
          failed++;
        } else {
          console.log(`  ✅ Imported: ${article.title.substring(0, 50)}...`);
          imported++;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`  ✗ Error processing: ${article.title.substring(0, 50)}... - ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\n✅ Final Summary:`);
    console.log(`   Total Processed: ${articlesToImport.length}`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success Rate: ${((imported / articlesToImport.length) * 100).toFixed(1)}%`);
    
    return { imported, failed, skipped };
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importAllNews().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { importAllNews };
