#!/usr/bin/env tsx

/**
 * Review Recent Articles Script
 * Reviews and suggests improvements for recent blog articles
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ArticleReview {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  published_at: string | null;
  issues: string[];
  suggestions: string[];
  score: number; // 0-100
}

const aiIndicators = [
  'sonuç olarak',
  'özetlemek gerekirse',
  'kısaca',
  'sonuçta',
  'bu nedenle',
  'bu bağlamda',
  'genel olarak',
  'değerlendirme yapıldığında',
];

const conclusionHeadings = [
  /<h2[^>]*>.*?[Ss]onu[çc][^<]*<\/h2>/i,
  /<h3[^>]*>.*?[Ss]onu[çc][^<]*<\/h3>/i,
  /<h2[^>]*>.*?[Öö]zet[^<]*<\/h2>/i,
  /<h2[^>]*>.*?[Dd]eğerlendirme[^<]*<\/h2>/i,
];

function reviewArticle(article: any): ArticleReview {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;
  
  const content = article.content || '';
  const title = article.title || '';
  const excerpt = article.excerpt || '';
  
  // Check for conclusion sections
  const hasConclusionHeading = conclusionHeadings.some(pattern => pattern.test(content));
  if (hasConclusionHeading) {
    issues.push('Contains conclusion heading (AI-like)');
    score -= 20;
    suggestions.push('Remove conclusion headings, end naturally');
  }
  
  // Check for AI phrases
  const lowerContent = content.toLowerCase();
  const foundPhrases = aiIndicators.filter(phrase => lowerContent.includes(phrase));
  if (foundPhrases.length > 0) {
    issues.push(`Contains AI-like phrases: ${foundPhrases.join(', ')}`);
    score -= 10 * foundPhrases.length;
    suggestions.push('Replace AI phrases with more natural language');
  }
  
  // Check content length
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 500) {
    issues.push('Content too short (less than 500 words)');
    score -= 15;
    suggestions.push('Expand content to at least 800-1000 words');
  }
  
  // Check for structure
  const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
  if (h2Count < 2) {
    issues.push('Insufficient structure (less than 2 H2 headings)');
    score -= 10;
    suggestions.push('Add more H2 headings for better structure');
  }
  
  // Check for excerpt
  if (!excerpt || excerpt.length < 100) {
    issues.push('Missing or short excerpt');
    score -= 5;
    suggestions.push('Add a compelling excerpt (150-200 characters)');
  }
  
  // Check for category
  if (!article.category) {
    issues.push('Missing category');
    score -= 5;
    suggestions.push('Assign a category for better organization');
  }
  
  // Check for featured image
  if (!article.featured_image) {
    issues.push('Missing featured image');
    score -= 5;
    suggestions.push('Add a featured image for better engagement');
  }
  
  return {
    id: article.id,
    title,
    slug: article.slug,
    category: article.category,
    published_at: article.published_at,
    issues,
    suggestions,
    score: Math.max(0, score),
  };
}

async function reviewRecentArticles() {
  console.log('🔍 Fetching recent articles...\n');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, content, excerpt, category, featured_image, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error('❌ Error fetching articles:', error);
    return;
  }
  
  if (!articles || articles.length === 0) {
    console.log('ℹ️  No articles found');
    return;
  }
  
  console.log(`📝 Reviewing ${articles.length} articles\n`);
  
  const reviews: ArticleReview[] = articles.map(reviewArticle);
  
  // Sort by score (lowest first - needs most work)
  reviews.sort((a, b) => a.score - b.score);
  
  // Print report
  console.log('📊 Article Review Report');
  console.log('='.repeat(60));
  
  reviews.forEach((review, index) => {
    const status = review.score >= 80 ? '✅' : review.score >= 60 ? '⚠️' : '❌';
    console.log(`\n${index + 1}. ${status} ${review.title}`);
    console.log(`   Score: ${review.score}/100`);
    console.log(`   Category: ${review.category || 'None'}`);
    console.log(`   Published: ${review.published_at ? new Date(review.published_at).toLocaleDateString('tr-TR') : 'N/A'}`);
    
    if (review.issues.length > 0) {
      console.log(`   Issues:`);
      review.issues.forEach(issue => console.log(`     - ${issue}`));
    }
    
    if (review.suggestions.length > 0) {
      console.log(`   Suggestions:`);
      review.suggestions.forEach(suggestion => console.log(`     💡 ${suggestion}`));
    }
  });
  
  // Summary
  const avgScore = reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length;
  const needsWork = reviews.filter(r => r.score < 70).length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📈 Summary:');
  console.log(`   Average Score: ${avgScore.toFixed(1)}/100`);
  console.log(`   Articles Needing Work: ${needsWork}`);
  console.log(`   Articles in Good Shape: ${reviews.length - needsWork}\n`);
}

// Run
reviewRecentArticles().catch(console.error);
