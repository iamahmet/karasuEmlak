/**
 * Insert news articles via direct SQL (bypasses schema cache issues)
 * Run with: pnpm tsx scripts/insert-news-via-sql.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { getLatestGundemArticles } from '../apps/web/lib/rss/gundem-parser';
import { enhanceArticleSEO } from '../apps/web/lib/rss/gundem-integration';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertNewsViaSQL() {
  console.log('🚀 Inserting news articles via SQL...\n');
  
  try {
    const gundemArticles = await getLatestGundemArticles(20);
    const enhancedArticles = gundemArticles.map(article => 
      enhanceArticleSEO(article, process.env.NEXT_PUBLIC_SITE_URL || 'https://karasuemlak.com')
    );
    const realEstateArticles = enhancedArticles.filter(a => a.isRealEstateRelated);
    
    console.log(`📰 Found ${realEstateArticles.length} real estate articles\n`);
    
    let created = 0;
    
    for (const article of realEstateArticles) {
      const slug = article.slug || 
        article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      
      const emlakAnalysis = `Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. ${article.description || ''}`;
      const neighborhoods = article.relatedNeighborhoods || [];
      
      // Build SQL insert
      const sql = `
        INSERT INTO news_articles (
          title, slug, source_url, source_domain, original_summary,
          emlak_analysis, emlak_analysis_generated, related_neighborhoods,
          related_listings, seo_title, seo_description, seo_keywords,
          published, featured, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) ON CONFLICT (slug) DO UPDATE SET
          title = EXCLUDED.title,
          emlak_analysis = EXCLUDED.emlak_analysis,
          updated_at = EXCLUDED.updated_at
        RETURNING id;
      `;
      
      const { data, error } = await supabase.rpc('exec_sql', {
        query: sql,
        params: [
          article.title,
          slug,
          article.link,
          'karasugundem.com',
          article.description || article.content || '',
          emlakAnalysis,
          true,
          neighborhoods,
          [],
          article.title,
          `${emlakAnalysis.substring(0, 150)}...`,
          ['karasu emlak', 'karasu haberleri', ...neighborhoods],
          false,
          false,
          new Date().toISOString(),
          new Date().toISOString()
        ]
      });
      
      if (error) {
        console.error(`❌ Error: ${article.title.substring(0, 50)}... - ${error.message}`);
        continue;
      }
      
      created++;
      console.log(`✅ Created: ${article.title.substring(0, 50)}...`);
    }
    
    console.log(`\n✨ Completed! Created: ${created}/${realEstateArticles.length}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

insertNewsViaSQL().catch(console.error);
