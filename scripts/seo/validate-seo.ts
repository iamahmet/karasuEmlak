/**
 * SEO Validation Script
 * Validates: schema, sitemap, canonical URLs, internal links
 */

import * as fs from 'fs';
import * as path from 'path';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '../../apps/web/i18n/routing';

interface ValidationResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string[];
}

const results: ValidationResult[] = [];

// Check 1: Sitemap structure
function checkSitemap() {
  const sitemapPath = path.join(process.cwd(), 'apps/web/app/sitemap.ts');
  const exists = fs.existsSync(sitemapPath);
  
  if (!exists) {
    results.push({
      name: 'Sitemap File',
      status: 'fail',
      message: 'sitemap.ts not found',
    });
    return;
  }
  
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const hasStaticRoutes = content.includes('staticRoutes');
  const hasDynamicListings = content.includes('listings');
  const hasLastModified = content.includes('lastModified');
  
  results.push({
    name: 'Sitemap Structure',
    status: 'pass',
    message: 'Sitemap file exists',
    details: [
      hasStaticRoutes ? 'Has static routes' : 'Missing static routes',
      hasDynamicListings ? 'Has dynamic listings' : 'Missing dynamic listings',
      hasLastModified ? 'Has lastModified' : 'Missing lastModified',
    ],
  });
}

// Check 2: Robots.txt
function checkRobots() {
  const robotsPath = path.join(process.cwd(), 'apps/web/app/robots.ts');
  const exists = fs.existsSync(robotsPath);
  
  if (exists) {
    const content = fs.readFileSync(robotsPath, 'utf-8');
    const hasSitemap = content.includes('sitemap');
    const hasDisallow = content.includes('disallow');
    
    results.push({
      name: 'Robots.txt',
      status: 'pass',
      message: 'Robots.txt exists',
      details: [
        hasSitemap ? 'Has sitemap reference' : 'Missing sitemap reference',
        hasDisallow ? 'Has disallow rules' : 'Missing disallow rules',
      ],
    });
  } else {
    results.push({
      name: 'Robots.txt',
      status: 'fail',
      message: 'robots.ts not found',
    });
  }
}

// Check 3: Canonical URLs pattern
function checkCanonicalPattern() {
  const pages = [
    'apps/web/app/[locale]/blog/[slug]/page.tsx',
    'apps/web/app/[locale]/ilan/[slug]/page.tsx',
    'apps/web/app/[locale]/haberler/[slug]/page.tsx',
  ];
  
  let allHaveCanonical = true;
  const details: string[] = [];
  
  for (const page of pages) {
    const pagePath = path.join(process.cwd(), page);
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf-8');
      const hasCanonical = content.includes('canonical') || content.includes('alternates');
      const hasLocaleHandling = content.includes('routing.defaultLocale');
      
      if (!hasCanonical) {
        allHaveCanonical = false;
        details.push(`${path.basename(page)}: Missing canonical`);
      } else if (!hasLocaleHandling) {
        details.push(`${path.basename(page)}: Missing locale handling`);
      } else {
        details.push(`${path.basename(page)}: OK`);
      }
    }
  }
  
  results.push({
    name: 'Canonical URLs',
    status: allHaveCanonical ? 'pass' : 'warn',
    message: allHaveCanonical ? 'All pages have canonical URLs' : 'Some pages missing canonical',
    details,
  });
}

// Check 4: Hreflang implementation
function checkHreflang() {
  const layoutPath = path.join(process.cwd(), 'apps/web/app/[locale]/layout.tsx');
  if (!fs.existsSync(layoutPath)) {
    results.push({
      name: 'Hreflang',
      status: 'fail',
      message: 'Layout file not found',
    });
    return;
  }
  
  const content = fs.readFileSync(layoutPath, 'utf-8');
  const hasHreflang = content.includes('languages') || content.includes('hreflang');
  const hasAllLocales = routing.locales.every(locale => 
    content.includes(`'${locale}'`) || content.includes(`"${locale}"`)
  );
  
  results.push({
    name: 'Hreflang Tags',
    status: hasHreflang && hasAllLocales ? 'pass' : 'warn',
    message: hasHreflang && hasAllLocales 
      ? 'Hreflang implemented for all locales'
      : 'Hreflang incomplete',
    details: [
      hasHreflang ? 'Has hreflang structure' : 'Missing hreflang',
      hasAllLocales ? 'All locales included' : 'Some locales missing',
    ],
  });
}

// Check 5: Schema implementation
function checkSchema() {
  const schemaPath = path.join(process.cwd(), 'apps/web/lib/seo/structured-data.ts');
  if (!fs.existsSync(schemaPath)) {
    results.push({
      name: 'Schema Implementation',
      status: 'fail',
      message: 'Schema file not found',
    });
    return;
  }
  
  const content = fs.readFileSync(schemaPath, 'utf-8');
  const hasArticle = content.includes('Article') || content.includes('generateArticleSchema');
  const hasNewsArticle = content.includes('NewsArticle') || content.includes('generateNewsArticleSchema');
  const hasRealEstate = content.includes('RealEstate') || content.includes('RealEstateListing');
  const hasOrganization = content.includes('Organization');
  const hasBreadcrumb = content.includes('Breadcrumb');
  const hasFAQ = content.includes('FAQ');
  
  const schemas = [
    { name: 'Article', found: hasArticle },
    { name: 'NewsArticle', found: hasNewsArticle },
    { name: 'RealEstateListing', found: hasRealEstate },
    { name: 'Organization', found: hasOrganization },
    { name: 'BreadcrumbList', found: hasBreadcrumb },
    { name: 'FAQPage', found: hasFAQ },
  ];
  
  const allFound = schemas.every(s => s.found);
  
  results.push({
    name: 'Schema Types',
    status: allFound ? 'pass' : 'warn',
    message: allFound ? 'All required schema types found' : 'Some schema types missing',
    details: schemas.map(s => `${s.name}: ${s.found ? 'OK' : 'Missing'}`),
  });
}

// Check 6: Internal linking (basic check)
function checkInternalLinking() {
  const internalLinkScript = path.join(process.cwd(), 'scripts/seo-internal-linking-system.ts');
  const internalLinkDoc = path.join(process.cwd(), 'INTERNAL_LINKING_V6.md');
  
  const hasScript = fs.existsSync(internalLinkScript);
  const hasDoc = fs.existsSync(internalLinkDoc);
  
  results.push({
    name: 'Internal Linking System',
    status: hasScript && hasDoc ? 'pass' : 'warn',
    message: hasScript && hasDoc ? 'Internal linking system exists' : 'Internal linking incomplete',
    details: [
      hasScript ? 'Script exists' : 'Script missing',
      hasDoc ? 'Documentation exists' : 'Documentation missing',
    ],
  });
}

// Check 7: AI Q&A blocks
function checkAIQA() {
  const qaQueryPath = path.join(process.cwd(), 'apps/web/lib/supabase/queries/ai-questions.ts');
  const hasQAQuery = fs.existsSync(qaQueryPath);
  
  // Check if Q&A blocks are used in pages
  const hubPages = [
    'apps/web/app/[locale]/karasu-satilik-ev/page.tsx',
    'apps/web/app/[locale]/kocaali-satilik-ev/page.tsx',
  ];
  
  let hasQABlocks = false;
  const details: string[] = [];
  
  for (const page of hubPages) {
    const pagePath = path.join(process.cwd(), page);
    if (fs.existsSync(pagePath)) {
      const content = fs.readFileSync(pagePath, 'utf-8');
      const hasQA = content.includes('Kısa Cevap') || content.includes('ai-questions') || content.includes('getAIQuestions');
      if (hasQA) {
        hasQABlocks = true;
        details.push(`${path.basename(page)}: Has Q&A blocks`);
      } else {
        details.push(`${path.basename(page)}: Missing Q&A blocks`);
      }
    }
  }
  
  results.push({
    name: 'AI Q&A Blocks',
    status: hasQAQuery && hasQABlocks ? 'pass' : 'warn',
    message: hasQAQuery && hasQABlocks ? 'AI Q&A system implemented' : 'AI Q&A incomplete',
    details: [
      hasQAQuery ? 'Query function exists' : 'Query function missing',
      ...details,
    ],
  });
}

// Main function
async function runValidation() {
  console.log('🔍 Running SEO Validation...\n');

  checkSitemap();
  checkRobots();
  checkCanonicalPattern();
  checkHreflang();
  checkSchema();
  checkInternalLinking();
  checkAIQA();

  // Print results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SEO VALIDATION RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warned = results.filter(r => r.status === 'warn').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.details && result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`   ${detail}`);
      });
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${passed} passed, ${warned} warnings, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runValidation().catch(console.error);
}

export { runValidation };
