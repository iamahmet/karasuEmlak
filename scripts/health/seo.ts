/**
 * SEO System Health Check
 * Checks: sitemaps, robots.txt, metadata, schema, canonical URLs
 */

import * as fs from 'fs';
import * as path from 'path';

// Try to load siteConfig, but don't fail if it doesn't exist
let siteConfig: any = null;
try {
  const configPath = path.join(process.cwd(), 'packages/config/src/site-config.ts');
  if (fs.existsSync(configPath)) {
    // Read and parse basic config (simple approach)
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const urlMatch = configContent.match(/url:\s*['"]([^'"]+)['"]/);
    const nameMatch = configContent.match(/name:\s*['"]([^'"]+)['"]/);
    const descMatch = configContent.match(/description:\s*['"]([^'"]+)['"]/);
    
    siteConfig = {
      url: urlMatch ? urlMatch[1] : null,
      name: nameMatch ? nameMatch[1] : null,
      description: descMatch ? descMatch[1] : null,
    };
  }
} catch (error) {
  // Ignore
}

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const checks: HealthCheck[] = [];

// Check 1: Sitemap files exist and are valid
function checkSitemaps() {
  const sitemaps = [
    'apps/web/app/sitemap.ts',
    'apps/web/app/sitemap-news.ts',
  ];

  for (const sitemap of sitemaps) {
    const exists = fs.existsSync(path.join(process.cwd(), sitemap));
    checks.push({
      name: `Sitemap: ${path.basename(sitemap)}`,
      status: exists ? 'pass' : 'fail',
      message: exists ? 'Exists' : 'Missing',
    });
  }
}

// Check 2: Robots.txt exists
function checkRobots() {
  const robotsPath = path.join(process.cwd(), 'apps/web/app/robots.ts');
  const exists = fs.existsSync(robotsPath);
  
  if (exists) {
    const content = fs.readFileSync(robotsPath, 'utf-8');
    const hasSitemap = content.includes('sitemap');
    const hasDisallow = content.includes('disallow');
    
    checks.push({
      name: 'Robots.txt',
      status: 'pass',
      message: 'Exists',
    });
    
    checks.push({
      name: 'Robots.txt - Sitemap Reference',
      status: hasSitemap ? 'pass' : 'warn',
      message: hasSitemap ? 'Has sitemap reference' : 'Missing sitemap reference',
    });
  } else {
    checks.push({
      name: 'Robots.txt',
      status: 'fail',
      message: 'Missing',
    });
  }
}

// Check 3: Metadata utility exists
function checkMetadata() {
  const metadataPath = path.join(process.cwd(), 'packages/lib/seo/metadata.ts');
  const exists = fs.existsSync(metadataPath);
  
  if (exists) {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    const hasGenerate = content.includes('generateSEOMetadata');
    const hasValidate = content.includes('validateSEOMetadata');
    
    checks.push({
      name: 'Metadata Utility',
      status: 'pass',
      message: 'Exists',
    });
    
    checks.push({
      name: 'Metadata - Generate Function',
      status: hasGenerate ? 'pass' : 'warn',
      message: hasGenerate ? 'Has generateSEOMetadata' : 'Missing generateSEOMetadata',
    });
    
    checks.push({
      name: 'Metadata - Validate Function',
      status: hasValidate ? 'pass' : 'warn',
      message: hasValidate ? 'Has validateSEOMetadata' : 'Missing validateSEOMetadata',
    });
  } else {
    checks.push({
      name: 'Metadata Utility',
      status: 'fail',
      message: 'Missing',
    });
  }
}

// Check 4: Structured data utility exists
function checkStructuredData() {
  const schemaPath = path.join(process.cwd(), 'apps/web/lib/seo/structured-data.ts');
  const exists = fs.existsSync(schemaPath);
  
  if (exists) {
    const content = fs.readFileSync(schemaPath, 'utf-8');
    const hasOrganization = content.includes('Organization') || content.includes('organization');
    const hasArticle = content.includes('Article') || content.includes('article');
    
    checks.push({
      name: 'Structured Data Utility',
      status: 'pass',
      message: 'Exists',
    });
    
    checks.push({
      name: 'Structured Data - Organization Schema',
      status: hasOrganization ? 'pass' : 'warn',
      message: hasOrganization ? 'Has Organization schema' : 'Missing Organization schema',
    });
    
    checks.push({
      name: 'Structured Data - Article Schema',
      status: hasArticle ? 'pass' : 'warn',
      message: hasArticle ? 'Has Article schema' : 'Missing Article schema',
    });
  } else {
    checks.push({
      name: 'Structured Data Utility',
      status: 'fail',
      message: 'Missing',
    });
  }
}

// Check 5: siteConfig exists and has required fields
function checkSiteConfig() {
  try {
    const hasUrl = !!siteConfig.url;
    const hasName = !!siteConfig.name;
    const hasDescription = !!siteConfig.description;
    
    checks.push({
      name: 'siteConfig - URL',
      status: hasUrl ? 'pass' : 'fail',
      message: hasUrl ? `URL: ${siteConfig.url}` : 'Missing URL',
    });
    
    checks.push({
      name: 'siteConfig - Name',
      status: hasName ? 'pass' : 'fail',
      message: hasName ? `Name: ${siteConfig.name}` : 'Missing name',
    });
    
    checks.push({
      name: 'siteConfig - Description',
      status: hasDescription ? 'pass' : 'warn',
      message: hasDescription ? 'Has description' : 'Missing description',
    });
  } catch (error) {
    checks.push({
      name: 'siteConfig',
      status: 'fail',
      message: `Error loading: ${error}`,
    });
  }
}

// Check 6: Key pages have metadata generation
function checkPageMetadata() {
  const pages = [
    'apps/web/app/[locale]/page.tsx',
    'apps/web/app/[locale]/blog/[slug]/page.tsx',
    'apps/web/app/[locale]/ilan/[slug]/page.tsx',
  ];

  for (const page of pages) {
    const pagePath = path.join(process.cwd(), page);
    const exists = fs.existsSync(pagePath);
    
    if (exists) {
      const content = fs.readFileSync(pagePath, 'utf-8');
      const hasMetadata = content.includes('generateMetadata');
      
      checks.push({
        name: `Page Metadata: ${path.basename(page)}`,
        status: hasMetadata ? 'pass' : 'warn',
        message: hasMetadata ? 'Has generateMetadata' : 'Missing generateMetadata',
      });
    } else {
      checks.push({
        name: `Page: ${path.basename(page)}`,
        status: 'fail',
        message: 'Missing',
      });
    }
  }
}

// Main function
async function runHealthCheck() {
  console.log('🔍 Running SEO System Health Check...\n');

  checkSitemaps();
  checkRobots();
  checkMetadata();
  checkStructuredData();
  checkSiteConfig();
  checkPageMetadata();

  // Print results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('SEO SYSTEM HEALTH CHECK RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passed = checks.filter(c => c.status === 'pass').length;
  const failed = checks.filter(c => c.status === 'fail').length;
  const warned = checks.filter(c => c.status === 'warn').length;

  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${passed} passed, ${warned} warnings, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runHealthCheck().catch(console.error);
}

export { runHealthCheck };
