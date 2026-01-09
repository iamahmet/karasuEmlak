#!/usr/bin/env tsx
/**
 * Comprehensive Content Audit & Improvement Script
 * 
 * This script:
 * 1. Audits all content (articles, news, listings, neighborhoods)
 * 2. Identifies content gaps and quality issues
 * 3. Suggests improvements using Flagship Content prompt
 * 4. Generates improvement reports
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing required environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('  - OPENAI_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

interface ContentAudit {
  id: string;
  type: 'article' | 'news' | 'listing' | 'neighborhood';
  title: string;
  slug: string;
  status: string;
  issues: string[];
  suggestions: string[];
  score: number;
  wordCount: number;
  hasMetaDescription: boolean;
  hasKeywords: boolean;
  hasImages: boolean;
  hasFAQ: boolean;
  hasInternalLinks: boolean;
}

interface AuditReport {
  summary: {
    total: number;
    byType: Record<string, number>;
    averageScore: number;
    criticalIssues: number;
  };
  content: ContentAudit[];
  recommendations: string[];
}

/**
 * Analyze content quality
 */
function analyzeContent(content: string, title: string): {
  wordCount: number;
  hasImages: boolean;
  hasFAQ: boolean;
  hasInternalLinks: boolean;
  issues: string[];
} {
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
  const hasImages = /<img[^>]*>/i.test(content);
  const hasFAQ = /<h[2-6][^>]*>.*(?:sss|sık sorulan|faq|soru|cevap)/i.test(content) || 
                 /<dl|<dt|<dd/i.test(content);
  const hasInternalLinks = /<a[^>]*href=["']\/(?!http)/i.test(content);
  
  const issues: string[] = [];
  
  if (wordCount < 300) {
    issues.push(`İçerik çok kısa (${wordCount} kelime, minimum 300 önerilir)`);
  }
  if (wordCount < 800 && wordCount >= 300) {
    issues.push(`İçerik orta uzunlukta (${wordCount} kelime, 800+ önerilir)`);
  }
  if (!hasImages) {
    issues.push('Görsel eksik');
  }
  if (!hasFAQ) {
    issues.push('FAQ bölümü eksik');
  }
  if (!hasInternalLinks) {
    issues.push('İç link eksik');
  }
  
  // Check for AI-like patterns
  const aiPatterns = [
    /günümüzde/gi,
    /son yıllarda/gi,
    /bu yazıda sizlere/gi,
    /unutulmamalıdır ki/gi,
    /merhaba değerli okuyucular/gi,
    /in conclusion/gi,
    /furthermore/gi,
    /additionally/gi,
  ];
  
  const hasAIPatterns = aiPatterns.some(pattern => pattern.test(content));
  if (hasAIPatterns) {
    issues.push('AI benzeri ifadeler tespit edildi');
  }
  
  return {
    wordCount,
    hasImages,
    hasFAQ,
    hasInternalLinks,
    issues,
  };
}

/**
 * Generate improvement suggestions using OpenAI
 */
async function generateSuggestions(
  type: string,
  title: string,
  content: string,
  issues: string[]
): Promise<string[]> {
  if (issues.length === 0) return [];
  
  try {
    const prompt = `Aşağıdaki ${type} içeriği için iyileştirme önerileri sun:

Başlık: ${title}
İçerik: ${content.substring(0, 1000)}...
Tespit Edilen Sorunlar: ${issues.join(', ')}

Her sorun için kısa, uygulanabilir bir iyileştirme önerisi sun. Sadece önerileri liste halinde ver, başka açıklama yapma.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir içerik editörüsün. Kısa, uygulanabilir iyileştirme önerileri sunuyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const suggestions = completion.choices[0]?.message?.content || '';
    return suggestions.split('\n').filter(s => s.trim().length > 0).slice(0, 5);
  } catch (error) {
    console.error(`Error generating suggestions for ${title}:`, error);
    return [];
  }
}

/**
 * Audit articles
 */
async function auditArticles(): Promise<ContentAudit[]> {
  console.log('📝 Auditing articles...');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, content, excerpt, meta_description, keywords, status')
    .in('status', ['published', 'draft']);
  
  if (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
  
  const audits: ContentAudit[] = [];
  
  for (const article of articles || []) {
    const content = article.content || '';
    const analysis = analyzeContent(content, article.title);
    
    const score = calculateScore({
      wordCount: analysis.wordCount,
      hasMetaDescription: !!article.meta_description,
      hasKeywords: !!article.seo_keywords,
      hasImages: analysis.hasImages,
      hasFAQ: analysis.hasFAQ,
      hasInternalLinks: analysis.hasInternalLinks,
      issues: analysis.issues,
    });
    
    audits.push({
      id: article.id,
      type: 'article',
      title: article.title,
      slug: article.slug,
      status: article.status,
      issues: analysis.issues,
      suggestions: [], // Will be filled later
      score,
      wordCount: analysis.wordCount,
      hasMetaDescription: !!article.meta_description,
      hasKeywords: !!article.seo_keywords,
      hasImages: analysis.hasImages,
      hasFAQ: analysis.hasFAQ,
      hasInternalLinks: analysis.hasInternalLinks,
    });
  }
  
  return audits;
}

/**
 * Audit news articles
 */
async function auditNews(): Promise<ContentAudit[]> {
  console.log('📰 Auditing news articles...');
  
  const { data: news, error } = await supabase
    .from('news_articles')
    .select('id, title, slug, original_summary, emlak_analysis, seo_description, seo_keywords, published')
    .eq('published', true)
    .is('deleted_at', null);
  
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  
  const audits: ContentAudit[] = [];
  
  for (const item of news || []) {
    const content = (item.original_summary || '') + ' ' + (item.emlak_analysis || '');
    const analysis = analyzeContent(content, item.title);
    
    const score = calculateScore({
      wordCount: analysis.wordCount,
      hasMetaDescription: !!item.seo_description,
      hasKeywords: !!item.seo_keywords && (item.seo_keywords as string[]).length > 0,
      hasImages: analysis.hasImages,
      hasFAQ: analysis.hasFAQ,
      hasInternalLinks: analysis.hasInternalLinks,
      issues: analysis.issues,
    });
    
    audits.push({
      id: item.id,
      type: 'news',
      title: item.title,
      slug: item.slug,
      status: item.published ? 'published' : 'draft',
      issues: analysis.issues,
      suggestions: [],
      score,
      wordCount: analysis.wordCount,
      hasMetaDescription: !!item.seo_description,
      hasKeywords: !!item.seo_keywords && (item.seo_keywords as string[]).length > 0,
      hasImages: analysis.hasImages,
      hasFAQ: analysis.hasFAQ,
      hasInternalLinks: analysis.hasInternalLinks,
    });
  }
  
  return audits;
}

/**
 * Audit listings
 */
async function auditListings(): Promise<ContentAudit[]> {
  console.log('🏠 Auditing listings...');
  
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, slug, description_long, published, status')
    .eq('published', true)
    .eq('available', true)
    .is('deleted_at', null);
  
  if (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
  
  const audits: ContentAudit[] = [];
  
  for (const listing of listings || []) {
    const content = listing.description_long || '';
    const analysis = analyzeContent(content, listing.title);
    
    const score = calculateScore({
      wordCount: analysis.wordCount,
      hasMetaDescription: false, // Listings don't have meta_description field
      hasKeywords: false,
      hasImages: analysis.hasImages,
      hasFAQ: analysis.hasFAQ,
      hasInternalLinks: analysis.hasInternalLinks,
      issues: analysis.issues,
    });
    
    audits.push({
      id: listing.id,
      type: 'listing',
      title: listing.title,
      slug: listing.slug,
      status: listing.published ? 'published' : 'draft',
      issues: analysis.issues,
      suggestions: [],
      score,
      wordCount: analysis.wordCount,
      hasMetaDescription: false,
      hasKeywords: false,
      hasImages: analysis.hasImages,
      hasFAQ: analysis.hasFAQ,
      hasInternalLinks: analysis.hasInternalLinks,
    });
  }
  
  return audits;
}

/**
 * Calculate content quality score
 */
function calculateScore(metrics: {
  wordCount: number;
  hasMetaDescription: boolean;
  hasKeywords: boolean;
  hasImages: boolean;
  hasFAQ: boolean;
  hasInternalLinks: boolean;
  issues: string[];
}): number {
  let score = 100;
  
  // Word count (max -30)
  if (metrics.wordCount < 300) score -= 30;
  else if (metrics.wordCount < 800) score -= 15;
  else if (metrics.wordCount < 1500) score -= 5;
  
  // Meta description (-10)
  if (!metrics.hasMetaDescription) score -= 10;
  
  // Keywords (-10)
  if (!metrics.hasKeywords) score -= 10;
  
  // Images (-10)
  if (!metrics.hasImages) score -= 10;
  
  // FAQ (-10)
  if (!metrics.hasFAQ) score -= 10;
  
  // Internal links (-10)
  if (!metrics.hasInternalLinks) score -= 10;
  
  // AI patterns (-10 per pattern)
  const aiPatternCount = metrics.issues.filter(i => i.includes('AI')).length;
  score -= aiPatternCount * 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate comprehensive report
 */
async function generateReport(audits: ContentAudit[]): Promise<AuditReport> {
  const byType: Record<string, number> = {};
  let totalScore = 0;
  let criticalIssues = 0;
  
  for (const audit of audits) {
    byType[audit.type] = (byType[audit.type] || 0) + 1;
    totalScore += audit.score;
    if (audit.score < 50) criticalIssues++;
  }
  
  const averageScore = audits.length > 0 ? Math.round(totalScore / audits.length) : 0;
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  const lowScoreContent = audits.filter(a => a.score < 60);
  if (lowScoreContent.length > 0) {
    recommendations.push(`${lowScoreContent.length} içerik düşük kalitede (60 altı). Öncelikli iyileştirme gerekiyor.`);
  }
  
  const missingMeta = audits.filter(a => !a.hasMetaDescription).length;
  if (missingMeta > 0) {
    recommendations.push(`${missingMeta} içerikte meta description eksik.`);
  }
  
  const missingKeywords = audits.filter(a => !a.hasKeywords).length;
  if (missingKeywords > 0) {
    recommendations.push(`${missingKeywords} içerikte SEO keywords eksik.`);
  }
  
  const shortContent = audits.filter(a => a.wordCount < 300).length;
  if (shortContent > 0) {
    recommendations.push(`${shortContent} içerik çok kısa (300 kelime altı).`);
  }
  
  const noImages = audits.filter(a => !a.hasImages).length;
  if (noImages > 0) {
    recommendations.push(`${noImages} içerikte görsel eksik.`);
  }
  
  const noFAQ = audits.filter(a => !a.hasFAQ).length;
  if (noFAQ > 0) {
    recommendations.push(`${noFAQ} içerikte FAQ bölümü eksik.`);
  }
  
  const noLinks = audits.filter(a => !a.hasInternalLinks).length;
  if (noLinks > 0) {
    recommendations.push(`${noLinks} içerikte iç link eksik.`);
  }
  
  return {
    summary: {
      total: audits.length,
      byType,
      averageScore,
      criticalIssues,
    },
    content: audits,
    recommendations,
  };
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Starting comprehensive content audit...\n');
  
  // Audit all content types
  const [articles, news, listings] = await Promise.all([
    auditArticles(),
    auditNews(),
    auditListings(),
  ]);
  
  const allAudits = [...articles, ...news, ...listings];
  
  console.log(`\n✅ Audited ${allAudits.length} content items`);
  
  // Generate suggestions for low-score content
  console.log('\n💡 Generating improvement suggestions...');
  const lowScoreAudits = allAudits.filter(a => a.score < 70);
  
  for (let i = 0; i < Math.min(10, lowScoreAudits.length); i++) {
    const audit = lowScoreAudits[i];
    console.log(`  Generating suggestions for: ${audit.title.substring(0, 50)}...`);
    
    const content = await getContent(audit);
    audit.suggestions = await generateSuggestions(
      audit.type,
      audit.title,
      content,
      audit.issues
    );
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate report
  const report = await generateReport(allAudits);
  
  // Save report
  const reportPath = path.join(process.cwd(), 'CONTENT_AUDIT_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n📊 AUDIT SUMMARY');
  console.log('================');
  console.log(`Total Content: ${report.summary.total}`);
  console.log(`By Type:`);
  Object.entries(report.summary.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  console.log(`Average Score: ${report.summary.averageScore}/100`);
  console.log(`Critical Issues: ${report.summary.criticalIssues}`);
  console.log(`\n📋 Recommendations:`);
  report.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
  
  console.log(`\n✅ Full report saved to: ${reportPath}`);
}

/**
 * Get content for an audit item
 */
async function getContent(audit: ContentAudit): Promise<string> {
  let table = '';
  let selectFields = '';
  
  switch (audit.type) {
    case 'article':
      table = 'articles';
      selectFields = 'content';
      break;
    case 'news':
      table = 'news_articles';
      selectFields = 'original_summary, emlak_analysis';
      break;
    case 'listing':
      table = 'listings';
      selectFields = 'description_long';
      break;
    default:
      return '';
  }
  
  const { data, error } = await supabase
    .from(table)
    .select(selectFields)
    .eq('id', audit.id)
    .single();
  
  if (error || !data) return '';
  
  if (audit.type === 'news') {
    return (data.original_summary || '') + ' ' + (data.emlak_analysis || '');
  }
  
  return data.content || data.description_long || '';
}

// Run
main().catch(console.error);
