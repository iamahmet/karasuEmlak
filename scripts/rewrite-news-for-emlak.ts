/**
 * News Rewriting Script for Real Estate Focus
 * 
 * Takes news from Karasu Gündem and rewrites them with:
 * - Real estate angle
 * - "Bu ne anlama geliyor?" section
 * - Internal links to hubs and neighborhoods
 * - Discover-friendly signals
 * 
 * Run with: pnpm tsx scripts/rewrite-news-for-emlak.ts
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

// Create client with schema refresh capability
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'karasu-emlak-scripts',
    },
  },
});

// Force schema refresh by querying table structure
async function refreshSchema() {
  try {
    await supabase.from('news_articles').select('id').limit(1);
  } catch (error) {
    // Ignore errors, just trigger schema fetch
  }
}

/**
 * Rewrite article with real estate angle
 */
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
  const emlakAnalysis = generateEmlakAnalysis(title, originalContent, neighborhoods);
  
  // Rewrite content with real estate angle
  const rewrittenContent = rewriteContent(originalContent, neighborhoods);
  
  // Generate internal links
  const internalLinks = generateInternalLinks(neighborhoods, title);
  
  return {
    title: enhanceTitleForEmlak(title),
    content: rewrittenContent,
    emlak_analysis: emlakAnalysis,
    related_neighborhoods: neighborhoods,
    internal_links: internalLinks,
  };
}

/**
 * Enhance title for real estate focus
 */
function enhanceTitleForEmlak(title: string): string {
  // Don't change if already emlak-focused
  if (title.toLowerCase().includes('emlak') || 
      title.toLowerCase().includes('gayrimenkul') ||
      title.toLowerCase().includes('konut')) {
    return title;
  }
  
  // Add emlak context if relevant
  const emlakKeywords = ['proje', 'yapı', 'inşaat', 'mahalle', 'bölge', 'altyapı', 'ulaşım'];
  if (emlakKeywords.some(keyword => title.toLowerCase().includes(keyword))) {
    return `${title} - Emlak Piyasasına Etkisi`;
  }
  
  return title;
}

/**
 * Rewrite content with real estate angle
 */
function rewriteContent(originalContent: string, neighborhoods: string[]): string {
  let content = originalContent;
  
  // Add real estate context
  if (!content.toLowerCase().includes('emlak') && 
      !content.toLowerCase().includes('gayrimenkul')) {
    content += `\n\nBu gelişme, Karasu emlak piyasasını da etkileyebilir. `;
    
    if (neighborhoods.length > 0) {
      content += `Özellikle ${neighborhoods.join(', ')} mahallelerinde emlak değerleri üzerinde etkili olabilir. `;
    }
    
    content += `Emlak yatırımcıları ve alıcılar için bu gelişmeleri takip etmek önemlidir.`;
  }
  
  return content;
}

/**
 * Generate "Bu ne anlama geliyor?" analysis
 */
function generateEmlakAnalysis(title: string, content: string, neighborhoods: string[]): string {
  let analysis = 'Bu gelişme, Karasu emlak piyasası açısından önemli sonuçlar doğurabilir. ';
  
  // Check for project-related keywords
  if (title.toLowerCase().includes('proje') || content.toLowerCase().includes('proje')) {
    analysis += 'Yeni projeler, bölgenin emlak değerini artırabilir ve yatırımcılar için fırsatlar yaratabilir. ';
  }
  
  // Check for infrastructure keywords
  if (title.toLowerCase().includes('altyapı') || 
      title.toLowerCase().includes('ulaşım') ||
      content.toLowerCase().includes('yol') ||
      content.toLowerCase().includes('otoyol')) {
    analysis += 'Altyapı gelişmeleri, bölgenin erişilebilirliğini artırarak emlak değerlerini olumlu yönde etkileyebilir. ';
  }
  
  // Check for neighborhood mentions
  if (neighborhoods.length > 0) {
    analysis += `Özellikle ${neighborhoods.join(', ')} mahallelerinde bu gelişmeler emlak piyasasını etkileyebilir. `;
  }
  
  analysis += 'Emlak yatırımcıları ve alıcılar için bu gelişmeleri takip etmek ve uzun vadeli yatırım stratejilerini buna göre planlamak önemlidir.';
  
  return analysis;
}

/**
 * Generate internal links
 */
function generateInternalLinks(neighborhoods: string[], title: string): string[] {
  const links: string[] = [];
  
  // Always link to main hubs
  links.push('/karasu-satilik-ev');
  links.push('/kocaali-satilik-ev');
  
  // Link to relevant neighborhoods
  neighborhoods.forEach(neighborhood => {
    const slug = neighborhood.toLowerCase().replace(/\s+/g, '-');
    links.push(`/mahalle/${slug}`);
  });
  
  // Link to investment page if relevant
  if (title.toLowerCase().includes('yatırım') || 
      title.toLowerCase().includes('proje') ||
      title.toLowerCase().includes('gelişme')) {
    links.push('/karasu-yatirimlik-gayrimenkul');
    links.push('/kocaali-yatirimlik-gayrimenkul');
  }
  
  // Link to price analysis if relevant
  if (title.toLowerCase().includes('fiyat') || 
      title.toLowerCase().includes('değer')) {
    links.push('/karasu-satilik-ev-fiyatlari');
    links.push('/kocaali-satilik-ev-fiyatlari');
  }
  
  return [...new Set(links)]; // Remove duplicates
}

/**
 * Main function
 */
async function rewriteNewsForEmlak() {
  console.log('🚀 Rewriting news for real estate focus...\n');
  
  // Refresh schema cache
  await refreshSchema();
  
  try {
    // Fetch latest Gündem articles
    const gundemArticles = await getLatestGundemArticles(20);
    console.log(`📰 Fetched ${gundemArticles.length} articles from Karasu Gündem\n`);
    
    // Enhance with SEO metadata
    const enhancedArticles = gundemArticles.map(article => 
      enhanceArticleSEO(article, process.env.NEXT_PUBLIC_SITE_URL || 'https://karasuemlak.com')
    );
    
    // Filter real estate related
    const realEstateArticles = enhancedArticles.filter(
      article => article.isRealEstateRelated
    );
    
    console.log(`🏠 Found ${realEstateArticles.length} real estate related articles\n`);
    
    let created = 0;
    let updated = 0;
    
    for (const article of realEstateArticles) {
      try {
        const rewritten = rewriteForRealEstate(article);
        
        // Generate slug
        const slug = article.slug || 
          article.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        
        // Check if article exists
        const { data: existing } = await supabase
          .from('news_articles')
          .select('id, slug')
          .eq('slug', slug)
          .maybeSingle();
        
        const newsData: any = {
          title: rewritten.title,
          slug,
          source_url: article.link,
          source_domain: 'karasugundem.com',
          original_summary: article.description || article.content || '',
          emlak_analysis: rewritten.emlak_analysis,
          emlak_analysis_generated: true,
          related_neighborhoods: rewritten.related_neighborhoods,
          related_listings: [],
          seo_title: rewritten.title,
          seo_description: `${rewritten.emlak_analysis.substring(0, 150)}...`,
          seo_keywords: [
            'karasu emlak',
            'karasu haberleri',
            ...rewritten.related_neighborhoods,
            ...(article.relatedNeighborhoods || []),
          ],
          published: false, // Admin review required
          featured: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Only add published_at if we have a date (for published articles)
        // For drafts, omit published_at (it's nullable)
        
        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('news_articles')
            .update({
              ...newsData,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
          
          if (error) {
            console.error(`❌ Error updating "${rewritten.title}":`, error.message);
            continue;
          }
          
          updated++;
          console.log(`✅ Updated: "${rewritten.title.substring(0, 50)}..."`);
        } else {
          // Create new - use direct SQL via execute_sql to bypass schema cache
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
            RETURNING id;
          `;
          
          const { data, error } = await supabase.rpc('exec_sql', {
            query: sql,
            params: [
              rewritten.title,
              slug,
              article.link,
              'karasugundem.com',
              article.description || article.content || '',
              rewritten.emlak_analysis,
              true,
              rewritten.related_neighborhoods,
              [],
              rewritten.title,
              `${rewritten.emlak_analysis.substring(0, 150)}...`,
              ['karasu emlak', 'karasu haberleri', ...rewritten.related_neighborhoods],
              false,
              false,
              new Date().toISOString(),
              new Date().toISOString()
            ]
          });
          
          // Fallback: Try direct insert with explicit null for published_at
          if (error) {
            const insertData: any = {
              title: rewritten.title,
              slug,
              source_url: article.link,
              source_domain: 'karasugundem.com',
              original_summary: article.description || article.content || '',
              emlak_analysis: rewritten.emlak_analysis,
              emlak_analysis_generated: true,
              related_neighborhoods: rewritten.related_neighborhoods,
              related_listings: [],
              seo_title: rewritten.title,
              seo_description: `${rewritten.emlak_analysis.substring(0, 150)}...`,
              seo_keywords: ['karasu emlak', 'karasu haberleri', ...rewritten.related_neighborhoods],
              published: false,
              featured: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            
            // Try insert without published_at (it's nullable)
            const { error: insertError } = await supabase
              .from('news_articles')
              .insert(insertData);
            
            if (insertError) {
              console.error(`❌ Error creating "${rewritten.title}":`, insertError.message);
              continue;
            }
          }
          
          created++;
          console.log(`✅ Created: "${rewritten.title.substring(0, 50)}..."`);
        }
      } catch (error: any) {
        console.error(`❌ Error processing article:`, error.message);
      }
    }
    
    console.log(`\n✨ News rewriting completed!`);
    console.log(`📊 Created: ${created}, Updated: ${updated}, Total: ${realEstateArticles.length}`);
    console.log(`\n⚠️  Note: Articles are created as drafts. Please review and publish from admin panel.`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

rewriteNewsForEmlak().catch(console.error);
