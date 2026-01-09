#!/usr/bin/env tsx

/**
 * Clean Article Conclusions Script
 * Removes AI-generated conclusion sections from blog articles
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

// Patterns that indicate AI-generated conclusions
const conclusionPatterns = [
  /<h2[^>]*>.*?[Ss]onu[çc][^<]*<\/h2>/i,
  /<h3[^>]*>.*?[Ss]onu[çc][^<]*<\/h3>/i,
  /<h2[^>]*>.*?[Cc]onclusion[^<]*<\/h2>/i,
  /<h3[^>]*>.*?[Cc]onclusion[^<]*<\/h3>/i,
  /<h2[^>]*>.*?[Öö]zet[^<]*<\/h2>/i,
  /<h2[^>]*>.*?[Dd]eğerlendirme[^<]*<\/h2>/i,
  /<p[^>]*>.*?[Ss]onu[çc] olarak[^<]*<\/p>/i,
  /<p[^>]*>.*?[Öö]zetlemek gerekirse[^<]*<\/p>/i,
  /<p[^>]*>.*?[Kk]ısaca[^<]*<\/p>/i,
  /<p[^>]*>.*?[Ss]onu[çc]ta[^<]*<\/p>/i,
];

// Phrases that indicate AI-generated content
const aiPhrases = [
  'sonuç olarak',
  'özetlemek gerekirse',
  'kısaca',
  'sonuçta',
  'bu nedenle',
  'bu bağlamda',
  'sonuç kısmında',
  'değerlendirme yapıldığında',
  'genel olarak',
];

function hasConclusionSection(content: string): boolean {
  // Check for conclusion headings
  for (const pattern of conclusionPatterns) {
    if (pattern.test(content)) {
      return true;
    }
  }
  return false;
}

function removeConclusionSection(content: string): string {
  let cleaned = content;
  
  // Remove conclusion sections
  for (const pattern of conclusionPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Remove paragraphs that start with AI phrases (last 2-3 paragraphs)
  const paragraphs = cleaned.split('</p>');
  if (paragraphs.length > 3) {
    const lastParagraphs = paragraphs.slice(-3);
    const remainingParagraphs = paragraphs.slice(0, -3);
    
    const filteredLast = lastParagraphs.filter(p => {
      const lowerP = p.toLowerCase();
      return !aiPhrases.some(phrase => lowerP.includes(phrase));
    });
    
    cleaned = [...remainingParagraphs, ...filteredLast].join('</p>');
  }
  
  // Clean up multiple empty lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

async function cleanArticles() {
  console.log('🔍 Fetching published articles...\n');
  
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, slug, content')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('❌ Error fetching articles:', error);
    return;
  }
  
  if (!articles || articles.length === 0) {
    console.log('ℹ️  No articles found');
    return;
  }
  
  console.log(`📝 Found ${articles.length} articles\n`);
  
  let cleanedCount = 0;
  let skippedCount = 0;
  
  for (const article of articles) {
    if (!article.content) {
      skippedCount++;
      continue;
    }
    
    if (hasConclusionSection(article.content)) {
      console.log(`🧹 Cleaning: ${article.title}`);
      
      const cleanedContent = removeConclusionSection(article.content);
      
      if (cleanedContent !== article.content) {
        const { error: updateError } = await supabase
          .from('articles')
          .update({ content: cleanedContent })
          .eq('id', article.id);
        
        if (updateError) {
          console.error(`   ❌ Error updating: ${updateError.message}`);
        } else {
          console.log(`   ✅ Cleaned successfully`);
          cleanedCount++;
        }
      } else {
        console.log(`   ⏭️  No changes needed`);
        skippedCount++;
      }
    } else {
      skippedCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   Cleaned: ${cleanedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total: ${articles.length}\n`);
}

// Run
cleanArticles().catch(console.error);
