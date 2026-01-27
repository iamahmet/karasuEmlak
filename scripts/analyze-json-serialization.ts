#!/usr/bin/env tsx
/**
 * Comprehensive Analysis: JSON.parse, res.json(), Date, BigInt, Decimal usage
 * 
 * Generates a report of all potential serialization issues
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { join } from 'path';

interface Finding {
  file: string;
  line: number;
  code: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  fix?: string;
}

const findings: Finding[] = [];

// Search patterns
const patterns = [
  {
    pattern: /JSON\.parse\(/g,
    issue: 'Unsafe JSON.parse - use safeJsonParse',
    severity: 'critical' as const,
    fix: 'Replace with safeJsonParse from @/lib/utils/safeJsonParse',
  },
  {
    pattern: /\.json\(\)/g,
    issue: 'Direct res.json() - ensure error handling',
    severity: 'warning' as const,
    fix: 'Ensure wrapped in try-catch and returns NextResponse.json',
  },
  {
    pattern: /new Date\(/g,
    issue: 'Date object - may not serialize',
    severity: 'warning' as const,
    fix: 'Convert to ISO string: date.toISOString()',
  },
  {
    pattern: /BigInt\(/g,
    issue: 'BigInt - not JSON serializable',
    severity: 'critical' as const,
    fix: 'Convert to string: String(bigint)',
  },
  {
    pattern: /Decimal|decimal/g,
    issue: 'Decimal type - may not serialize',
    severity: 'warning' as const,
    fix: 'Convert to number: decimal.toNumber()',
  },
];

function analyzeFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    patterns.forEach(({ pattern, issue, severity, fix }) => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const lineNum = content.substring(0, match.index).split('\n').length;
        const line = lines[lineNum - 1]?.trim() || '';
        
        // Skip if already using safe utilities
        if (issue.includes('JSON.parse') && line.includes('safeJsonParse')) continue;
        if (issue.includes('Date') && line.includes('toISOString')) continue;
        if (issue.includes('BigInt') && line.includes('String(')) continue;

        findings.push({
          file: filePath.replace(process.cwd() + '/', ''),
          line: lineNum,
          code: line.slice(0, 100),
          issue,
          severity,
          fix,
        });
      }
    });
  } catch (error) {
    // Skip files that can't be read
  }
}

// Analyze all TypeScript/TSX files in apps/web
const files = globSync('apps/web/**/*.{ts,tsx}', {
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**'],
});

console.log(`🔍 Analyzing ${files.length} files...\n`);

files.forEach(analyzeFile);

// Generate report
let report = '# JSON Serialization & Parse Safety Report\n\n';
report += `Generated: ${new Date().toISOString()}\n`;
report += `Files analyzed: ${files.length}\n`;
report += `Total findings: ${findings.length}\n\n`;

// Group by severity
const critical = findings.filter(f => f.severity === 'critical');
const warnings = findings.filter(f => f.severity === 'warning');
const info = findings.filter(f => f.severity === 'info');

report += '## Summary\n\n';
report += `- 🔴 Critical: ${critical.length}\n`;
report += `- ⚠️  Warnings: ${warnings.length}\n`;
report += `- ℹ️  Info: ${info.length}\n\n`;

if (critical.length > 0) {
  report += '## 🔴 Critical Issues\n\n';
  report += '| File | Line | Code | Issue | Fix |\n';
  report += '|------|------|------|-------|-----|\n';
  critical.forEach(f => {
    const code = f.code.replace(/\|/g, '\\|').slice(0, 60);
    report += `| \`${f.file}\` | ${f.line} | \`${code}...\` | ${f.issue} | ${f.fix || 'N/A'} |\n`;
  });
  report += '\n';
}

if (warnings.length > 0) {
  report += '## ⚠️  Warnings\n\n';
  report += '| File | Line | Code | Issue | Fix |\n';
  report += '|------|------|------|-------|-----|\n';
  warnings.slice(0, 50).forEach(f => {
    const code = f.code.replace(/\|/g, '\\|').slice(0, 60);
    report += `| \`${f.file}\` | ${f.line} | \`${code}...\` | ${f.issue} | ${f.fix || 'N/A'} |\n`;
  });
  if (warnings.length > 50) {
    report += `\n... and ${warnings.length - 50} more warnings\n`;
  }
  report += '\n';
}

// Group by file
const byFile = new Map<string, Finding[]>();
findings.forEach(f => {
  const existing = byFile.get(f.file) || [];
  existing.push(f);
  byFile.set(f.file, existing);
});

report += '## 📋 Findings by File\n\n';
Array.from(byFile.entries())
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 20)
  .forEach(([file, fileFindings]) => {
    report += `### ${file} (${fileFindings.length} issues)\n\n`;
    fileFindings.forEach(f => {
      report += `- Line ${f.line}: ${f.issue} (${f.severity})\n`;
    });
    report += '\n';
  });

report += '\n## ✅ Next Steps\n\n';
report += '1. Fix all critical issues (unsafe JSON.parse, BigInt)\n';
report += '2. Review warnings (Date, Decimal usage)\n';
report += '3. Ensure all API routes return valid JSON\n';
report += '4. Run smoke test to verify fixes\n';

const outputPath = join(process.cwd(), 'DEBUG_SERIALIZATION_REPORT.md');
writeFileSync(outputPath, report, 'utf-8');

console.log(`📊 Analysis complete:`);
console.log(`   Critical: ${critical.length}`);
console.log(`   Warnings: ${warnings.length}`);
console.log(`   Report: ${outputPath}\n`);

process.exit(critical.length > 0 ? 1 : 0);
