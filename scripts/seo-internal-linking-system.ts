/**
 * SEO Internal Linking System
 * 
 * Automatically adds internal links to articles, blog posts, and hub pages
 * based on content analysis and keyword matching.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Internal link mapping
 */
const internalLinkMap: Record<string, { href: string; anchor: string; priority: number }[]> = {
  'karasu': [
    { href: '/karasu-satilik-ev', anchor: 'Karasu Satılık Ev', priority: 10 },
    { href: '/karasu-emlak-rehberi', anchor: 'Karasu Emlak Rehberi', priority: 9 },
    { href: '/karasu-yatirimlik-satilik-ev', anchor: 'Karasu Yatırımlık Satılık Ev', priority: 8 },
    { href: '/karasu-mahalleler', anchor: 'Karasu Mahalleler', priority: 7 },
  ],
  'kocaali': [
    { href: '/kocaali-satilik-ev', anchor: 'Kocaali Satılık Ev', priority: 10 },
    { href: '/kocaali-emlak-rehberi', anchor: 'Kocaali Emlak Rehberi', priority: 9 },
    { href: '/kocaali-yatirimlik-gayrimenkul', anchor: 'Kocaali Yatırımlık Gayrimenkul', priority: 8 },
  ],
  'sakarya': [
    { href: '/sakarya-emlak-yatirim-rehberi', anchor: 'Sakarya Emlak Yatırım Rehberi', priority: 10 },
    { href: '/karasu-satilik-ev', anchor: 'Karasu Satılık Ev', priority: 8 },
    { href: '/kocaali-satilik-ev', anchor: 'Kocaali Satılık Ev', priority: 8 },
  ],
  'yatırım': [
    { href: '/sakarya-emlak-yatirim-rehberi', anchor: 'Sakarya Emlak Yatırım Rehberi', priority: 10 },
    { href: '/karasu-yatirimlik-satilik-ev', anchor: 'Karasu Yatırımlık Satılık Ev', priority: 9 },
    { href: '/kocaali-yatirimlik-gayrimenkul', anchor: 'Kocaali Yatırımlık Gayrimenkul', priority: 9 },
    { href: '/karasu-vs-kocaali-yatirim', anchor: 'Karasu vs Kocaali Yatırım', priority: 8 },
  ],
  'karşılaştırma': [
    { href: '/karasu-vs-kocaali-satilik-ev', anchor: 'Karasu vs Kocaali Karşılaştırması', priority: 10 },
    { href: '/karasu-vs-kocaali-yatirim', anchor: 'Karasu vs Kocaali Yatırım', priority: 9 },
    { href: '/karasu-vs-kocaali-yasam', anchor: 'Karasu vs Kocaali Yaşam', priority: 8 },
  ],
  'mahalle': [
    { href: '/karasu-mahalleler', anchor: 'Karasu Mahalleler', priority: 10 },
    { href: '/karasu-satilik-ev', anchor: 'Karasu Satılık Ev', priority: 8 },
  ],
};

/**
 * Extract keywords from content
 */
function extractKeywords(content: string): string[] {
  const keywords: string[] = [];
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('karasu')) keywords.push('karasu');
  if (lowerContent.includes('kocaali')) keywords.push('kocaali');
  if (lowerContent.includes('sakarya')) keywords.push('sakarya');
  if (lowerContent.includes('yatırım') || lowerContent.includes('yatirim')) keywords.push('yatırım');
  if (lowerContent.includes('karşılaştır') || lowerContent.includes('karsilastir')) keywords.push('karşılaştırma');
  if (lowerContent.includes('mahalle')) keywords.push('mahalle');
  
  return keywords;
}

/**
 * Generate internal links for content
 */
function generateInternalLinks(content: string, maxLinks: number = 3): string {
  const keywords = extractKeywords(content);
  const links: Array<{ href: string; anchor: string; priority: number }> = [];
  
  // Collect links from all matched keywords
  for (const keyword of keywords) {
    if (internalLinkMap[keyword]) {
      links.push(...internalLinkMap[keyword]);
    }
  }
  
  // Sort by priority and remove duplicates
  const uniqueLinks = Array.from(
    new Map(links.map(link => [link.href, link])).values()
  ).sort((a, b) => b.priority - a.priority);
  
  // Take top N links
  const selectedLinks = uniqueLinks.slice(0, maxLinks);
  
  // Inject links into content (add at the end of first paragraph or create a "Related Links" section)
  if (selectedLinks.length === 0) {
    return content;
  }
  
  // Create related links section
  const linksSection = `
<h3>İlgili Sayfalar</h3>
<ul>
${selectedLinks.map(link => `  <li><a href="${link.href}">${link.anchor}</a></li>`).join('\n')}
</ul>
`;
  
  // Add before last paragraph or at the end
  const lastParagraphIndex = content.lastIndexOf('</p>');
  if (lastParagraphIndex > 0) {
    return content.slice(0, lastParagraphIndex) + linksSection + content.slice(lastParagraphIndex);
  }
  
  return content + linksSection;
}

/**
 * Process articles and add internal links
 */
async function processArticles() {
  console.log('🔗 Processing articles for internal linking...\n');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, slug')
    .eq('status', 'draft')
    .limit(50);
  
  if (error) {
    console.error('Error fetching articles:', error);
    return;
  }
  
  if (!articles || articles.length === 0) {
    console.log('No draft articles found');
    return;
  }
  
  console.log(`Found ${articles.length} articles to process\n`);
  
  let updated = 0;
  
  for (const article of articles) {
    try {
      const originalContent = article.content || '';
      if (!originalContent || originalContent.length < 200) {
        continue;
      }
      
      // Check if already has internal links section
      if (originalContent.includes('İlgili Sayfalar') || originalContent.includes('Related Links')) {
        console.log(`⏭️  Skipping "${article.title}" - already has links`);
        continue;
      }
      
      const updatedContent = generateInternalLinks(originalContent, 3);
      
      if (updatedContent === originalContent) {
        continue;
      }
      
      // Update article
      const { error: updateError } = await supabase
        .from('articles')
        .update({
          content: updatedContent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', article.id);
      
      if (updateError) {
        console.error(`❌ Error updating "${article.title}":`, updateError);
        continue;
      }
      
      // Log SEO event
      await supabase.from('seo_events').insert({
        event_type: 'internal_link_added',
        entity_type: 'article',
        entity_id: article.id,
        event_data: {
          article_title: article.title,
          links_added: extractKeywords(updatedContent).length,
        },
        status: 'completed',
      });
      
      updated++;
      console.log(`✅ Updated: "${article.title.substring(0, 50)}..."`);
    } catch (error: any) {
      console.error(`❌ Error processing "${article.title}":`, error.message);
    }
  }
  
  console.log(`\n\n✨ Internal linking completed!`);
  console.log(`📊 Updated: ${updated} articles`);
}

/**
 * Main execution
 */
async function main() {
  await processArticles();
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateInternalLinks, extractKeywords };
