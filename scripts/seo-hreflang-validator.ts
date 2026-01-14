/**
 * Hreflang Tags Validator
 * 
 * Validates hreflang implementation across all pages:
 * - Ensures all locales are present
 * - Validates canonical URLs
 * - Checks for missing hreflang tags
 * - Verifies URL structure consistency
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { siteConfig } from '@karasu-emlak/config';

interface HreflangIssue {
  file: string;
  pagePath: string;
  issue: string;
  missingLocales?: string[];
  canonicalIssue?: string;
}

const issues: HreflangIssue[] = [];
const expectedLocales = ['tr', 'en', 'et', 'ru', 'ar'];

async function validateHreflang() {
  const pageFiles = await glob('apps/web/app/[locale]/**/page.tsx', {
    ignore: ['**/node_modules/**', '**/.next/**', '**/admin/**'],
  });

  for (const file of pageFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Extract page path
    const pathMatch = file.match(/app\/\[locale\]\/(.+)\/page\.tsx/);
    const pagePath = pathMatch ? pathMatch[1] : '';
    
    // Check for generateMetadata function
    if (!content.includes('generateMetadata')) {
      continue; // Skip pages without metadata
    }
    
    // Check for alternates.languages
    const hasLanguages = content.includes('languages:');
    const hasCanonical = content.includes('canonical:');
    
    if (!hasLanguages) {
      issues.push({
        file,
        pagePath,
        issue: 'Missing hreflang languages',
        missingLocales: expectedLocales,
      });
      continue;
    }
    
    // Check for all expected locales
    const missingLocales: string[] = [];
    for (const locale of expectedLocales) {
      if (!content.includes(`'${locale}':`)) {
        missingLocales.push(locale);
      }
    }
    
    if (missingLocales.length > 0) {
      issues.push({
        file,
        pagePath,
        issue: 'Missing locales in hreflang',
        missingLocales,
      });
    }
    
    // Check canonical URL structure
    if (hasCanonical) {
      const canonicalMatch = content.match(/canonical:\s*[`'"]([^`'"]+)[`'"]/);
      if (canonicalMatch) {
        const canonical = canonicalMatch[1];
        if (!canonical.includes(siteConfig.url) && !canonical.startsWith('/')) {
          issues.push({
            file,
            pagePath,
            issue: 'Invalid canonical URL format',
            canonicalIssue: canonical,
          });
        }
      }
    }
  }
  
  return issues;
}

async function main() {
  console.log('🔍 Validating hreflang tags...\n');
  
  const issues = await validateHreflang();
  
  if (issues.length === 0) {
    console.log('✅ All hreflang tags are correctly implemented!');
    return;
  }
  
  console.log(`⚠️  Found ${issues.length} issues:\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${path.basename(issue.file)}`);
    console.log(`   Path: /${issue.pagePath}`);
    console.log(`   Issue: ${issue.issue}`);
    if (issue.missingLocales) {
      console.log(`   Missing locales: ${issue.missingLocales.join(', ')}`);
    }
    if (issue.canonicalIssue) {
      console.log(`   Canonical: ${issue.canonicalIssue}`);
    }
    console.log('');
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total issues: ${issues.length}`);
  console.log(`   Missing hreflang: ${issues.filter(i => i.issue.includes('hreflang')).length}`);
  console.log(`   Missing locales: ${issues.filter(i => i.missingLocales).length}`);
  console.log(`   Canonical issues: ${issues.filter(i => i.canonicalIssue).length}`);
}

main().catch(console.error);
