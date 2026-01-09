#!/usr/bin/env tsx
/**
 * Content Quality Report Script
 * 
 * Generates weekly quality reports with low quality content lists
 * and improvement suggestions.
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { detectLowQualityContent } from '../../apps/web/lib/utils/content-quality-checker';
import { checkAllContentQuality, getQualityTrends } from '../../apps/web/lib/services/content-quality-monitor';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface QualityReport {
  date: string;
  totalArticles: number;
  averageScore: number;
  highQuality: number; // >= 70
  mediumQuality: number; // 50-69
  lowQuality: number; // < 50
  lowQualityItems: Array<{
    id: string;
    title: string;
    slug: string;
    type: 'article' | 'news';
    score: number;
    issues: number;
    suggestions: string[];
  }>;
  trends: Array<{
    date: string;
    averageScore: number;
    totalArticles: number;
  }>;
}

/**
 * Generate quality report
 */
async function generateQualityReport(): Promise<QualityReport> {
  console.log('📊 Generating content quality report...\n');

  // Get all published articles
  const { data: articles, error: articlesError } = await supabase
    .from('articles')
    .select('id, title, slug, content, quality_score, quality_issues')
    .eq('status', 'published');

  const { data: newsArticles, error: newsError } = await supabase
    .from('news_articles')
    .select('id, title, slug, original_summary, emlak_analysis, quality_score, quality_issues')
    .eq('status', 'published');

  if (articlesError || newsError) {
    console.error('Error fetching articles:', articlesError || newsError);
    process.exit(1);
  }

  const allItems = [
    ...(articles || []).map(a => ({ ...a, type: 'article' as const })),
    ...(newsArticles || []).map(a => ({ ...a, type: 'news' as const })),
  ];

  // Calculate stats
  const totalArticles = allItems.length;
  const scores = allItems
    .map(item => item.quality_score || 0)
    .filter(score => score > 0);
  
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const highQuality = allItems.filter(item => (item.quality_score || 0) >= 70).length;
  const mediumQuality = allItems.filter(item => {
    const score = item.quality_score || 0;
    return score >= 50 && score < 70;
  }).length;
  const lowQuality = allItems.filter(item => (item.quality_score || 0) < 50).length;

  // Get low quality items with suggestions
  const lowQualityItems = [];
  for (const item of allItems) {
    if ((item.quality_score || 0) < 50) {
      const content = item.type === 'article' 
        ? (item as any).content || ''
        : `${(item as any).original_summary || ''} ${(item as any).emlak_analysis || ''}`.trim();

      if (!content) continue;

      const qualityScore = detectLowQualityContent(content, item.title);

      lowQualityItems.push({
        id: item.id,
        title: item.title,
        slug: item.slug,
        type: item.type,
        score: qualityScore.overall,
        issues: qualityScore.issues.length,
        suggestions: qualityScore.suggestions.slice(0, 5), // Top 5 suggestions
      });
    }
  }

  // Sort by score (lowest first)
  lowQualityItems.sort((a, b) => a.score - b.score);

  // Get trends
  const trends = await getQualityTrends();

  return {
    date: new Date().toISOString().split('T')[0],
    totalArticles,
    averageScore,
    highQuality,
    mediumQuality,
    lowQuality,
    lowQualityItems: lowQualityItems.slice(0, 20), // Top 20 lowest
    trends: trends.slice(-7), // Last 7 days
  };
}

/**
 * Print report
 */
function printReport(report: QualityReport) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 İÇERİK KALİTE RAPORU');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`📅 Tarih: ${report.date}`);
  console.log(`📝 Toplam İçerik: ${report.totalArticles}`);
  console.log(`📊 Ortalama Skor: ${report.averageScore}/100\n`);

  console.log('📈 Kalite Dağılımı:');
  console.log(`   ✅ Yüksek Kalite (≥70): ${report.highQuality} (${Math.round((report.highQuality / report.totalArticles) * 100)}%)`);
  console.log(`   ⚠️  Orta Kalite (50-69): ${report.mediumQuality} (${Math.round((report.mediumQuality / report.totalArticles) * 100)}%)`);
  console.log(`   ❌ Düşük Kalite (<50): ${report.lowQuality} (${Math.round((report.lowQuality / report.totalArticles) * 100)}%)\n`);

  if (report.trends.length > 0) {
    console.log('📉 Son 7 Gün Trendi:');
    report.trends.forEach(trend => {
      console.log(`   ${trend.date}: ${trend.averageScore}/100 (${trend.totalArticles} içerik)`);
    });
    console.log('');
  }

  if (report.lowQualityItems.length > 0) {
    console.log('⚠️  Düşük Kaliteli İçerikler (Top 20):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    report.lowQualityItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Tip: ${item.type === 'article' ? 'Blog' : 'Haber'}`);
      console.log(`   Skor: ${item.score}/100`);
      console.log(`   Sorunlar: ${item.issues}`);
      if (item.suggestions.length > 0) {
        console.log(`   Öneriler:`);
        item.suggestions.forEach(suggestion => {
          console.log(`     - ${suggestion}`);
        });
      }
      console.log('');
    });
  } else {
    console.log('✅ Düşük kaliteli içerik bulunamadı!\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Rapor tamamlandı');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Main function
 */
async function main() {
  try {
    const report = await generateQualityReport();
    printReport(report);

    // Optionally save to file
    if (process.argv.includes('--save')) {
      const fs = require('fs');
      const path = require('path');
      const reportPath = path.join(process.cwd(), `content-quality-report-${report.date}.json`);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Rapor kaydedildi: ${reportPath}`);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

// Run
main().catch(console.error);
