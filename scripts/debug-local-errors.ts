#!/usr/bin/env tsx
/**
 * Local Error Map Generator
 * 
 * Tests all endpoints and generates DEBUG_LOCAL_ERROR_MAP.md
 * Captures 500 errors with full stack traces
 * 
 * Usage:
 *   BASE_URL=http://localhost:3000 pnpm tsx scripts/debug-local-errors.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  url: string;
  status: number;
  contentType: string;
  bodyPreview: string;
  bodyLength: number;
  isJson: boolean;
  jsonParseOk: boolean;
  jsonParseError?: string;
  error?: string;
  is500: boolean;
  stackTrace?: string;
}

const ENDPOINTS: Array<{ name: string; path: string; expectJson: boolean }> = [
  // API Routes
  { name: 'api/health', path: '/api/health', expectJson: true },
  { name: 'api/listings', path: '/api/listings?limit=1', expectJson: true },
  { name: 'api/articles', path: '/api/articles?limit=1', expectJson: true },
  { name: 'api/news', path: '/api/news?limit=1', expectJson: true },
  { name: 'api/faq', path: '/api/faq', expectJson: true },
  { name: 'api/neighborhoods', path: '/api/neighborhoods', expectJson: true },
  { name: 'api/stats/listings', path: '/api/stats/listings', expectJson: true },
  
  // Pages
  { name: 'homepage', path: '/', expectJson: false },
  { name: 'kiralik', path: '/kiralik', expectJson: false },
  { name: 'satilik', path: '/satilik', expectJson: false },
  { name: 'sapanca', path: '/sapanca', expectJson: false },
  { name: 'kocaali', path: '/kocaali', expectJson: false },
  { name: 'blog', path: '/blog', expectJson: false },
  { name: 'haberler', path: '/haberler', expectJson: false },
  { name: 'yazarlar', path: '/yazarlar', expectJson: false },
  
  // SEO
  { name: 'robots.txt', path: '/robots.txt', expectJson: false },
  { name: 'sitemap.xml', path: '/sitemap.xml', expectJson: false },
];

async function testEndpoint(entry: typeof ENDPOINTS[0]): Promise<TestResult> {
  const url = `${BASE}${entry.path}`;
  const result: TestResult = {
    name: entry.name,
    url,
    status: 0,
    contentType: '',
    bodyPreview: '',
    bodyLength: 0,
    isJson: false,
    jsonParseOk: false,
    is500: false,
  };

  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
    });

    result.status = res.status;
    result.contentType = res.headers.get('content-type') || '';
    const text = await res.text();
    result.bodyLength = text.length;
    result.bodyPreview = text.slice(0, 500).replace(/\s+/g, ' ');

    result.isJson = result.contentType.toLowerCase().includes('application/json');
    result.is500 = res.status >= 500;

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
    if (result.is500) {
      result.error = `HTTP ${res.status} (Server Error)`;
      // Try to extract error details from JSON response
      if (result.isJson && result.jsonParseOk) {
        try {
          const parsed = JSON.parse(text);
          if (parsed.error || parsed.message) {
            result.error = parsed.error || parsed.message;
          }
          if (parsed.stack && process.env.NODE_ENV === 'development') {
            result.stackTrace = parsed.stack;
          }
        } catch {}
      } else if (text.includes('Error:') || text.includes('at ')) {
        // Try to extract stack trace from HTML/text response
        const stackMatch = text.match(/(Error:[\s\S]*?)(?:\n\n|$)/);
        if (stackMatch) {
          result.stackTrace = stackMatch[1].slice(0, 1000);
        }
      }
    } else if (res.status >= 400 && res.status < 500) {
      result.error = `HTTP ${res.status} (Client Error)`;
    } else if (entry.expectJson && !result.isJson) {
      result.error = `Expected JSON but got ${result.contentType}`;
    } else if (entry.expectJson && !result.jsonParseOk) {
      result.error = `Invalid JSON: ${result.jsonParseError}`;
    }
  } catch (err: any) {
    result.error = err?.message || String(err);
    result.is500 = true;
  }

  return result;
}

async function main() {
  console.log('🔍 Local Error Map Generator');
  console.log(`BASE_URL: ${BASE}\n`);

  const results: TestResult[] = [];
  let passed = 0;
  let failed = 0;
  let errors500 = 0;

  // Test all endpoints
  for (const entry of ENDPOINTS) {
    const result = await testEndpoint(entry);
    results.push(result);

    if (result.error || result.is500) {
      failed++;
      if (result.is500) errors500++;
      console.log(`❌ [${result.status}] ${result.name}: ${result.error || 'Server Error'}`);
      if (result.stackTrace) {
        console.log(`   Stack: ${result.stackTrace.slice(0, 200)}...`);
      }
    } else {
      passed++;
      console.log(`✅ [${result.status}] ${result.name}`);
    }
  }

  // Generate report
  const report = generateReport(results, passed, failed, errors500);
  const outputPath = join(process.cwd(), 'DEBUG_LOCAL_ERROR_MAP.md');
  writeFileSync(outputPath, report, 'utf-8');

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed (${errors500} are 500 errors)`);
  console.log(`📄 Error map written to: ${outputPath}\n`);

  // Exit with error code if any failures
  process.exit(failed > 0 ? 1 : 0);
}

function generateReport(results: TestResult[], passed: number, failed: number, errors500: number): string {
  const errors = results.filter(r => r.error || r.is500);
  const jsonParseFailures = results.filter(r => !r.jsonParseOk && (r.isJson || r.jsonParseError));
  const errors500List = results.filter(r => r.is500);

  let md = '# DEBUG_LOCAL_ERROR_MAP.md\n\n';
  md += `Generated: ${new Date().toISOString()}\n`;
  md += `Base URL: ${BASE}\n\n`;

  md += '## Summary\n\n';
  md += `- Total endpoints tested: ${results.length}\n`;
  md += `- ✅ Passed: ${passed}\n`;
  md += `- ❌ Failed: ${failed}\n`;
  md += `- 🔴 500 Errors: ${errors500}\n`;
  md += `- 🔴 JSON Parse Errors: ${jsonParseFailures.length}\n\n`;

  if (errors500List.length > 0) {
    md += '## 🔴 500 Server Errors (CRITICAL)\n\n';
    md += '| Endpoint | Status | Error | Stack Trace |\n';
    md += '|----------|--------|-------|-------------|\n';
    for (const r of errors500List) {
      const stack = r.stackTrace ? r.stackTrace.slice(0, 200) + '...' : '-';
      md += `| \`${r.name}\` | ${r.status} | ${r.error || 'Server Error'} | ${stack} |\n`;
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

  if (errors.length > 0) {
    md += '## ❌ All Errors\n\n';
    md += '| Endpoint | Status | Error |\n';
    md += '|----------|--------|-------|\n';
    for (const r of errors) {
      md += `| \`${r.name}\` | ${r.status} | ${r.error || 'Unknown'} |\n`;
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

  md += '\n## 🔍 Root Cause Analysis\n\n';
  
  if (errors500List.length > 0) {
    md += '### 500 Errors - Possible Causes:\n\n';
    md += '1. **Missing Environment Variables**\n';
    md += '   - Check `.env.local` for required vars\n';
    md += '   - Run: `pnpm tsx scripts/check-env.ts`\n\n';
    md += '2. **Supabase Connection Issues**\n';
    md += '   - Verify `NEXT_PUBLIC_SUPABASE_URL` and keys\n';
    md += '   - Check PostgREST schema cache: `pnpm supabase:reload-postgrest`\n\n';
    md += '3. **Database Table Missing**\n';
    md += '   - Check if tables exist in Supabase Dashboard\n';
    md += '   - Apply migrations: `pnpm supabase:migration:up`\n\n';
    md += '4. **Edge/Node Runtime Conflict**\n';
    md += '   - Check for `process`, `fs`, `window`, `document` in edge routes\n';
    md += '   - Use `NEXT_RUNTIME === "nodejs"` guards\n\n';
    md += '5. **JSON Serialization Error**\n';
    md += '   - Date/BigInt/Decimal not serialized\n';
    md += '   - Use `toSerializable()` helper\n\n';
  }

  md += '\n## 🔧 Next Steps\n\n';
  md += '1. Fix all 500 errors above\n';
  md += '2. Check server console for full stack traces\n';
  md += '3. Run ENV doctor: `pnpm tsx scripts/check-env.ts`\n';
  md += '4. Verify Supabase connection and tables\n';
  md += '5. Re-run this script to verify fixes\n';

  return md;
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
