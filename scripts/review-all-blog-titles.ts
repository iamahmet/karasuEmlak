/**
 * Review all blog article titles and suggest improvements
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
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TitleReview {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  meta_description?: string;
  wordCount: number;
  issues: string[];
  suggestions: string[];
}

function analyzeTitle(title: string): { issues: string[]; suggestions: string[] } {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check length (optimal: 50-60 characters)
  if (title.length > 70) {
    issues.push('Başlık çok uzun (>70 karakter)');
    suggestions.push('Başlığı 50-60 karakter aralığına indirin');
  } else if (title.length < 30) {
    issues.push('Başlık çok kısa (<30 karakter)');
    suggestions.push('Başlığı daha açıklayıcı hale getirin');
  }
  
  // Check for AI-like phrases
  const aiPhrases = [
    'dikkat edilmesi gerekenler',
    'önemli bilgiler',
    'detaylı analiz',
    'kapsamlı rehber',
    'tam rehber',
  ];
  
  aiPhrases.forEach(phrase => {
    if (title.toLowerCase().includes(phrase)) {
      issues.push(`AI benzeri ifade: "${phrase}"`);
      suggestions.push('Daha doğal ve profesyonel bir ifade kullanın');
    }
  });
  
  // Check for generic words
  const genericWords = ['hakkında', 'ile ilgili', 'üzerine'];
  genericWords.forEach(word => {
    if (title.toLowerCase().includes(word)) {
      issues.push(`Genel ifade: "${word}"`);
      suggestions.push('Daha spesifik ve değer odaklı bir ifade kullanın');
    }
  });
  
  // Check for question format (good for engagement)
  const hasQuestion = title.includes('?') || title.includes('mi?') || title.includes('mı?');
  if (!hasQuestion && title.length > 40) {
    suggestions.push('Soru formatı kullanarak daha çekici hale getirebilirsiniz');
  }
  
  // Check for numbers (good for engagement)
  const hasNumber = /\d/.test(title);
  if (!hasNumber && title.toLowerCase().includes('ipucu') || title.toLowerCase().includes('rehber')) {
    suggestions.push('Sayı ekleyerek daha spesifik hale getirebilirsiniz (örn: "10 İpucu", "5 Adım")');
  }
  
  // Check for value proposition
  const valueWords = ['nasıl', 'neden', 'ne zaman', 'nerede', 'kim', 'hangi'];
  const hasValueProp = valueWords.some(word => title.toLowerCase().includes(word));
  if (!hasValueProp && title.length > 50) {
    suggestions.push('Değer önerisi ekleyerek daha çekici hale getirebilirsiniz');
  }
  
  return { issues, suggestions };
}

async function reviewAllTitles() {
  console.log('📋 Reviewing all blog article titles...\n');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, category, status, meta_description, content')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('❌ Error fetching articles:', error);
    return;
  }
  
  if (!articles || articles.length === 0) {
    console.log('⚠️  No published articles found');
    return;
  }
  
  console.log(`Found ${articles.length} published articles\n`);
  console.log('='.repeat(80));
  
  const reviews: TitleReview[] = [];
  
  for (const article of articles) {
    const wordCount = article.content ? article.content.split(/\s+/).length : 0;
    const analysis = analyzeTitle(article.title);
    
    reviews.push({
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category || 'N/A',
      status: article.status,
      meta_description: article.meta_description || undefined,
      wordCount,
      issues: analysis.issues,
      suggestions: analysis.suggestions,
    });
  }
  
  // Group by issues
  const withIssues = reviews.filter(r => r.issues.length > 0);
  const withoutIssues = reviews.filter(r => r.issues.length === 0);
  
  console.log('\n📊 SUMMARY\n');
  console.log(`Total Articles: ${reviews.length}`);
  console.log(`With Issues: ${withIssues.length}`);
  console.log(`Without Issues: ${withoutIssues.length}`);
  console.log(`\n${'='.repeat(80)}\n`);
  
  // Show articles with issues
  if (withIssues.length > 0) {
    console.log('⚠️  ARTICLES WITH ISSUES\n');
    withIssues.forEach((review, index) => {
      console.log(`${index + 1}. ${review.title}`);
      console.log(`   Category: ${review.category}`);
      console.log(`   Length: ${review.title.length} characters`);
      console.log(`   Word Count: ${review.wordCount}`);
      if (review.issues.length > 0) {
        console.log(`   Issues:`);
        review.issues.forEach(issue => console.log(`     - ${issue}`));
      }
      if (review.suggestions.length > 0) {
        console.log(`   Suggestions:`);
        review.suggestions.forEach(suggestion => console.log(`     - ${suggestion}`));
      }
      console.log(`   Slug: ${review.slug}`);
      console.log('');
    });
  }
  
  // Show all articles
  console.log('\n📝 ALL ARTICLES\n');
  reviews.forEach((review, index) => {
    const statusIcon = review.issues.length > 0 ? '⚠️' : '✅';
    console.log(`${statusIcon} ${index + 1}. ${review.title}`);
    console.log(`   Category: ${review.category} | Length: ${review.title.length} chars | Words: ${review.wordCount}`);
    if (review.meta_description) {
      console.log(`   Meta: ${review.meta_description.substring(0, 80)}...`);
    }
    console.log('');
  });
  
  // Statistics
  console.log('\n📈 STATISTICS\n');
  const avgLength = reviews.reduce((sum, r) => sum + r.title.length, 0) / reviews.length;
  const minLength = Math.min(...reviews.map(r => r.title.length));
  const maxLength = Math.max(...reviews.map(r => r.title.length));
  
  console.log(`Average Title Length: ${avgLength.toFixed(1)} characters`);
  console.log(`Min Length: ${minLength} characters`);
  console.log(`Max Length: ${maxLength} characters`);
  console.log(`Optimal Range: 50-60 characters`);
  
  const inOptimalRange = reviews.filter(r => r.title.length >= 50 && r.title.length <= 60).length;
  console.log(`In Optimal Range: ${inOptimalRange}/${reviews.length} (${((inOptimalRange / reviews.length) * 100).toFixed(1)}%)`);
}

reviewAllTitles().catch(console.error);
