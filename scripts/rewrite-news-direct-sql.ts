/**
 * News Rewriting Script - Direct SQL Version
 * Uses MCP Supabase tools to bypass client cache issues
 * 
 * Run with: pnpm tsx scripts/rewrite-news-direct-sql.ts
 */

import * as dotenv from 'dotenv';
import { getLatestGundemArticles } from '../apps/web/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '../apps/web/lib/rss/gundem-integration';

dotenv.config({ path: '.env.local' });

// Import rewrite functions from main script
function rewriteForRealEstate(article: any): {
  title: string;
  content: string;
  emlak_analysis: string;
  related_neighborhoods: string[];
  internal_links: string[];
} {
  const title = article.title;
  const originalContent = article.content || article.description || '';
  
  // Extract neighborhoods
  const neighborhoods = article.relatedNeighborhoods || [];
  
  // Generate real estate analysis
  const emlakAnalysis = `Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. ${originalContent.substring(0, 200)}...`;
  
  // Rewrite content with real estate angle
  const rewrittenContent = `${originalContent}\n\nBu haber, Karasu emlak piyasasını etkileyebilecek gelişmeler içermektedir.`;
  
  return {
    title: `Karasu Emlak Haberleri: ${title}`,
    content: rewrittenContent,
    emlak_analysis: emlakAnalysis,
    related_neighborhoods: neighborhoods,
    internal_links: ['/karasu-satilik-ev', '/karasu-yatirimlik-gayrimenkul'],
  };
}

async function rewriteNewsDirectSQL() {
  console.log('🚀 Rewriting news for real estate focus (Direct SQL)...\n');
  
  try {
    const gundemArticles = await getLatestGundemArticles(20);
    const enhancedArticles = gundemArticles.map(article => 
      enhanceArticleSEO(article, process.env.NEXT_PUBLIC_SITE_URL || 'https://karasuemlak.com')
    );
    const realEstateArticles = enhancedArticles.filter(a => a.isRealEstateRelated);
    
    console.log(`📰 Found ${realEstateArticles.length} real estate articles\n`);
    
    let created = 0;
    
    for (const article of realEstateArticles) {
      const rewritten = rewriteForRealEstate(article);
      const slug = article.slug || 
        article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      // Use MCP Supabase execute_sql
      const sql = `
        INSERT INTO news_articles (
          title, slug, source_url, source_domain, original_summary,
          emlak_analysis, emlak_analysis_generated, related_neighborhoods,
          related_listings, seo_title, seo_description, seo_keywords,
          published, featured, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
        ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          emlak_analysis = EXCLUDED.emlak_analysis,
          updated_at = EXCLUDED.updated_at
      `;
      
      // Note: This script requires manual execution via MCP tools
      // or can be run with a wrapper that uses MCP Supabase
      console.log(`📝 Would insert: "${rewritten.title.substring(0, 50)}..."`);
      created++;
    }
    
    console.log(`\n✨ Processed ${created} articles`);
    console.log(`\n⚠️  Note: Run SQL inserts manually via Supabase SQL Editor or use MCP tools`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

rewriteNewsDirectSQL().catch(console.error);
