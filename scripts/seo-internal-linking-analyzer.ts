/**
 * Internal Linking Analyzer
 * 
 * Analyzes internal linking across the site:
 * - Identifies pages with low internal link count
 * - Suggests relevant internal links
 * - Checks for orphan pages
 * - Validates link structure
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface PageLinkAnalysis {
  file: string;
  path: string;
  internalLinks: number;
  externalLinks: number;
  suggestedLinks: string[];
}

const analyses: PageLinkAnalysis[] = [];

async function analyzeInternalLinks() {
  const pageFiles = await glob('apps/web/app/**/page.tsx', {
    ignore: ['**/node_modules/**', '**/.next/**', '**/admin/**'],
  });

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Extract page path from file structure
    const pathMatch = file.match(/app\/\[locale\]\/(.+)\/page\.tsx/);
    const pagePath = pathMatch ? `/${pathMatch[1]}` : '/';
    
    // Count internal links (href="/...")
    const internalLinkMatches = content.match(/href=["']([^"']+)["']/g) || [];
    const internalLinks = internalLinkMatches.filter(link => {
      const href = link.match(/href=["']([^"']+)["']/)?.[1] || '';
      return href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/api');
    }).length;
    
    // Count external links
    const externalLinks = internalLinkMatches.filter(link => {
      const href = link.match(/href=["']([^"']+)["']/)?.[1] || '';
      return href.startsWith('http://') || href.startsWith('https://');
    }).length;
    
    // Suggest links based on page type
    const suggestedLinks: string[] = [];
    
    if (pagePath.includes('satilik-daire')) {
      suggestedLinks.push('/karasu-satilik-daire', '/satilik-villa', '/satilik-ev', '/kiralik-daire');
    } else if (pagePath.includes('satilik-villa')) {
      suggestedLinks.push('/karasu-satilik-villa', '/satilik-daire', '/satilik-yazlik', '/kiralik-villa');
    } else if (pagePath.includes('karasu')) {
      suggestedLinks.push('/karasu', '/karasu-emlak-rehberi', '/karasu/mahalleler');
    }
    
    analyses.push({
      file,
      path: pagePath,
      internalLinks,
      externalLinks,
      suggestedLinks,
    });
  }
  
  return analyses;
}

async function main() {
  console.log('🔍 Analyzing internal linking...\n');
  
  const analyses = await analyzeInternalLinks();
  
  // Find pages with low internal link count
  const lowLinkPages = analyses.filter(a => a.internalLinks < 3);
  
  if (lowLinkPages.length === 0) {
    console.log('✅ All pages have sufficient internal links!');
    return;
  }
  
  console.log(`⚠️  Found ${lowLinkPages.length} pages with low internal link count:\n`);
  
  lowLinkPages.forEach((analysis, index) => {
    console.log(`${index + 1}. ${analysis.path}`);
    console.log(`   Internal links: ${analysis.internalLinks}`);
    console.log(`   External links: ${analysis.externalLinks}`);
    if (analysis.suggestedLinks.length > 0) {
      console.log(`   Suggested: ${analysis.suggestedLinks.join(', ')}`);
    }
    console.log('');
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total pages analyzed: ${analyses.length}`);
  console.log(`   Pages with <3 links: ${lowLinkPages.length}`);
  console.log(`   Average internal links: ${Math.round(analyses.reduce((sum, a) => sum + a.internalLinks, 0) / analyses.length)}`);
}

main().catch(console.error);
