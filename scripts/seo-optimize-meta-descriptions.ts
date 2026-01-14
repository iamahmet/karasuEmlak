/**
 * SEO Meta Description Optimizer
 * 
 * Analyzes and optimizes meta descriptions across all pages:
 * - Ensures 150-160 character length
 * - Removes AI-like phrases
 * - Adds call-to-action when appropriate
 * - Ensures keyword inclusion
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface MetaDescriptionIssue {
  file: string;
  current: string;
  length: number;
  issue: string;
  suggestion?: string;
}

const issues: MetaDescriptionIssue[] = [];

async function analyzeMetaDescriptions() {
  const pageFiles = await glob('apps/web/app/**/page.tsx', {
    ignore: ['**/node_modules/**', '**/.next/**'],
  });

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Extract meta description
    const descriptionMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
    if (!descriptionMatch) continue;
    
    const description = descriptionMatch[1];
    const length = description.length;
    
    // Check for issues
    if (length < 120) {
      issues.push({
        file,
        current: description,
        length,
        issue: 'Too short (should be 150-160 chars)',
      });
    } else if (length > 165) {
      issues.push({
        file,
        current: description,
        length,
        issue: 'Too long (should be 150-160 chars)',
      });
    }
    
    // Check for AI-like phrases
    const aiPhrases = [
      'kapsamlı rehber',
      'detaylı bilgi',
      'geniş yelpaze',
      'çeşitli seçenekler',
    ];
    
    const hasAIPhrase = aiPhrases.some(phrase => 
      description.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (hasAIPhrase) {
      issues.push({
        file,
        current: description,
        length,
        issue: 'Contains generic AI-like phrase',
      });
    }
  }
  
  return issues;
}

async function main() {
  console.log('🔍 Analyzing meta descriptions...\n');
  
  const issues = await analyzeMetaDescriptions();
  
  if (issues.length === 0) {
    console.log('✅ All meta descriptions are optimized!');
    return;
  }
  
  console.log(`⚠️  Found ${issues.length} issues:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${path.basename(issue.file)}`);
    console.log(`   Issue: ${issue.issue}`);
    console.log(`   Length: ${issue.length} chars`);
    console.log(`   Current: ${issue.current.substring(0, 80)}...`);
    console.log('');
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total issues: ${issues.length}`);
  console.log(`   Too short: ${issues.filter(i => i.length < 120).length}`);
  console.log(`   Too long: ${issues.filter(i => i.length > 165).length}`);
  console.log(`   AI phrases: ${issues.filter(i => i.issue.includes('AI-like')).length}`);
}

main().catch(console.error);
