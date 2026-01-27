#!/usr/bin/env tsx
/**
 * Vercel Environment Variables Checker
 * 
 * Checks for whitespace issues in environment variables (especially CRON_SECRET)
 * Generates DEBUG_ENV_REPORT.md
 * 
 * Usage:
 *   pnpm check:vercel-env
 *   VERCEL_TOKEN=xxx pnpm check:vercel-env
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

interface EnvVar {
  key: string;
  value: string;
  hasLeadingWhitespace: boolean;
  hasTrailingWhitespace: boolean;
  isEmpty: boolean;
  issues: string[];
}

async function checkVercelEnv(): Promise<EnvVar[]> {
  const results: EnvVar[] = [];
  
  try {
    // Get Vercel env vars
    const output = execSync('vercel env ls --json', {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    
    const envVars = JSON.parse(output);
    
    for (const env of envVars) {
      const key = env.key;
      const value = env.value || '';
      
      const hasLeadingWhitespace = /^\s/.test(value);
      const hasTrailingWhitespace = /\s$/.test(value);
      const isEmpty = value.trim().length === 0;
      
      const issues: string[] = [];
      if (hasLeadingWhitespace) {
        issues.push('Leading whitespace');
      }
      if (hasTrailingWhitespace) {
        issues.push('Trailing whitespace');
      }
      if (isEmpty) {
        issues.push('Empty value');
      }
      
      results.push({
        key,
        value: value.length > 50 ? value.slice(0, 50) + '...' : value,
        hasLeadingWhitespace,
        hasTrailingWhitespace,
        isEmpty,
        issues,
      });
    }
  } catch (error: any) {
    console.error('Failed to check Vercel env vars:', error.message);
    console.error('Make sure you are logged in: vercel login');
  }
  
  return results;
}

function generateReport(results: EnvVar[]): string {
  let md = '# DEBUG_ENV_REPORT.md\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;
  
  const issues = results.filter(r => r.issues.length > 0);
  const critical = issues.filter(r => 
    r.key === 'CRON_SECRET' || 
    r.key.includes('SECRET') || 
    r.key.includes('KEY')
  );
  
  md += '## Summary\n\n';
  md += `- Total env vars checked: ${results.length}\n`;
  md += `- ⚠️  Issues found: ${issues.length}\n`;
  md += `- 🔴 Critical issues: ${critical.length}\n\n`;
  
  if (critical.length > 0) {
    md += '## 🔴 Critical Issues (Must Fix)\n\n';
    md += '| Variable | Issues |\n';
    md += '|----------|--------|\n';
    for (const env of critical) {
      md += `| \`${env.key}\` | ${env.issues.join(', ')} |\n`;
    }
    md += '\n';
  }
  
  if (issues.length > 0) {
    md += '## ⚠️  All Issues\n\n';
    md += '| Variable | Issues |\n';
    md += '|----------|--------|\n';
    for (const env of issues) {
      md += `| \`${env.key}\` | ${env.issues.join(', ')} |\n`;
    }
    md += '\n';
  }
  
  md += '## 🔧 How to Fix\n\n';
  md += '### Remove Whitespace from CRON_SECRET\n\n';
  md += '```bash\n';
  md += '# ❌ WRONG (adds whitespace)\n';
  md += "echo 'secret' | vercel env add CRON_SECRET production\n\n";
  md += '# ✅ CORRECT (no whitespace)\n';
  md += "printf 'secret' | vercel env add CRON_SECRET production\n";
  md += '```\n\n';
  
  md += '### Fix All Environments\n\n';
  md += '```bash\n';
  md += 'for env in production preview development; do\n';
  md += "  printf 'secret' | vercel env add CRON_SECRET $env\n";
  md += 'done\n';
  md += '```\n\n';
  
  md += '## 📋 All Environment Variables\n\n';
  md += '| Variable | Has Issues |\n';
  md += '|----------|------------|\n';
  for (const env of results) {
    const status = env.issues.length > 0 ? '⚠️' : '✅';
    md += `| \`${env.key}\` | ${status} |\n`;
  }
  
  return md;
}

async function main() {
  console.log('🔍 Checking Vercel Environment Variables...\n');
  
  const results = await checkVercelEnv();
  const report = generateReport(results);
  
  const outputPath = join(process.cwd(), 'DEBUG_ENV_REPORT.md');
  writeFileSync(outputPath, report, 'utf-8');
  
  const issues = results.filter(r => r.issues.length > 0);
  const critical = issues.filter(r => 
    r.key === 'CRON_SECRET' || 
    r.key.includes('SECRET') || 
    r.key.includes('KEY')
  );
  
  console.log(`📊 Results: ${issues.length} issues found (${critical.length} critical)`);
  console.log(`📄 Report written to: ${outputPath}\n`);
  
  if (critical.length > 0) {
    console.error('🔴 CRITICAL: Fix environment variables with whitespace issues!');
    process.exit(1);
  }
  
  if (issues.length > 0) {
    console.warn('⚠️  WARNING: Some environment variables have issues');
    process.exit(0);
  }
  
  console.log('✅ All environment variables are clean!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
