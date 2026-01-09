#!/usr/bin/env tsx
/**
 * PHASE 2: Diff Engine
 * 
 * Compares production and local URL inventories to identify:
 * - Missing URLs (in prod but not in local)
 * - Extra URLs (in local but not in prod) - fine, but logged
 * - Changed URLs (slug differences)
 * 
 * Outputs:
 * - diff-report.json (machine-readable)
 * - diff-report.md (human-readable)
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'scripts/parity');
const PROD_FILE = path.join(OUTPUT_DIR, 'prod-urls.json');
const LOCAL_FILE = path.join(OUTPUT_DIR, 'local-urls.json');
const DIFF_JSON = path.join(OUTPUT_DIR, 'diff-report.json');
const DIFF_MD = path.join(OUTPUT_DIR, 'diff-report.md');

interface UrlEntry {
  url: string;
  normalized: string;
  type: string;
  lastmod?: string;
  source?: string;
  pattern?: string;
}

interface DiffReport {
  scannedAt: string;
  summary: {
    prodTotal: number;
    localTotal: number;
    missing: number;
    extra: number;
    changed: number;
  };
  missing: Array<{
    url: string;
    normalized: string;
    type: string;
    lastmod?: string;
    priority?: number;
  }>;
  extra: Array<{
    url: string;
    normalized: string;
    type: string;
    source?: string;
  }>;
  changed: Array<{
    prodUrl: string;
    localUrl?: string;
    reason: string;
  }>;
  byType: Record<string, {
    missing: number;
    extra: number;
  }>;
}

/**
 * Normalize URL (same as other scripts)
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  normalized = normalized.replace(/^https?:\/\/[^\/]+/, '');
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  normalized = normalized.toLowerCase();
  normalized = normalized.split('?')[0].split('#')[0];
  return normalized;
}

/**
 * Check if a dynamic pattern matches a URL
 */
function matchesPattern(pattern: string, url: string): boolean {
  // Convert pattern like /blog/:slug to regex
  const regexPattern = pattern
    .replace(/:[^/]+/g, '[^/]+')
    .replace(/\//g, '\\/');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(normalizeUrl(url));
}

/**
 * Main diff function
 */
async function computeDiff(): Promise<void> {
  console.log('🔍 PHASE 2: Diff Engine');
  console.log('========================\n');
  
  // Load inventories
  console.log('Loading inventories...');
  const prodData = JSON.parse(await fs.readFile(PROD_FILE, 'utf-8'));
  const localData = JSON.parse(await fs.readFile(LOCAL_FILE, 'utf-8'));
  
  const prodUrls = new Map<string, UrlEntry>();
  const localUrls = new Map<string, UrlEntry>();
  const localPatterns: Array<{ pattern: string; type: string }> = [];
  
  // Index production URLs
  prodData.urls.forEach((entry: UrlEntry) => {
    prodUrls.set(entry.normalized, entry);
  });
  
  // Index local URLs and patterns
  localData.urls.forEach((entry: UrlEntry) => {
    if (entry.pattern) {
      localPatterns.push({ pattern: entry.pattern, type: entry.type });
    } else {
      localUrls.set(entry.normalized, entry);
    }
  });
  
  console.log(`  Production: ${prodUrls.size} URLs`);
  console.log(`  Local: ${localUrls.size} URLs + ${localPatterns.length} patterns`);
  
  // Find missing URLs
  const missing: DiffReport['missing'] = [];
  const byType: Record<string, { missing: number; extra: number }> = {};
  
  for (const [normalized, prodEntry] of prodUrls.entries()) {
    const localEntry = localUrls.get(normalized);
    
    // Check if it matches a dynamic pattern
    let matches = false;
    for (const { pattern, type } of localPatterns) {
      if (matchesPattern(pattern, prodEntry.url)) {
        matches = true;
        break;
      }
    }
    
    if (!localEntry && !matches) {
      missing.push({
        url: prodEntry.url,
        normalized: prodEntry.normalized,
        type: prodEntry.type,
        lastmod: prodEntry.lastmod,
        priority: (prodEntry as any).priority,
      });
      
      if (!byType[prodEntry.type]) {
        byType[prodEntry.type] = { missing: 0, extra: 0 };
      }
      byType[prodEntry.type].missing++;
    }
  }
  
  // Find extra URLs (in local but not in prod)
  const extra: DiffReport['extra'] = [];
  
  for (const [normalized, localEntry] of localUrls.entries()) {
    if (!prodUrls.has(normalized)) {
      extra.push({
        url: localEntry.url,
        normalized: localEntry.normalized,
        type: localEntry.type,
        source: localEntry.source,
      });
      
      if (!byType[localEntry.type]) {
        byType[localEntry.type] = { missing: 0, extra: 0 };
      }
      byType[localEntry.type].extra++;
    }
  }
  
  // Find changed URLs (slug differences)
  const changed: DiffReport['changed'] = [];
  
  // Group by type and check for slug mismatches
  const prodByType = new Map<string, UrlEntry[]>();
  const localByType = new Map<string, UrlEntry[]>();
  
  prodUrls.forEach(entry => {
    if (!prodByType.has(entry.type)) {
      prodByType.set(entry.type, []);
    }
    prodByType.get(entry.type)!.push(entry);
  });
  
  localUrls.forEach(entry => {
    if (!localByType.has(entry.type)) {
      localByType.set(entry.type, []);
    }
    localByType.get(entry.type)!.push(entry);
  });
  
  // Check for blog/news slug mismatches
  ['blog', 'news'].forEach(type => {
    const prodEntries = prodByType.get(type) || [];
    const localEntries = localByType.get(type) || [];
    
    // Simple heuristic: if counts differ significantly, flag it
    if (prodEntries.length > 0 && localEntries.length === 0) {
      changed.push({
        prodUrl: `${prodEntries.length} ${type} URLs`,
        reason: `No local ${type} URLs found, but ${prodEntries.length} in production`,
      });
    }
  });
  
  // Build report
  const report: DiffReport = {
    scannedAt: new Date().toISOString(),
    summary: {
      prodTotal: prodUrls.size,
      localTotal: localUrls.size,
      missing: missing.length,
      extra: extra.length,
      changed: changed.length,
    },
    missing: missing.sort((a, b) => {
      // Sort by priority (higher first), then by type
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      if (priorityA !== priorityB) return priorityB - priorityA;
      return a.type.localeCompare(b.type);
    }),
    extra,
    changed,
    byType,
  };
  
  // Save JSON report
  await fs.writeFile(DIFF_JSON, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\n✅ Saved JSON report: ${DIFF_JSON}`);
  
  // Generate markdown report
  const mdReport = generateMarkdownReport(report);
  await fs.writeFile(DIFF_MD, mdReport, 'utf-8');
  console.log(`✅ Saved markdown report: ${DIFF_MD}`);
  
  // Print summary
  console.log('\n📊 Diff Summary:');
  console.log(`   Production URLs: ${report.summary.prodTotal}`);
  console.log(`   Local URLs: ${report.summary.localTotal}`);
  console.log(`   ⚠️  Missing: ${report.summary.missing}`);
  console.log(`   ℹ️  Extra: ${report.summary.extra}`);
  console.log(`   ⚠️  Changed: ${report.summary.changed}`);
  
  if (report.summary.missing > 0) {
    console.log('\n   Missing by type:');
    Object.entries(report.byType).forEach(([type, counts]) => {
      if (counts.missing > 0) {
        console.log(`     ${type}: ${counts.missing}`);
      }
    });
  }
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report: DiffReport): string {
  let md = `# URL Parity Diff Report\n\n`;
  md += `**Generated:** ${new Date(report.scannedAt).toLocaleString()}\n\n`;
  
  md += `## Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Production URLs | ${report.summary.prodTotal} |\n`;
  md += `| Local URLs | ${report.summary.localTotal} |\n`;
  md += `| ⚠️ Missing URLs | **${report.summary.missing}** |\n`;
  md += `| ℹ️ Extra URLs | ${report.summary.extra} |\n`;
  md += `| ⚠️ Changed URLs | ${report.summary.changed} |\n\n`;
  
  if (report.summary.missing > 0) {
    md += `## Missing URLs (${report.summary.missing})\n\n`;
    md += `These URLs exist in production but are missing in the local version.\n\n`;
    
    // Group by type
    const byType = new Map<string, typeof report.missing>();
    report.missing.forEach(entry => {
      if (!byType.has(entry.type)) {
        byType.set(entry.type, []);
      }
      byType.get(entry.type)!.push(entry);
    });
    
    for (const [type, entries] of byType.entries()) {
      md += `### ${type.toUpperCase()} (${entries.length})\n\n`;
      md += `| URL | Priority | Last Modified |\n`;
      md += `|-----|----------|---------------|\n`;
      
      entries.slice(0, 50).forEach(entry => {
        const url = entry.url.replace('https://www.karasuemlak.net', '');
        const priority = entry.priority?.toFixed(1) || '-';
        const lastmod = entry.lastmod ? new Date(entry.lastmod).toLocaleDateString() : '-';
        md += `| \`${url}\` | ${priority} | ${lastmod} |\n`;
      });
      
      if (entries.length > 50) {
        md += `\n*... and ${entries.length - 50} more*\n`;
      }
      
      md += `\n`;
    }
  }
  
  if (report.summary.extra > 0) {
    md += `## Extra URLs (${report.summary.extra})\n\n`;
    md += `These URLs exist in local but not in production (new pages).\n\n`;
    md += `| URL | Type | Source |\n`;
    md += `|-----|------|--------|\n`;
    
    report.extra.slice(0, 20).forEach(entry => {
      const url = entry.url.replace('http://localhost:3000', '');
      md += `| \`${url}\` | ${entry.type} | ${entry.source || '-'} |\n`;
    });
    
    if (report.extra.length > 20) {
      md += `\n*... and ${report.extra.length - 20} more*\n`;
    }
    
    md += `\n`;
  }
  
  if (report.summary.changed > 0) {
    md += `## Changed URLs\n\n`;
    md += `| Production URL | Reason |\n`;
    md += `|----------------|--------|\n`;
    
    report.changed.forEach(entry => {
      md += `| ${entry.prodUrl} | ${entry.reason} |\n`;
    });
    
    md += `\n`;
  }
  
  md += `---\n\n`;
  md += `*Next step: Run \`npm run parity:fix\` to auto-fix missing URLs*\n`;
  
  return md;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  computeDiff().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { computeDiff };
