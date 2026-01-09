#!/usr/bin/env tsx
/**
 * Content Quality Checker
 * 
 * Checks all pages for:
 * - H1 presence
 * - Intro section
 * - Content sections
 * - FAQs
 * - Internal links
 * - Schema markup
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface QualityCheck {
  page: string;
  hasH1: boolean;
  hasIntro: boolean;
  hasSections: boolean;
  hasFAQs: boolean;
  hasInternalLinks: boolean;
  hasSchema: boolean;
  issues: string[];
  score: number;
}

const pagesDir = join(process.cwd(), 'apps/web/app/[locale]');

function checkPageContent(filePath: string, relativePath: string): QualityCheck {
  const content = readFileSync(filePath, 'utf-8');
  const issues: string[] = [];
  let score = 100;

  // Check H1
  const hasH1 = /<h1[^>]*>|className.*h1|text-.*xl|text-.*2xl|text-.*3xl|text-.*4xl|text-.*5xl/.test(content);
  if (!hasH1) {
    issues.push('H1 başlığı eksik');
    score -= 20;
  }

  // Check intro section
  const hasIntro = /intro|giriş|description|açıklama|PageIntro|description.*text/i.test(content);
  if (!hasIntro) {
    issues.push('Intro/description bölümü eksik');
    score -= 15;
  }

  // Check sections (H2/H3)
  const h2Count = (content.match(/<h2[^>]*>|##|text-2xl|text-3xl/g) || []).length;
  const hasSections = h2Count >= 2;
  if (!hasSections) {
    issues.push(`Yeterli bölüm yok (H2: ${h2Count}, minimum 2)`);
    score -= 15;
  }

  // Check FAQs
  const hasFAQs = /FAQ|faq|Sık Sorulan|sık sorulan|generateFAQSchema|FAQBlock/i.test(content);
  if (!hasFAQs && !relativePath.includes('blog') && !relativePath.includes('haberler')) {
    issues.push('FAQ bölümü eksik');
    score -= 10;
  }

  // Check internal links
  const internalLinks = (content.match(/href=["'][^"']*\/[^"']*["']/g) || []).filter(
    link => !link.includes('http') && !link.includes('mailto:') && !link.includes('tel:')
  ).length;
  const hasInternalLinks = internalLinks >= 2;
  if (!hasInternalLinks) {
    issues.push(`Yeterli internal link yok (${internalLinks}, minimum 2)`);
    score -= 10;
  }

  // Check schema
  const hasSchema = /StructuredData|generate.*Schema|schema\.org|@type/i.test(content);
  if (!hasSchema) {
    issues.push('Schema markup eksik');
    score -= 15;
  }

  return {
    page: relativePath,
    hasH1,
    hasIntro,
    hasSections,
    hasFAQs,
    hasInternalLinks,
    hasSchema,
    issues,
    score: Math.max(0, score),
  };
}

function scanDirectory(dir: string, basePath: string = ''): QualityCheck[] {
  const results: QualityCheck[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = join(basePath, entry.name);

    if (entry.isDirectory()) {
      // Skip certain directories
      if (entry.name === 'api' || entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }
      results.push(...scanDirectory(fullPath, relativePath));
    } else if (entry.name.endsWith('page.tsx') && !entry.name.includes('not-found') && !entry.name.includes('error')) {
      try {
        const check = checkPageContent(fullPath, relativePath);
        results.push(check);
      } catch (error) {
        console.error(`Error checking ${fullPath}:`, error);
      }
    }
  }

  return results;
}

function main() {
  console.log('🔍 Content Quality Check Started...\n');

  const checks = scanDirectory(pagesDir);
  
  // Group by score
  const excellent = checks.filter(c => c.score >= 90);
  const good = checks.filter(c => c.score >= 70 && c.score < 90);
  const needsImprovement = checks.filter(c => c.score < 70);

  console.log(`📊 Results: ${checks.length} pages checked\n`);
  console.log(`✅ Excellent (90-100): ${excellent.length}`);
  console.log(`⚠️  Good (70-89): ${good.length}`);
  console.log(`❌ Needs Improvement (<70): ${needsImprovement.length}\n`);

  if (needsImprovement.length > 0) {
    console.log('❌ Pages Needing Improvement:\n');
    needsImprovement.forEach(check => {
      console.log(`  ${check.page}`);
      console.log(`    Score: ${check.score}/100`);
      console.log(`    Issues: ${check.issues.join(', ')}\n`);
    });
  }

  if (good.length > 0) {
    console.log('⚠️  Pages That Could Be Better:\n');
    good.slice(0, 5).forEach(check => {
      console.log(`  ${check.page} (${check.score}/100)`);
      if (check.issues.length > 0) {
        console.log(`    Issues: ${check.issues.join(', ')}\n`);
      }
    });
  }

  // Summary
  const avgScore = checks.reduce((sum, c) => sum + c.score, 0) / checks.length;
  console.log(`\n📈 Average Score: ${avgScore.toFixed(1)}/100`);

  const missingH1 = checks.filter(c => !c.hasH1).length;
  const missingFAQs = checks.filter(c => !c.hasFAQs && !c.page.includes('blog') && !c.page.includes('haberler')).length;
  const missingSchema = checks.filter(c => !c.hasSchema).length;

  console.log(`\n📋 Summary:`);
  console.log(`  Missing H1: ${missingH1}`);
  console.log(`  Missing FAQs: ${missingFAQs}`);
  console.log(`  Missing Schema: ${missingSchema}`);

  process.exit(needsImprovement.length > 0 ? 1 : 0);
}

main();
