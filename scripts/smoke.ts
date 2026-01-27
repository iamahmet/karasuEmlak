#!/usr/bin/env tsx
/**
 * Comprehensive Smoke Test & Error Map Generator
 * 
 * Tests all critical endpoints and pages, generates DEBUG_ERROR_MAP.md
 * 
 * Usage:
 *   BASE_URL=http://localhost:3000 pnpm tsx scripts/smoke.ts
 *   pnpm smoke:web
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const TRIM = 200;

interface TestResult {
  name: string;
  url: string;
  method: string;
  status: number;
  contentType: string;
  bodyPreview: string;
  bodyLength: number;
  isJson: boolean;
  jsonParseOk: boolean;
  jsonParseError?: string;
  error?: string;
  callerPages?: string[];
}

interface Entry {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  body?: string;
  expectJson: boolean;
  callerPages?: string[]; // Pages that use this endpoint
}

const ENDPOINTS: Entry[] = [
  // Health & Status
  { name: 'healthz', method: 'GET', path: '/healthz', expectJson: true },
  { name: 'api/health', method: 'GET', path: '/api/health', expectJson: true },
  
  // Core Data APIs
  { name: 'api/listings', method: 'GET', path: '/api/listings?limit=1', expectJson: true, callerPages: ['/', '/kiralik', '/satilik'] },
  { name: 'api/articles', method: 'GET', path: '/api/articles?limit=1', expectJson: true, callerPages: ['/', '/blog'] },
  { name: 'api/news', method: 'GET', path: '/api/news?limit=1', expectJson: true, callerPages: ['/', '/haberler'] },
  { name: 'api/neighborhoods', method: 'GET', path: '/api/neighborhoods', expectJson: true, callerPages: ['/'] },
  { name: 'api/faq', method: 'GET', path: '/api/faq', expectJson: true },
  { name: 'api/stats/listings', method: 'GET', path: '/api/stats/listings', expectJson: true, callerPages: ['/'] },
  
  // Key Pages (server-side rendered)
  { name: 'homepage', method: 'GET', path: '/', expectJson: false, callerPages: [] },
  { name: 'kiralik', method: 'GET', path: '/kiralik', expectJson: false, callerPages: [] },
  { name: 'satilik', method: 'GET', path: '/satilik', expectJson: false, callerPages: [] },
  { name: 'blog', method: 'GET', path: '/blog', expectJson: false, callerPages: [] },
  { name: 'haberler', method: 'GET', path: '/haberler', expectJson: false, callerPages: [] },
  
  // SEO & Sitemap
  { name: 'sitemap.xml', method: 'GET', path: '/sitemap.xml', expectJson: false },
  { name: 'robots.txt', method: 'GET', path: '/robots.txt', expectJson: false },
  
  // Admin APIs (if accessible)
  { name: 'api/dashboard/stats', method: 'GET', path: '/api/dashboard/stats', expectJson: true, callerPages: ['/admin/dashboard'] },
  
  // Analytics
  { name: 'api/analytics/web-vitals GET', method: 'GET', path: '/api/analytics/web-vitals', expectJson: true },
  {
    name: 'api/analytics/web-vitals POST',
    method: 'POST',
    path: '/api/analytics/web-vitals',
    body: JSON.stringify({ name: 'FCP', value: 100, id: 'smoke-1' }),
    expectJson: true,
  },
];

async function testEndpoint(entry: Entry): Promise<TestResult> {
  const url = `${BASE}${entry.path}`;
  const result: TestResult = {
    name: entry.name,
    url,
    method: entry.method,
    status: 0,
    contentType: '',
    bodyPreview: '',
    bodyLength: 0,
    isJson: false,
    jsonParseOk: false,
    callerPages: entry.callerPages,
  };

  try {
    const res = await fetch(url, {
      method: entry.method,
      headers: entry.body ? { 'Content-Type': 'application/json' } : {},
      body: entry.body,
      // Don't follow redirects - we want to see 3xx status codes
      redirect: 'manual',
    });

    result.status = res.status;
    result.contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    result.bodyLength = text.length;
    result.bodyPreview = text.slice(0, TRIM).replace(/\s+/g, ' ');

    // Check if JSON
    result.isJson = result.contentType.toLowerCase().includes('application/json');

    // Try to parse JSON if expected or if content-type says JSON
    if (entry.expectJson || result.isJson) {
      try {
        JSON.parse(text);
        result.jsonParseOk = true;
      } catch (parseError: any) {
        result.jsonParseOk = false;
        result.jsonParseError = parseError?.message || 'Unknown parse error';
      }
    }

    // Check for errors
    if (res.status >= 500) {
      result.error = `HTTP ${res.status} (Server Error)`;
    } else if (res.status >= 400) {
      result.error = `HTTP ${res.status} (Client Error)`;
    } else if (entry.expectJson && !result.isJson) {
      result.error = `Expected JSON but got ${result.contentType}`;
    } else if (entry.expectJson && !result.jsonParseOk) {
      result.error = `Invalid JSON: ${result.jsonParseError}`;
    }
  } catch (err: any) {
    result.error = err?.message || String(err);
  }

  return result;
}

async function run() {
  console.log('🔍 Comprehensive Smoke Test & Error Map Generator');
  console.log(`BASE_URL: ${BASE}\n`);

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;

  // Test all endpoints
  for (const entry of ENDPOINTS) {
    const result = await testEndpoint(entry);
    results.push(result);

    if (result.error) {
      failed++;
      console.log(`❌ [FAIL] ${result.name}: ${result.error}`);
      if (result.bodyPreview) {
        console.log(`   Preview: ${result.bodyPreview.slice(0, 100)}...`);
      }
    } else {
      passed++;
      const status = result.status >= 200 && result.status < 300 ? '✅' : '⚠️';
      console.log(`${status} [OK]   ${result.name}: ${result.status} | ${result.contentType.slice(0, 40)}`);
    }
  }

  // Generate error map markdown
  const errorMap = generateErrorMap(results);
  const outputPath = join(process.cwd(), 'DEBUG_ERROR_MAP.md');
  writeFileSync(outputPath, errorMap, 'utf-8');

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  console.log(`📄 Error map written to: ${outputPath}\n`);

  // Exit with error code if any failures
  process.exit(failed > 0 ? 1 : 0);
}

function generateErrorMap(results: TestResult[]): string {
  const failures = results.filter(r => r.error);
  const jsonParseFailures = results.filter(r => !r.jsonParseOk && (r.isJson || r.jsonParseError));
  const nonJsonResponses = results.filter(r => r.isJson === false && r.status >= 200 && r.status < 300);

  let md = '# DEBUG_ERROR_MAP.md\n\n';
  md += `Generated: ${new Date().toISOString()}\n`;
  md += `Base URL: ${BASE}\n\n`;

  md += '## Summary\n\n';
  md += `- Total endpoints tested: ${results.length}\n`;
  md += `- ✅ Passed: ${results.length - failures.length}\n`;
  md += `- ❌ Failed: ${failures.length}\n`;
  md += `- 🔴 JSON Parse Errors: ${jsonParseFailures.length}\n`;
  md += `- ⚠️  Non-JSON Responses: ${nonJsonResponses.length}\n\n`;

  if (failures.length > 0) {
    md += '## ❌ Failed Endpoints\n\n';
    md += '| Endpoint | Status | Error | Caller Pages |\n';
    md += '|----------|--------|-------|--------------|\n';
    for (const r of failures) {
      const callers = r.callerPages?.join(', ') || '-';
      md += `| \`${r.name}\` | ${r.status} | ${r.error || 'Unknown'} | ${callers} |\n`;
    }
    md += '\n';
  }

  if (jsonParseFailures.length > 0) {
    md += '## 🔴 JSON Parse Errors\n\n';
    md += '| Endpoint | Error | Body Preview |\n';
    md += '|----------|-------|--------------|\n';
    for (const r of jsonParseFailures) {
      md += `| \`${r.name}\` | ${r.jsonParseError || 'Invalid JSON'} | ${r.bodyPreview.slice(0, 100)}... |\n`;
    }
    md += '\n';
  }

  md += '## 📋 All Test Results\n\n';
  md += '| Endpoint | Status | Content-Type | JSON OK | Error |\n';
  md += '|----------|--------|---------------|---------|-------|\n';
  for (const r of results) {
    const jsonOk = r.isJson ? (r.jsonParseOk ? '✅' : '❌') : '-';
    const error = r.error || '-';
    md += `| \`${r.name}\` | ${r.status} | ${r.contentType.slice(0, 30)} | ${jsonOk} | ${error} |\n`;
  }

  md += '\n## 🔍 Next Steps\n\n';
  md += '1. Fix all endpoints marked as failed\n';
  md += '2. Replace unsafe JSON.parse with safeJsonParse utility\n';
  md += '3. Ensure all API routes return valid JSON\n';
  md += '4. Fix serialization issues (Date, BigInt, etc.)\n';
  md += '5. Re-run smoke test to verify fixes\n';

  return md;
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
