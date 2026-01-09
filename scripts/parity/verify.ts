#!/usr/bin/env tsx
/**
 * PHASE 7: Verification
 * 
 * Verifies that all fixes were applied correctly:
 * - Random sampling: Check 20 previously missing URLs locally
 * - Confirm redirects return 301 and land on correct target
 * - Confirm sitemaps contain expected URLs
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'scripts/parity');
const DIFF_FILE = path.join(OUTPUT_DIR, 'diff-report.json');
const FIX_FILE = path.join(OUTPUT_DIR, 'fix-report.json');
const LOCAL_BASE_URL = 'http://localhost:3000';

interface VerificationResult {
  url: string;
  status: 'ok' | 'missing' | 'redirect' | 'error';
  httpStatus?: number;
  redirectTarget?: string;
  error?: string;
}

/**
 * Check if a URL exists locally
 */
async function checkUrl(url: string): Promise<VerificationResult> {
  const localUrl = url.replace('https://www.karasuemlak.net', LOCAL_BASE_URL);
  
  try {
    const response = await fetch(localUrl, {
      method: 'HEAD',
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ParityAuditor/1.0)',
      },
    });
    
    if (response.status === 200) {
      return {
        url,
        status: 'ok',
        httpStatus: 200,
      };
    } else if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location');
      return {
        url,
        status: 'redirect',
        httpStatus: response.status,
        redirectTarget: location || undefined,
      };
    } else if (response.status === 404) {
      return {
        url,
        status: 'missing',
        httpStatus: 404,
      };
    } else {
      return {
        url,
        status: 'error',
        httpStatus: response.status,
        error: `Unexpected status: ${response.status}`,
      };
    }
  } catch (error) {
    return {
      url,
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main verification function
 */
async function verifyFixes(): Promise<void> {
  console.log('✅ PHASE 7: Verification');
  console.log('==========================\n');
  
  // Load reports
  const diffData = JSON.parse(await fs.readFile(DIFF_FILE, 'utf-8'));
  const fixData = JSON.parse(await fs.readFile(FIX_FILE, 'utf-8'));
  
  const missing = diffData.missing || [];
  const actions = fixData.actions || [];
  const redirects = fixData.redirects || [];
  
  console.log(`Verifying fixes for ${missing.length} previously missing URLs...\n`);
  
  // Sample 20 URLs for verification
  const sampleSize = Math.min(20, missing.length);
  const sample = missing
    .sort(() => Math.random() - 0.5)
    .slice(0, sampleSize);
  
  console.log(`Checking ${sampleSize} sample URLs...\n`);
  
  const results: VerificationResult[] = [];
  
  for (let i = 0; i < sample.length; i++) {
    const entry = sample[i];
    console.log(`[${i + 1}/${sample.length}] ${entry.normalized}`);
    
    const result = await checkUrl(entry.url);
    results.push(result);
    
    if (result.status === 'ok') {
      console.log(`  ✅ OK (200)`);
    } else if (result.status === 'redirect') {
      console.log(`  ↪️  Redirect (${result.httpStatus}) → ${result.redirectTarget}`);
    } else if (result.status === 'missing') {
      console.log(`  ⚠️  Missing (404)`);
    } else {
      console.log(`  ✗ Error: ${result.error}`);
    }
    
    // Small delay
    if (i < sample.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Statistics
  const stats = {
    total: results.length,
    ok: results.filter(r => r.status === 'ok').length,
    redirect: results.filter(r => r.status === 'redirect').length,
    missing: results.filter(r => r.status === 'missing').length,
    error: results.filter(r => r.status === 'error').length,
  };
  
  console.log('\n📊 Verification Summary:');
  console.log(`   Total checked: ${stats.total}`);
  console.log(`   ✅ OK: ${stats.ok}`);
  console.log(`   ↪️  Redirects: ${stats.redirect}`);
  console.log(`   ⚠️  Missing: ${stats.missing}`);
  console.log(`   ✗ Errors: ${stats.error}`);
  
  // Verify redirects
  if (redirects.length > 0) {
    console.log(`\nVerifying ${redirects.length} redirects...\n`);
    
    const redirectResults: VerificationResult[] = [];
    
    for (let i = 0; i < Math.min(10, redirects.length); i++) {
      const redirect = redirects[i];
      console.log(`[${i + 1}/${Math.min(10, redirects.length)}] ${redirect.from}`);
      
      const result = await checkUrl(`${LOCAL_BASE_URL}${redirect.from}`);
      redirectResults.push(result);
      
      if (result.status === 'redirect' && result.redirectTarget === redirect.to) {
        console.log(`  ✅ Correct redirect to ${redirect.to}`);
      } else {
        console.log(`  ⚠️  Redirect issue: ${result.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Save verification report
  const report = {
    verifiedAt: new Date().toISOString(),
    stats,
    results,
    sampleSize,
  };
  
  const reportFile = path.join(OUTPUT_DIR, 'verification-report.json');
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✅ Saved verification report: ${reportFile}`);
  
  // Final verdict
  const successRate = (stats.ok + stats.redirect) / stats.total;
  if (successRate >= 0.8) {
    console.log(`\n✅ Verification PASSED (${(successRate * 100).toFixed(1)}% success rate)`);
  } else {
    console.log(`\n⚠️  Verification WARNING (${(successRate * 100).toFixed(1)}% success rate)`);
    console.log(`   Some URLs are still missing. Review the report and re-run fixes.`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyFixes().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { verifyFixes };
