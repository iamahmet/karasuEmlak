/**
 * Route Inventory Script
 * Scans all routes and identifies content sources and missing blocks
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface RouteInfo {
  path: string;
  type: 'static' | 'dynamic' | 'api';
  contentSource: 'supabase' | 'hardcoded' | 'hybrid' | 'none';
  missingBlocks: string[];
  hasIntro: boolean;
  hasSections: boolean;
  hasFAQ: boolean;
  hasSchema: boolean;
  hasImages: boolean;
  hasInternalLinks: boolean;
}

const routes: RouteInfo[] = [];

/**
 * Scan app directory for routes
 */
async function scanRoutes() {
  const appDir = path.join(process.cwd(), 'apps/web/app');
  
  // Find all page.tsx files
  const pageFiles = await glob('**/page.tsx', {
    cwd: appDir,
    absolute: true,
  });

  console.log(`📋 Found ${pageFiles.length} route files\n`);

  for (const filePath of pageFiles) {
    const relativePath = path.relative(appDir, filePath);
    const routePath = relativePath
      .replace(/\/page\.tsx$/, '')
      .replace(/\[locale\]/, '')
      .replace(/\[([^\]]+)\]/g, ':$1')
      .replace(/\/+/g, '/')
      .replace(/^\//, '') || '/';

    const content = fs.readFileSync(filePath, 'utf-8');
    
    const routeInfo: RouteInfo = {
      path: routePath,
      type: routePath.includes(':') ? 'dynamic' : 'static',
      contentSource: detectContentSource(content),
      missingBlocks: [],
      hasIntro: hasIntro(content),
      hasSections: hasSections(content),
      hasFAQ: hasFAQ(content),
      hasSchema: hasSchema(content),
      hasImages: hasImages(content),
      hasInternalLinks: hasInternalLinks(content),
    };

    // Identify missing blocks
    if (!routeInfo.hasIntro) routeInfo.missingBlocks.push('intro');
    if (!routeInfo.hasSections) routeInfo.missingBlocks.push('sections');
    if (!routeInfo.hasFAQ) routeInfo.missingBlocks.push('faq');
    if (!routeInfo.hasSchema) routeInfo.missingBlocks.push('schema');
    if (!routeInfo.hasImages) routeInfo.missingBlocks.push('images');
    if (!routeInfo.hasInternalLinks) routeInfo.missingBlocks.push('internal-links');

    routes.push(routeInfo);
  }

  return routes;
}

/**
 * Detect content source from file content
 */
function detectContentSource(content: string): 'supabase' | 'hardcoded' | 'hybrid' | 'none' {
  const hasSupabase = /from\(['"]|createServiceClient|createClient/.test(content);
  const hasHardcoded = /const.*=.*\[|const.*data.*=/.test(content);
  
  if (hasSupabase && hasHardcoded) return 'hybrid';
  if (hasSupabase) return 'supabase';
  if (hasHardcoded) return 'hardcoded';
  return 'none';
}

/**
 * Check if page has intro paragraph
 */
function hasIntro(content: string): boolean {
  return /<p[^>]*>|intro|description|açıklama|giriş/i.test(content);
}

/**
 * Check if page has sectioned content (H2/H3)
 */
function hasSections(content: string): boolean {
  return /<h2|<h3|Section|section|Bölüm/i.test(content);
}

/**
 * Check if page has FAQ
 */
function hasFAQ(content: string): boolean {
  return /FAQ|faq|Sıkça Sorulan|sorular|questions/i.test(content);
}

/**
 * Check if page has schema
 */
function hasSchema(content: string): boolean {
  return /StructuredData|generateSchema|schema|Schema/i.test(content);
}

/**
 * Check if page has images
 */
function hasImages(content: string): boolean {
  return /<img|Image|OptimizedImage|CardImage|getOptimizedCloudinaryUrl/i.test(content);
}

/**
 * Check if page has internal links
 */
function hasInternalLinks(content: string): boolean {
  return /<Link|href=|router\.push|navigate/i.test(content);
}

/**
 * Generate report
 */
function generateReport(routes: RouteInfo[]) {
  const report: string[] = [];
  
  report.push('# Content Coverage Report');
  report.push('');
  report.push(`**Generated:** ${new Date().toISOString()}`);
  report.push(`**Total Routes:** ${routes.length}`);
  report.push('');

  // Group by type
  const staticRoutes = routes.filter(r => r.type === 'static');
  const dynamicRoutes = routes.filter(r => r.type === 'dynamic');

  report.push('## Route Statistics');
  report.push('');
  report.push(`- Static routes: ${staticRoutes.length}`);
  report.push(`- Dynamic routes: ${dynamicRoutes.length}`);
  report.push('');

  // Content source breakdown
  const bySource = routes.reduce((acc, r) => {
    acc[r.contentSource] = (acc[r.contentSource] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  report.push('## Content Source Distribution');
  report.push('');
  Object.entries(bySource).forEach(([source, count]) => {
    report.push(`- ${source}: ${count}`);
  });
  report.push('');

  // Missing blocks analysis
  report.push('## Missing Blocks Analysis');
  report.push('');
  
  const missingCounts: Record<string, number> = {};
  routes.forEach(route => {
    route.missingBlocks.forEach(block => {
      missingCounts[block] = (missingCounts[block] || 0) + 1;
    });
  });

  Object.entries(missingCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([block, count]) => {
      report.push(`- Missing ${block}: ${count} pages`);
    });
  report.push('');

  // Routes needing attention
  report.push('## Routes Needing Content Completion');
  report.push('');
  
  const incompleteRoutes = routes
    .filter(r => r.missingBlocks.length >= 3)
    .sort((a, b) => b.missingBlocks.length - a.missingBlocks.length);

  incompleteRoutes.forEach(route => {
    report.push(`### ${route.path}`);
    report.push(`- Type: ${route.type}`);
    report.push(`- Content Source: ${route.contentSource}`);
    report.push(`- Missing: ${route.missingBlocks.join(', ')}`);
    report.push('');
  });

  // Page type categorization
  report.push('## Page Type Categorization');
  report.push('');
  
  const pageTypes: Record<string, RouteInfo[]> = {
    'home': routes.filter(r => r.path === '/' || r.path === ''),
    'listings': routes.filter(r => r.path.includes('satilik') || r.path.includes('kiralik') || r.path.includes('ilan')),
    'neighborhoods': routes.filter(r => r.path.includes('mahalle') || r.path.includes('karasu') || r.path.includes('kocaali')),
    'blog': routes.filter(r => r.path.includes('blog')),
    'news': routes.filter(r => r.path.includes('haberler') || r.path.includes('haber')),
    'utility': routes.filter(r => r.path.includes('iletisim') || r.path.includes('hakkimizda') || r.path.includes('gizlilik') || r.path.includes('kullanim')),
  };

  Object.entries(pageTypes).forEach(([type, typeRoutes]) => {
    if (typeRoutes.length > 0) {
      report.push(`### ${type.toUpperCase()} Pages (${typeRoutes.length})`);
      typeRoutes.forEach(route => {
        report.push(`- \`${route.path}\`: ${route.missingBlocks.length} missing blocks`);
      });
      report.push('');
    }
  });

  return report.join('\n');
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning routes for content coverage...\n');

  const routes = await scanRoutes();
  const report = generateReport(routes);

  const reportPath = path.join(process.cwd(), 'docs/CONTENT_COVERAGE_REPORT.md');
  fs.writeFileSync(reportPath, report);

  console.log('✅ Route inventory complete!');
  console.log(`📄 Report saved to: ${reportPath}\n`);

  // Print summary
  const incomplete = routes.filter(r => r.missingBlocks.length >= 3).length;
  console.log(`📊 Summary:`);
  console.log(`   Total routes: ${routes.length}`);
  console.log(`   Incomplete routes: ${incomplete}`);
  console.log(`   Routes needing attention: ${incomplete}`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { scanRoutes, generateReport };
