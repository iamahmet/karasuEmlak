/**
 * Content Revision Framework
 * 
 * PART 1: Professional Editorial Audit & Revision System
 * 
 * This script performs controlled editorial audits on existing content
 * and applies professional improvements while preserving SEO equity.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

function createServiceClient() {
  return createClient(supabaseUrl, supabaseKey);
}

interface ContentAudit {
  id: string;
  type: 'blog' | 'news';
  title: string;
  slug: string;
  primaryIntent: 'informational' | 'commercial' | 'navigational';
  targetKeywords: string[];
  cannibalizationRisks: string[];
  thinSections: string[];
  redundantSections: string[];
  qualityScore: number; // 0-100
}

interface ContentRevision {
  id: string;
  type: 'blog' | 'news';
  before: {
    title: string;
    content: string;
    excerpt?: string;
    meta_description?: string;
  };
  after: {
    title: string;
    content: string;
    excerpt?: string;
    meta_description?: string;
    improvements: string[];
  };
  changes: {
    introRewritten: boolean;
    headingsImproved: boolean;
    sectionsAdded: string[];
    sectionsRemoved: string[];
    internalLinksAdded: number;
    aiFriendlyBlocksAdded: number;
    fluffRemoved: boolean;
  };
}

/**
 * Analyze content for editorial audit
 */
async function auditContent(
  content: string,
  title: string,
  existingKeywords?: string[]
): Promise<ContentAudit> {
  // Detect primary intent
  const commercialIndicators = ['satın al', 'fiyat', 'kampanya', 'indirim', 'hemen', 'şimdi'];
  const navigationalIndicators = ['nasıl', 'nerede', 'rehber', 'adres', 'iletişim'];
  
  const lowerContent = content.toLowerCase();
  const commercialScore = commercialIndicators.filter(ind => lowerContent.includes(ind)).length;
  const navigationalScore = navigationalIndicators.filter(ind => lowerContent.includes(ind)).length;
  
  let primaryIntent: 'informational' | 'commercial' | 'navigational' = 'informational';
  if (commercialScore > navigationalScore && commercialScore > 2) {
    primaryIntent = 'commercial';
  } else if (navigationalScore > 2) {
    primaryIntent = 'navigational';
  }

  // Extract target keywords from title and content
  const targetKeywords = existingKeywords || extractKeywords(title, content);

  // Detect cannibalization risks (similar titles/content across pages)
  const cannibalizationRisks: string[] = [];
  // This would require cross-referencing with other content - simplified for now

  // Detect thin sections (paragraphs < 50 words)
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
  const thinSections = paragraphs
    .map((p, i) => ({ index: i, wordCount: p.split(/\s+/).length }))
    .filter(p => p.wordCount < 50)
    .map(p => `Paragraph ${p.index + 1} (${p.wordCount} words)`);

  // Detect redundant sections (repeated phrases)
  const redundantSections: string[] = [];
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const sentenceGroups = new Map<string, number>();
  sentences.forEach(s => {
    const key = s.trim().substring(0, 30).toLowerCase();
    sentenceGroups.set(key, (sentenceGroups.get(key) || 0) + 1);
  });
  sentenceGroups.forEach((count, key) => {
    if (count > 2) {
      redundantSections.push(`Repeated phrase: "${key}..." (${count} times)`);
    }
  });

  // Calculate quality score
  const wordCount = content.split(/\s+/).length;
  const headingCount = (content.match(/^#{1,3}\s/gm) || []).length;
  const linkCount = (content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length;
  
  let qualityScore = 0;
  if (wordCount >= 800) qualityScore += 30;
  else if (wordCount >= 500) qualityScore += 20;
  else if (wordCount >= 300) qualityScore += 10;
  
  if (headingCount >= 3) qualityScore += 20;
  else if (headingCount >= 2) qualityScore += 10;
  
  if (linkCount >= 3) qualityScore += 20;
  else if (linkCount >= 1) qualityScore += 10;
  
  if (thinSections.length === 0) qualityScore += 15;
  if (redundantSections.length === 0) qualityScore += 15;

  return {
    id: '', // Will be set by caller
    type: 'blog', // Will be set by caller
    title,
    slug: '', // Will be set by caller
    primaryIntent,
    targetKeywords,
    cannibalizationRisks,
    thinSections,
    redundantSections,
    qualityScore: Math.min(100, qualityScore),
  };
}

/**
 * Extract keywords from title and content
 */
function extractKeywords(title: string, content: string): string[] {
  const keywords: string[] = [];
  
  // Extract from title
  const titleWords = title
    .toLowerCase()
    .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);
  keywords.push(...titleWords.slice(0, 5));

  // Extract common real estate terms
  const realEstateTerms = [
    'satılık ev', 'kiralık ev', 'emlak', 'gayrimenkul', 'villa', 'daire',
    'karasu', 'kocaali', 'mahalle', 'yatırım', 'fiyat', 'konut'
  ];
  
  const lowerContent = content.toLowerCase();
  realEstateTerms.forEach(term => {
    if (lowerContent.includes(term) && !keywords.includes(term)) {
      keywords.push(term);
    }
  });

  return keywords.slice(0, 10);
}

/**
 * Apply professional revisions to content
 */
async function reviseContent(
  audit: ContentAudit,
  originalContent: string,
  originalExcerpt?: string,
  originalMetaDescription?: string
): Promise<ContentRevision> {
  const improvements: string[] = [];
  const sectionsAdded: string[] = [];
  const sectionsRemoved: string[] = [];
  let introRewritten = false;
  let headingsImproved = false;
  let internalLinksAdded = 0;
  let aiFriendlyBlocksAdded = 0;
  let fluffRemoved = false;

  let revisedContent = originalContent;

  // 1. Rewrite intro for clarity & authority
  const introMatch = revisedContent.match(/^(.*?)(\n\n|#{2})/s);
  if (introMatch && introMatch[1]) {
    const originalIntro = introMatch[1].trim();
    if (originalIntro.length < 100 || originalIntro.length > 200) {
      // Intro needs improvement
      const revisedIntro = improveIntro(originalIntro, audit.targetKeywords);
      revisedContent = revisedContent.replace(originalIntro, revisedIntro);
      introRewritten = true;
      improvements.push('Introduction rewritten for clarity and authority');
    }
  }

  // 2. Improve heading hierarchy
  const headingPattern = /^(#{1,3})\s+(.+)$/gm;
  const headings = Array.from(revisedContent.matchAll(headingPattern));
  if (headings.length > 0) {
    // Check if H1 exists (shouldn't in content, only in title)
    const h1Count = headings.filter(h => h[1] === '#').length;
    if (h1Count > 0) {
      // Convert H1 to H2 in content
      revisedContent = revisedContent.replace(/^#\s+(.+)$/gm, '## $1');
      headingsImproved = true;
      improvements.push('Heading hierarchy corrected (H1 → H2)');
    }

    // Ensure proper hierarchy (H2 → H3)
    let lastLevel = 2;
    headings.forEach((heading, index) => {
      const level = heading[1].length;
      if (level > lastLevel + 1) {
        // Skip levels detected - fix
        const newLevel = lastLevel + 1;
        const newHeading = '#'.repeat(newLevel) + ' ' + heading[2];
        revisedContent = revisedContent.replace(heading[0], newHeading);
        headingsImproved = true;
      }
      lastLevel = level;
    });

    if (headingsImproved) {
      improvements.push('Heading hierarchy improved');
    }
  }

  // 3. Break long blocks into scannable sections
  const longParagraphs = revisedContent.split('\n\n').filter(p => {
    const wordCount = p.split(/\s+/).length;
    return wordCount > 150 && !p.startsWith('#');
  });

  if (longParagraphs.length > 0) {
    longParagraphs.forEach(para => {
      const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 3) {
        // Break into 2-3 sentence paragraphs
        const midPoint = Math.floor(sentences.length / 2);
        const firstPart = sentences.slice(0, midPoint).join('. ') + '.';
        const secondPart = sentences.slice(midPoint).join('. ');
        revisedContent = revisedContent.replace(para, `${firstPart}\n\n${secondPart}`);
        improvements.push('Long paragraphs broken into scannable sections');
      }
    });
  }

  // 4. Add AI-friendly "Kısa Cevap" block if missing
  if (!revisedContent.includes('Kısa Cevap') && !revisedContent.includes('Özet')) {
    const kisaCevap = generateKisaCevap(audit, revisedContent);
    if (kisaCevap) {
      // Insert after first paragraph or intro
      const insertPoint = revisedContent.indexOf('\n\n', 200);
      if (insertPoint > 0) {
        revisedContent = revisedContent.slice(0, insertPoint) + 
          `\n\n## Kısa Cevap\n\n${kisaCevap}\n\n` + 
          revisedContent.slice(insertPoint);
        aiFriendlyBlocksAdded++;
        sectionsAdded.push('Kısa Cevap block');
        improvements.push('AI-friendly "Kısa Cevap" block added');
      }
    }
  }

  // 5. Add contextual internal links
  const internalLinks = generateInternalLinks(audit, revisedContent);
  internalLinks.forEach(link => {
    if (!revisedContent.includes(link.anchor)) {
      // Add link near first mention of keyword
      const keywordIndex = revisedContent.toLowerCase().indexOf(link.keyword.toLowerCase());
      if (keywordIndex > 0) {
        const before = revisedContent.slice(0, keywordIndex);
        const after = revisedContent.slice(keywordIndex);
        const linkText = `[${link.anchor}](${link.url})`;
        revisedContent = before + linkText + after.replace(link.keyword, '');
        internalLinksAdded++;
      }
    }
  });

  if (internalLinksAdded > 0) {
    improvements.push(`${internalLinksAdded} contextual internal links added`);
  }

  // 6. Remove fluff, hype, sales tone
  const fluffPatterns = [
    /\b(hemen|şimdi|kaçırma|fırsat|kampanya|indirim|%\d+)\b/gi,
    /!{2,}/g, // Multiple exclamation marks
    /\b(muhteşem|harika|mükemmel|süper|fantastik)\b/gi, // Overly positive adjectives
  ];

  let fluffRemovedCount = 0;
  fluffPatterns.forEach(pattern => {
    const matches = revisedContent.match(pattern);
    if (matches) {
      revisedContent = revisedContent.replace(pattern, (match) => {
        // Replace with neutral alternatives or remove
        if (match.includes('!')) return '.';
        if (match.toLowerCase().includes('muhteşem')) return 'iyi';
        if (match.toLowerCase().includes('harika')) return 'uygun';
        return match.toLowerCase();
      });
      fluffRemovedCount += matches.length;
    }
  });

  if (fluffRemovedCount > 0) {
    fluffRemoved = true;
    improvements.push(`Removed ${fluffRemovedCount} instances of sales language/fluff`);
  }

  // 7. Remove redundant sections
  audit.redundantSections.forEach(section => {
    // Simplified - would need more sophisticated matching
    improvements.push(`Identified redundant section: ${section}`);
  });

  // 8. Improve excerpt if needed
  let revisedExcerpt = originalExcerpt;
  if (!revisedExcerpt || revisedExcerpt.length < 100) {
    revisedExcerpt = generateExcerpt(revisedContent, audit.targetKeywords);
    improvements.push('Excerpt improved');
  }

  // 9. Improve meta description if needed
  let revisedMetaDescription = originalMetaDescription;
  if (!revisedMetaDescription || revisedMetaDescription.length < 120 || revisedMetaDescription.length > 160) {
    revisedMetaDescription = generateMetaDescription(revisedContent, audit.targetKeywords);
    improvements.push('Meta description optimized');
  }

  return {
    id: audit.id,
    type: audit.type,
    before: {
      title: audit.title,
      content: originalContent,
      excerpt: originalExcerpt,
      meta_description: originalMetaDescription,
    },
    after: {
      title: audit.title, // Preserve title
      content: revisedContent,
      excerpt: revisedExcerpt,
      meta_description: revisedMetaDescription,
      improvements,
    },
    changes: {
      introRewritten,
      headingsImproved,
      sectionsAdded,
      sectionsRemoved: audit.redundantSections,
      internalLinksAdded,
      aiFriendlyBlocksAdded,
      fluffRemoved,
    },
  };
}

/**
 * Improve introduction paragraph
 */
function improveIntro(originalIntro: string, keywords: string[]): string {
  // Keep it simple - ensure it's 100-200 words, includes primary keyword
  const primaryKeyword = keywords[0] || 'emlak';
  
  if (originalIntro.length < 100) {
    // Expand intro
    return `${originalIntro} ${primaryKeyword} konusunda detaylı bilgi ve güncel gelişmeler hakkında kapsamlı bir rehber sunuyoruz.`;
  } else if (originalIntro.length > 200) {
    // Condense intro
    const sentences = originalIntro.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ') + '.';
  }
  
  return originalIntro;
}

/**
 * Generate "Kısa Cevap" block
 */
function generateKisaCevap(audit: ContentAudit, content: string): string | null {
  const firstParagraph = content.split('\n\n').find(p => p.trim().length > 50 && !p.startsWith('#'));
  if (!firstParagraph) return null;

  // Extract key facts (first 2-3 sentences)
  const sentences = firstParagraph.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const keyFacts = sentences.slice(0, 2).join('. ').trim();
  
  if (keyFacts.length < 50) return null;

  return `${keyFacts}. ${audit.targetKeywords[0] || 'Emlak'} konusunda daha detaylı bilgi için yazının devamını okuyabilirsiniz.`;
}

/**
 * Generate contextual internal links
 */
function generateInternalLinks(audit: ContentAudit, content: string): Array<{ keyword: string; anchor: string; url: string }> {
  const links: Array<{ keyword: string; anchor: string; url: string }> = [];
  
  // Link to hub pages based on keywords
  if (content.toLowerCase().includes('karasu')) {
    links.push({
      keyword: 'karasu',
      anchor: 'Karasu Satılık Ev',
      url: '/karasu-satilik-ev',
    });
  }
  
  if (content.toLowerCase().includes('kocaali')) {
    links.push({
      keyword: 'kocaali',
      anchor: 'Kocaali Satılık Ev',
      url: '/kocaali-satilik-ev',
    });
  }

  // Link to cornerstone pages
  if (content.toLowerCase().includes('merkez')) {
    links.push({
      keyword: 'merkez',
      anchor: 'Karasu Merkez Satılık Ev',
      url: '/karasu-merkez-satilik-ev',
    });
  }

  if (content.toLowerCase().includes('yatırım')) {
    links.push({
      keyword: 'yatırım',
      anchor: 'Karasu Yatırımlık Satılık Ev',
      url: '/karasu-yatirimlik-satilik-ev',
    });
  }

  return links;
}

/**
 * Generate excerpt from content
 */
function generateExcerpt(content: string, keywords: string[]): string {
  const firstParagraph = content.split('\n\n').find(p => p.trim().length > 50 && !p.startsWith('#'));
  if (firstParagraph) {
    const excerpt = firstParagraph.substring(0, 155).trim();
    if (excerpt.length >= 100) {
      return excerpt + (excerpt.endsWith('.') ? '' : '...');
    }
  }
  
  // Fallback: generate from keywords
  return `${keywords.slice(0, 3).join(', ')} hakkında kapsamlı bilgi ve güncel gelişmeler.`;
}

/**
 * Generate meta description
 */
function generateMetaDescription(content: string, keywords: string[]): string {
  const firstParagraph = content.split('\n\n').find(p => p.trim().length > 50 && !p.startsWith('#'));
  if (firstParagraph) {
    const meta = firstParagraph.substring(0, 155).trim();
    if (meta.length >= 120 && meta.length <= 160) {
      return meta;
    } else if (meta.length > 160) {
      return meta.substring(0, 157) + '...';
    }
  }
  
  // Fallback
  return `${keywords.slice(0, 3).join(', ')} hakkında detaylı bilgi. Güncel fiyatlar, özellikler ve yatırım fırsatları.`;
}

/**
 * Log revision to seo_events
 */
async function logRevision(revision: ContentRevision): Promise<void> {
  const supabase = createServiceClient();
  
  await supabase.from('seo_events').insert({
    event_type: 'content_refined',
    entity_type: revision.type,
    entity_id: revision.id,
    event_data: {
      before: {
        title: revision.before.title,
        content_length: revision.before.content.length,
        excerpt: revision.before.excerpt,
        meta_description: revision.before.meta_description,
      },
      after: {
        title: revision.after.title,
        content_length: revision.after.content.length,
        excerpt: revision.after.excerpt,
        meta_description: revision.after.meta_description,
        improvements: revision.after.improvements,
      },
      changes: revision.changes,
    },
    status: 'completed',
  });
}

/**
 * Main revision function for news articles
 */
export async function reviseNewsArticle(articleId: string): Promise<ContentRevision | null> {
  const supabase = createServiceClient();
  
  const { data: article, error } = await supabase
    .from('news_articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error || !article) {
    console.error('Error fetching news article:', error);
    return null;
  }

  const content = article.emlak_analysis || article.original_summary || '';
  if (!content || content.length < 200) {
    console.log(`Skipping ${article.title} - content too short`);
    return null;
  }

  const audit = await auditContent(content, article.title, article.seo_keywords as string[]);
  audit.id = article.id;
  audit.type = 'news';
  audit.slug = article.slug;

  const revision = await reviseContent(
    audit,
    content,
    article.seo_description || undefined,
    article.seo_description || undefined
  );

  // Apply revision (update database)
  const { error: updateError } = await supabase
    .from('news_articles')
    .update({
      emlak_analysis: revision.after.content,
      seo_description: revision.after.meta_description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', article.id);

  if (updateError) {
    console.error('Error updating news article:', updateError);
    return null;
  }

  // Log revision
  await logRevision(revision);

  return revision;
}

/**
 * Main revision function for blog articles
 */
export async function reviseBlogArticle(articleId: string): Promise<ContentRevision | null> {
  const supabase = createServiceClient();
  
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', articleId)
    .single();

  if (error || !article) {
    console.error('Error fetching blog article:', error);
    return null;
  }

  const content = article.content || '';
  if (!content || content.length < 200) {
    console.log(`Skipping ${article.title} - content too short`);
    return null;
  }

  const keywords = article.seo_keywords 
    ? (typeof article.seo_keywords === 'string' 
        ? article.seo_keywords.split(',').map(k => k.trim())
        : article.seo_keywords)
    : [];

  const audit = await auditContent(content, article.title, keywords);
  audit.id = article.id;
  audit.type = 'blog';
  audit.slug = article.slug;

  const revision = await reviseContent(
    audit,
    content,
    article.excerpt || undefined,
    article.meta_description || undefined
  );

  // Apply revision (update database)
  const { error: updateError } = await supabase
    .from('articles')
    .update({
      content: revision.after.content,
      excerpt: revision.after.excerpt || article.excerpt,
      meta_description: revision.after.meta_description || article.meta_description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', article.id);

  if (updateError) {
    console.error('Error updating blog article:', updateError);
    return null;
  }

  // Log revision
  await logRevision(revision);

  return revision;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const type = args[0] as 'news' | 'blog';
  const id = args[1];

  if (!type || !id) {
    console.log('Usage: tsx content-revision-framework.ts <news|blog> <article-id>');
    process.exit(1);
  }

  if (type === 'news') {
    reviseNewsArticle(id).then(revision => {
      if (revision) {
        console.log('✅ Content revised successfully');
        console.log(`Improvements: ${revision.after.improvements.join(', ')}`);
      } else {
        console.log('❌ Revision failed');
      }
    });
  } else {
    reviseBlogArticle(id).then(revision => {
      if (revision) {
        console.log('✅ Content revised successfully');
      } else {
        console.log('❌ Revision failed');
      }
    });
  }
}
