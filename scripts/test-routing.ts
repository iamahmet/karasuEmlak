#!/usr/bin/env tsx
/**
 * Routing Test - Verify all routes work correctly
 * 
 * Tests locale routing, rewrites, and 404 handling
 * 
 * Usage:
 *   BASE_URL=http://localhost:3000 pnpm tsx scripts/test-routing.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

interface RouteTest {
  name: string;
  url: string;
  expectedStatus: number;
  expectedRedirect?: string;
  actualStatus: number;
  actualRedirect?: string;
  passed: boolean;
  error?: string;
}

const routes: Array<{
  name: string;
  path: string;
  expectedStatus: number;
  expectedRedirect?: string;
}> = [
  // Homepage
  { name: 'Homepage (/)', path: '/', expectedStatus: 200 },
  { name: 'Homepage (/tr)', path: '/tr', expectedStatus: 200 },
  
  // Listings
  { name: 'Kiralik (no locale)', path: '/kiralik', expectedStatus: 200 },
  { name: 'Kiralik (/tr)', path: '/tr/kiralik', expectedStatus: 200 },
  { name: 'Satilik (no locale)', path: '/satilik', expectedStatus: 200 },
  { name: 'Satilik (/tr)', path: '/tr/satilik', expectedStatus: 200 },
  
  // Regions
  { name: 'Kocaali (no locale)', path: '/kocaali', expectedStatus: 200 },
  { name: 'Kocaali (/tr)', path: '/tr/kocaali', expectedStatus: 200 },
  { name: 'Sapanca (no locale)', path: '/sapanca', expectedStatus: 200 },
  { name: 'Sapanca (/tr)', path: '/tr/sapanca', expectedStatus: 200 },
  
  // Content
  { name: 'Blog (no locale)', path: '/blog', expectedStatus: 200 },
  { name: 'Blog (/tr)', path: '/tr/blog', expectedStatus: 200 },
  { name: 'Haberler (no locale)', path: '/haberler', expectedStatus: 200 },
  { name: 'Haberler (/tr)', path: '/tr/haberler', expectedStatus: 200 },
  
  // SEO
  { name: 'Robots.txt', path: '/robots.txt', expectedStatus: 200 },
  { name: 'Sitemap.xml', path: '/sitemap.xml', expectedStatus: 200 },
  
  // API
  { name: 'API Health', path: '/api/health', expectedStatus: 200 },
  { name: 'API Listings', path: '/api/listings?limit=1', expectedStatus: 200 },
  { name: 'API Articles', path: '/api/articles?limit=1', expectedStatus: 200 },
  { name: 'API News', path: '/api/news?limit=1', expectedStatus: 200 },
  { name: 'API FAQ', path: '/api/faq', expectedStatus: 200 },
  
  // 404 cases
  { name: 'Non-existent page', path: '/nonexistent-page-12345', expectedStatus: 404 },
  { name: 'Invalid locale', path: '/invalid-locale/test', expectedStatus: 404 },
];

async function testRoute(route: typeof routes[0]): Promise<RouteTest> {
  const url = `${BASE}${route.path}`;
  const result: RouteTest = {
    name: route.name,
    url,
    expectedStatus: route.expectedStatus,
    expectedRedirect: route.expectedRedirect,
    actualStatus: 0,
    passed: false,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual', // Don't follow redirects
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    result.actualStatus = response.status;
    
    // Check redirect
    if (response.status >= 300 && response.status < 400) {
      result.actualRedirect = response.headers.get('location') || undefined;
    }

    // Check if passed
    if (route.expectedRedirect) {
      result.passed = result.actualRedirect === route.expectedRedirect;
    } else {
      result.passed = result.actualStatus === route.expectedStatus;
    }

    if (!result.passed) {
      result.error = `Expected ${route.expectedStatus}, got ${result.actualStatus}`;
    }
  } catch (error: any) {
    result.error = error.message || 'Request failed';
    result.passed = false;
  }

  return result;
}

async function main() {
  console.log('🔍 Testing Routes...\n');
  console.log(`BASE_URL: ${BASE}\n`);

  const results: RouteTest[] = [];
  let passed = 0;
  let failed = 0;

  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);

    if (result.passed) {
      passed++;
      console.log(`✅ ${result.name}: ${result.actualStatus}`);
    } else {
      failed++;
      console.log(`❌ ${result.name}: ${result.error || `Expected ${result.expectedStatus}, got ${result.actualStatus}`}`);
    }
  }

  // Generate report
  const report = generateReport(results, passed, failed);
  const outputPath = join(process.cwd(), 'DEBUG_ROUTING_REPORT.md');
  writeFileSync(outputPath, report, 'utf-8');

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`📄 Report written to: ${outputPath}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

function generateReport(results: RouteTest[], passed: number, failed: number): string {
  let md = '# DEBUG_ROUTING_REPORT.md\n\n';
  md += `Generated: ${new Date().toISOString()}\n`;
  md += `Base URL: ${BASE}\n\n`;

  md += '## Summary\n\n';
  md += `- Total routes tested: ${results.length}\n`;
  md += `- ✅ Passed: ${passed}\n`;
  md += `- ❌ Failed: ${failed}\n\n`;

  if (failed > 0) {
    md += '## ❌ Failed Routes\n\n';
    md += '| Route | Expected | Actual | Error |\n';
    md += '|-------|----------|--------|-------|\n';
    for (const r of results.filter(r => !r.passed)) {
      md += `| \`${r.name}\` | ${r.expectedStatus} | ${r.actualStatus} | ${r.error || '-'} |\n`;
    }
    md += '\n';
  }

  md += '## 📋 All Test Results\n\n';
  md += '| Route | Status | Expected | Actual |\n';
  md += '|-------|--------|----------|--------|\n';
  for (const r of results) {
    const status = r.passed ? '✅' : '❌';
    md += `| \`${r.name}\` | ${status} | ${r.expectedStatus} | ${r.actualStatus} |\n`;
  }

  md += '\n## 🔍 Next Steps\n\n';
  if (failed > 0) {
    md += '1. Fix failed routes above\n';
    md += '2. Check middleware rewrites\n';
    md += '3. Verify locale routing\n';
    md += '4. Re-run test: `pnpm tsx scripts/test-routing.ts`\n';
  } else {
    md += '✅ All routes working correctly!\n';
  }

  return md;
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
