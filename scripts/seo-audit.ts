/**
 * SEO Audit Script
 * 
 * Audits pages for:
 * - H1 presence and quality
 * - Meta description quality
 * - Internal linking
 * - FAQ presence
 * - Schema markup
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
dotenv.config();

interface SEOAuditResult {
  path: string;
  hasH1: boolean;
  h1Text?: string;
  hasMetaDescription: boolean;
  metaDescription?: string;
  metaDescriptionLength?: number;
  hasFAQ: boolean;
  hasSchema: boolean;
  hasInternalLinks: boolean;
  issues: string[];
}

function extractH1(content: string): { found: boolean; text?: string } {
  const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/s);
  if (h1Match) {
    const text = h1Match[1].replace(/<[^>]+>/g, '').trim();
    return { found: true, text };
  }
  return { found: false };
}

function extractMetaDescription(content: string): { found: boolean; text?: string; length?: number } {
  // Check for generateMetadata function
  const metadataMatch = content.match(/description:\s*['"](.*?)['"]/s);
  if (metadataMatch) {
    const text = metadataMatch[1].trim();
    return { found: true, text, length: text.length };
  }
  return { found: false };
}

function checkForFAQ(content: string): boolean {
  return (
    content.includes('generateFAQSchema') ||
    content.includes('FAQPage') ||
    content.includes('faqSchema') ||
    content.includes('faqs') ||
    content.includes('Sık Sorulan Sorular')
  );
}

function checkForSchema(content: string): boolean {
  return (
    content.includes('StructuredData') ||
    content.includes('generateArticleSchema') ||
    content.includes('generateBreadcrumbSchema') ||
    content.includes('generateFAQSchema') ||
    content.includes('@type')
  );
}

function checkForInternalLinks(content: string): boolean {
  return (
    content.includes('generateContextualLinks') ||
    content.includes('InternalLinks') ||
    content.includes('RelatedContent') ||
    content.includes('contextualLinks')
  );
}

function auditPage(filePath: string): SEOAuditResult | null {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Skip if it's a layout or not a page
    if (filePath.includes('layout.tsx') || filePath.includes('loading.tsx') || filePath.includes('error.tsx')) {
      return null;
    }
    
    const h1 = extractH1(content);
    const meta = extractMetaDescription(content);
    const hasFAQ = checkForFAQ(content);
    const hasSchema = checkForSchema(content);
    const hasInternalLinks = checkForInternalLinks(content);
    
    const issues: string[] = [];
    
    if (!h1.found) {
      issues.push('Missing H1 heading');
    } else if (h1.text && h1.text.length > 100) {
      issues.push(`H1 too long (${h1.text.length} chars, should be < 100)`);
    }
    
    if (!meta.found) {
      issues.push('Missing meta description');
    } else if (meta.length && meta.length < 120) {
      issues.push(`Meta description too short (${meta.length} chars, should be 120-160)`);
    } else if (meta.length && meta.length > 160) {
      issues.push(`Meta description too long (${meta.length} chars, should be 120-160)`);
    }
    
    if (!hasFAQ) {
      issues.push('No FAQ section detected');
    }
    
    if (!hasSchema) {
      issues.push('No structured data (schema) detected');
    }
    
    if (!hasInternalLinks) {
      issues.push('No internal linking detected');
    }
    
    return {
      path: filePath.replace(process.cwd(), ''),
      hasH1: h1.found,
      h1Text: h1.text,
      hasMetaDescription: meta.found,
      metaDescription: meta.text,
      metaDescriptionLength: meta.length,
      hasFAQ,
      hasSchema,
      hasInternalLinks,
      issues,
    };
  } catch (error) {
    console.error(`Error auditing ${filePath}:`, error);
    return null;
  }
}

function findPageFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc.
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        findPageFiles(filePath, fileList);
      }
    } else if (file === 'page.tsx' || file === 'page.ts') {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function main() {
  console.log('🔍 Starting SEO Audit...\n');
  
  const pagesDir = join(process.cwd(), 'apps/web/app');
  const pageFiles = findPageFiles(pagesDir);
  
  console.log(`Found ${pageFiles.length} page files\n`);
  
  const results: SEOAuditResult[] = [];
  
  for (const file of pageFiles) {
    const result = auditPage(file);
    if (result) {
      results.push(result);
    }
  }
  
  // Group by issues
  const pagesWithIssues = results.filter(r => r.issues.length > 0);
  const pagesWithoutIssues = results.filter(r => r.issues.length === 0);
  
  console.log('📊 SEO Audit Results:\n');
  console.log(`✅ Pages with no issues: ${pagesWithoutIssues.length}`);
  console.log(`⚠️  Pages with issues: ${pagesWithIssues.length}\n`);
  
  if (pagesWithIssues.length > 0) {
    console.log('⚠️  Pages Needing Attention:\n');
    
    // Group by issue type
    const issueCounts: Record<string, number> = {};
    pagesWithIssues.forEach(page => {
      page.issues.forEach(issue => {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      });
    });
    
    console.log('Issue Summary:');
    Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([issue, count]) => {
        console.log(`  - ${issue}: ${count} pages`);
      });
    
    console.log('\n📄 Detailed Results:\n');
    pagesWithIssues.slice(0, 20).forEach(page => {
      console.log(`\n${page.path}`);
      console.log(`  Issues: ${page.issues.join(', ')}`);
      if (page.h1Text) {
        console.log(`  H1: ${page.h1Text.substring(0, 60)}${page.h1Text.length > 60 ? '...' : ''}`);
      }
      if (page.metaDescription) {
        console.log(`  Meta: ${page.metaDescription.substring(0, 60)}${page.metaDescription.length > 60 ? '...' : ''} (${page.metaDescriptionLength} chars)`);
      }
    });
    
    if (pagesWithIssues.length > 20) {
      console.log(`\n... and ${pagesWithIssues.length - 20} more pages with issues`);
    }
  }
  
  // Summary stats
  console.log('\n📈 Overall Statistics:\n');
  console.log(`H1 Coverage: ${results.filter(r => r.hasH1).length}/${results.length} (${Math.round((results.filter(r => r.hasH1).length / results.length) * 100)}%)`);
  console.log(`Meta Description Coverage: ${results.filter(r => r.hasMetaDescription).length}/${results.length} (${Math.round((results.filter(r => r.hasMetaDescription).length / results.length) * 100)}%)`);
  console.log(`FAQ Coverage: ${results.filter(r => r.hasFAQ).length}/${results.length} (${Math.round((results.filter(r => r.hasFAQ).length / results.length) * 100)}%)`);
  console.log(`Schema Coverage: ${results.filter(r => r.hasSchema).length}/${results.length} (${Math.round((results.filter(r => r.hasSchema).length / results.length) * 100)}%)`);
  console.log(`Internal Links Coverage: ${results.filter(r => r.hasInternalLinks).length}/${results.length} (${Math.round((results.filter(r => r.hasInternalLinks).length / results.length) * 100)}%)`);
  
  console.log('\n✅ SEO Audit Complete!');
}

main();
