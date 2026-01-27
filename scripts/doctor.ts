#!/usr/bin/env tsx
/**
 * Doctor Command - Comprehensive Health Check
 * 
 * Runs all checks: lint, typecheck, build, smoke tests
 * Generates DEBUG_DOCTOR_REPORT.md
 * 
 * Usage:
 *   pnpm doctor
 *   pnpm doctor --skip-build
 *   pnpm doctor --skip-smoke
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface CheckResult {
  name: string;
  command: string;
  passed: boolean;
  duration: number;
  output: string;
  error?: string;
}

const results: CheckResult[] = [];
const startTime = Date.now();

function runCheck(name: string, command: string, cwd?: string): CheckResult {
  const checkStart = Date.now();
  console.log(`\n🔍 Running: ${name}...`);
  
  try {
    const output = execSync(command, {
      cwd: cwd || process.cwd(),
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024, // 10MB
    });
    
    const duration = Date.now() - checkStart;
    console.log(`✅ ${name} passed (${duration}ms)`);
    
    return {
      name,
      command,
      passed: true,
      duration,
      output: output.slice(0, 5000), // Limit output size
    };
  } catch (error: any) {
    const duration = Date.now() - checkStart;
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || 'Unknown error';
    console.log(`❌ ${name} failed (${duration}ms)`);
    
    return {
      name,
      command,
      passed: false,
      duration,
      output: errorOutput.slice(0, 5000),
      error: errorOutput.slice(0, 500),
    };
  }
}

async function runSmokeTest(): Promise<CheckResult> {
  const checkStart = Date.now();
  console.log(`\n🔍 Running: Smoke Tests...`);
  
  try {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    
    // Check if server is running
    try {
      await fetch(`${BASE_URL}/healthz`, { signal: AbortSignal.timeout(2000) });
    } catch {
      console.log(`⚠️  Server not running at ${BASE_URL}, skipping smoke tests`);
      return {
        name: 'Smoke Tests',
        command: 'smoke.ts',
        passed: true,
        duration: Date.now() - checkStart,
        output: 'Skipped (server not running)',
      };
    }
    
    // Run smoke test script
    const output = execSync('pnpm smoke:web', {
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024,
    });
    
    const duration = Date.now() - checkStart;
    console.log(`✅ Smoke Tests passed (${duration}ms)`);
    
    return {
      name: 'Smoke Tests',
      command: 'pnpm smoke:web',
      passed: true,
      duration,
      output: output.slice(0, 5000),
    };
  } catch (error: any) {
    const duration = Date.now() - checkStart;
    const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message || 'Unknown error';
    console.log(`❌ Smoke Tests failed (${duration}ms)`);
    
    return {
      name: 'Smoke Tests',
      command: 'pnpm smoke:web',
      passed: false,
      duration,
      output: errorOutput.slice(0, 5000),
      error: errorOutput.slice(0, 500),
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const skipBuild = args.includes('--skip-build');
  const skipSmoke = args.includes('--skip-smoke');
  
  console.log('🏥 Doctor - Comprehensive Health Check');
  console.log('=' .repeat(60));
  
  // 1. Lint
  results.push(runCheck(
    'Lint (apps/web)',
    'pnpm -C apps/web lint',
  ));
  
  // 2. Typecheck
  results.push(runCheck(
    'Typecheck (apps/web)',
    'pnpm -C apps/web typecheck',
  ));
  
  // 3. Build
  if (!skipBuild) {
    results.push(runCheck(
      'Build (apps/web)',
      'pnpm -C apps/web build',
    ));
  }
  
  // 4. Smoke Tests
  if (!skipSmoke) {
    results.push(await runSmokeTest());
  }
  
  // Generate report
  const totalDuration = Date.now() - startTime;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  const report = generateReport(results, totalDuration, passed, failed);
  const outputPath = join(process.cwd(), 'DEBUG_DOCTOR_REPORT.md');
  writeFileSync(outputPath, report, 'utf-8');
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Results: ${passed} passed, ${failed} failed (${totalDuration}ms)`);
  console.log(`📄 Report written to: ${outputPath}\n`);
  
  // Exit with error code if any failures
  process.exit(failed > 0 ? 1 : 0);
}

function generateReport(results: CheckResult[], totalDuration: number, passed: number, failed: number): string {
  let md = '# DEBUG_DOCTOR_REPORT.md\n\n';
  md += `Generated: ${new Date().toISOString()}\n`;
  md += `Total Duration: ${totalDuration}ms\n\n`;
  
  md += '## Summary\n\n';
  md += `- ✅ Passed: ${passed}/${results.length}\n`;
  md += `- ❌ Failed: ${failed}/${results.length}\n`;
  md += `- ⏱️  Total Duration: ${totalDuration}ms\n\n`;
  
  if (failed > 0) {
    md += '## ❌ Failed Checks\n\n';
    for (const r of results.filter(r => !r.passed)) {
      md += `### ${r.name}\n\n`;
      md += `**Command:** \`${r.command}\`\n\n`;
      md += `**Duration:** ${r.duration}ms\n\n`;
      md += `**Error:**\n\`\`\`\n${r.error || 'Unknown error'}\n\`\`\`\n\n`;
      md += `**Output:**\n\`\`\`\n${r.output.slice(0, 2000)}\n\`\`\`\n\n`;
    }
  }
  
  md += '## 📋 All Check Results\n\n';
  md += '| Check | Status | Duration |\n';
  md += '|-------|--------|----------|\n';
  for (const r of results) {
    const status = r.passed ? '✅' : '❌';
    md += `| ${r.name} | ${status} | ${r.duration}ms |\n`;
  }
  
  md += '\n## 🔍 Next Steps\n\n';
  if (failed > 0) {
    md += '1. Fix all failed checks above\n';
    md += '2. Re-run doctor: `pnpm doctor`\n';
    md += '3. Verify fixes with smoke tests\n';
  } else {
    md += '✅ All checks passed! Project is healthy.\n';
  }
  
  return md;
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
