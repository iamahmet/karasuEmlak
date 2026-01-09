/**
 * News Insert Script - Using MCP Supabase Tools
 * Bypasses client cache issues by using direct SQL execution
 * 
 * Run with: This script generates SQL that can be executed via MCP tools
 */

import * as dotenv from 'dotenv';
import { getLatestGundemArticles } from '../apps/web/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '../apps/web/lib/rss/gundem-integration';

dotenv.config({ path: '.env.local' });

function rewriteForRealEstate(article: any): {
  title: string;
  content: string;
  emlak_analysis: string;
  related_neighborhoods: string[];
  internal_links: string[];
} {
  const title = article.title;
  const originalContent = article.content || article.description || '';
  const neighborhoods = article.relatedNeighborhoods || [];
  
  const emlakAnalysis = `Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. ${originalContent.substring(0, 200)}...`;
  
  return {
    title: `Karasu Emlak Haberleri: ${title}`,
    content: `${originalContent}\n\nBu haber, Karasu emlak piyasasını etkileyebilecek gelişmeler içermektedir.`,
    emlak_analysis: emlakAnalysis,
    related_neighborhoods: neighborhoods,
    internal_links: ['/karasu-satilik-ev', '/karasu-yatirimlik-gayrimenkul'],
  };
}

async function generateNewsSQL() {
  console.log('🚀 Generating news articles SQL...\n');
  
  try {
    const gundemArticles = await getLatestGundemArticles(20);
    const enhancedArticles = gundemArticles.map(article => 
      enhanceArticleSEO(article, process.env.NEXT_PUBLIC_SITE_URL || 'https://karasuemlak.com')
    );
    const realEstateArticles = enhancedArticles.filter(a => a.isRealEstateRelated);
    
    console.log(`📰 Found ${realEstateArticles.length} real estate articles\n`);
    
    const sqlStatements: string[] = [];
    
    for (const article of realEstateArticles) {
      const rewritten = rewriteForRealEstate(article);
      const slug = article.slug || 
        article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      // Escape single quotes in SQL
      const escapeSQL = (str: string) => str.replace(/'/g, "''");
      
      const sql = `
INSERT INTO news_articles (
  title, slug, source_url, source_domain, original_summary,
  emlak_analysis, emlak_analysis_generated, related_neighborhoods,
  related_listings, seo_title, seo_description, seo_keywords,
  published, featured, created_at, updated_at
) VALUES (
  '${escapeSQL(rewritten.title)}',
  '${slug}',
  '${escapeSQL(article.link)}',
  'karasugundem.com',
  '${escapeSQL(article.description || article.content || '')}',
  '${escapeSQL(rewritten.emlak_analysis)}',
  true,
  ARRAY[${rewritten.related_neighborhoods.map(n => `'${escapeSQL(n)}'`).join(', ')}],
  ARRAY[]::TEXT[],
  '${escapeSQL(rewritten.title)}',
  '${escapeSQL(rewritten.emlak_analysis.substring(0, 150))}...',
  ARRAY['karasu emlak', 'karasu haberleri', ${rewritten.related_neighborhoods.map(n => `'${escapeSQL(n)}'`).join(', ')}],
  false,
  false,
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  emlak_analysis = EXCLUDED.emlak_analysis,
  updated_at = EXCLUDED.updated_at;
`;
      
      sqlStatements.push(sql);
      console.log(`✅ Generated SQL for: "${rewritten.title.substring(0, 50)}..."`);
    }
    
    console.log(`\n✨ Generated ${sqlStatements.length} SQL statements`);
    console.log(`\n⚠️  Note: Execute these SQL statements via Supabase SQL Editor or MCP tools`);
    
    // Write to file
    const fs = await import('fs/promises');
    await fs.writeFile(
      'scripts/news-insert-statements.sql',
      sqlStatements.join('\n\n'),
      'utf-8'
    );
    
    console.log(`\n📝 SQL statements written to: scripts/news-insert-statements.sql`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

generateNewsSQL().catch(console.error);
