#!/usr/bin/env tsx

/**
 * Performance Audit Script
 * Analyzes site performance and suggests optimizations
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PerformanceIssue {
  type: 'warning' | 'error' | 'info';
  category: string;
  message: string;
  suggestion: string;
  file?: string;
  line?: number;
}

const issues: PerformanceIssue[] = [];

// Check Next.js config
function checkNextConfig() {
  const configPath = join(process.cwd(), 'apps/web/next.config.mjs');
  try {
    const config = readFileSync(configPath, 'utf-8');
    
    // Check for image optimization
    if (!config.includes('formats:') || !config.includes('image/avif')) {
      issues.push({
        type: 'warning',
        category: 'Image Optimization',
        message: 'AVIF format not explicitly enabled',
        suggestion: 'Ensure AVIF format is enabled in next.config.mjs for better image compression',
        file: configPath,
      });
    }

    // Check for bundle optimization
    if (!config.includes('optimizePackageImports')) {
      issues.push({
        type: 'info',
        category: 'Bundle Optimization',
        message: 'Package imports optimization not configured',
        suggestion: 'Add optimizePackageImports for commonly used packages',
        file: configPath,
      });
    }

    // Check for compression
    if (!config.includes('compress: true')) {
      issues.push({
        type: 'warning',
        category: 'Compression',
        message: 'Gzip compression not explicitly enabled',
        suggestion: 'Enable compress: true in next.config.mjs',
        file: configPath,
      });
    }
  } catch (error) {
    issues.push({
      type: 'error',
      category: 'Configuration',
      message: 'Could not read next.config.mjs',
      suggestion: 'Check file exists and is readable',
    });
  }
}

// Check for large components
function checkLargeComponents() {
  const componentsPath = join(process.cwd(), 'apps/web/components');
  // This would require file system traversal - simplified for now
  issues.push({
    type: 'info',
    category: 'Code Splitting',
    message: 'Consider code splitting for large components',
    suggestion: 'Use dynamic imports for heavy components (maps, charts, etc.)',
  });
}

// Generate report
function generateReport() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: issues.length,
      errors: issues.filter(i => i.type === 'error').length,
      warnings: issues.filter(i => i.type === 'warning').length,
      info: issues.filter(i => i.type === 'info').length,
    },
    issues: issues,
    recommendations: [
      'Enable image optimization (AVIF, WebP)',
      'Use dynamic imports for heavy components',
      'Implement proper caching strategies',
      'Optimize bundle size with tree-shaking',
      'Use React Server Components where possible',
      'Implement proper lazy loading',
      'Optimize database queries',
      'Use CDN for static assets',
    ],
  };

  const reportPath = join(process.cwd(), 'PERFORMANCE_AUDIT_REPORT.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Performance Audit Report');
  console.log('='.repeat(50));
  console.log(`Total Issues: ${report.summary.total}`);
  console.log(`Errors: ${report.summary.errors}`);
  console.log(`Warnings: ${report.summary.warnings}`);
  console.log(`Info: ${report.summary.info}`);
  console.log(`\nReport saved to: ${reportPath}\n`);
  
  // Print critical issues
  const critical = issues.filter(i => i.type === 'error' || i.type === 'warning');
  if (critical.length > 0) {
    console.log('🚨 Critical Issues:');
    critical.forEach((issue, idx) => {
      console.log(`\n${idx + 1}. [${issue.type.toUpperCase()}] ${issue.category}`);
      console.log(`   ${issue.message}`);
      console.log(`   💡 ${issue.suggestion}`);
      if (issue.file) console.log(`   📁 ${issue.file}`);
    });
  }
}

// Main
function main() {
  console.log('🔍 Starting performance audit...\n');
  
  checkNextConfig();
  checkLargeComponents();
  
  generateReport();
}

main();
