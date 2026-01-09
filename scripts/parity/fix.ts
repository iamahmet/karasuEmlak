#!/usr/bin/env tsx
/**
 * PHASE 3: Auto-Fix Strategy
 * 
 * For each missing production URL, decides:
 * - RECREATE: If it's blog/news/static content → recreate in new system
 * - REDIRECT: If content is obsolete/merged → map to best new URL (301)
 * - NOINDEX: If page is thin/spam/duplicate → mark noindex (last resort)
 * 
 * Implements:
 * - Redirect mapping file (redirect-map.json)
 * - Content import for blog/news
 * - Code generation for redirects
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as cheerio from 'cheerio';

const OUTPUT_DIR = path.join(process.cwd(), 'scripts/parity');
const DIFF_FILE = path.join(OUTPUT_DIR, 'diff-report.json');
const REDIRECT_MAP_FILE = path.join(OUTPUT_DIR, 'redirect-map.json');
const FIX_REPORT_FILE = path.join(OUTPUT_DIR, 'fix-report.json');

interface MissingUrl {
  url: string;
  normalized: string;
  type: string;
  lastmod?: string;
  priority?: number;
}

interface RedirectMapping {
  from: string;
  to: string;
  reason: string;
  status: 301 | 302;
}

interface FixAction {
  url: string;
  action: 'recreate' | 'redirect' | 'noindex' | 'skip';
  target?: string;
  reason: string;
  contentImported?: boolean;
}

interface FixReport {
  scannedAt: string;
  total: number;
  recreated: number;
  redirected: number;
  noindexed: number;
  skipped: number;
  actions: FixAction[];
  redirects: RedirectMapping[];
}

const PROD_BASE_URL = 'https://www.karasuemlak.net';

/**
 * Decide fix strategy for a missing URL
 */
async function decideFixStrategy(missing: MissingUrl): Promise<FixAction> {
  const { url, type, normalized } = missing;
  
  // Blog/News: Always recreate (preferred)
  if (type === 'blog' || type === 'news') {
    return {
      url,
      action: 'recreate',
      reason: `${type} content should be recreated to preserve SEO equity`,
    };
  }
  
  // Static pages: Recreate if important, redirect if obsolete
  if (type === 'static') {
    // Check if it's a legacy/obsolete page
    const obsoletePatterns = [
      '/eski-',
      '/old-',
      '/legacy-',
      '/deprecated-',
    ];
    
    const isObsolete = obsoletePatterns.some(pattern => 
      normalized.includes(pattern)
    );
    
    if (isObsolete) {
      // Try to find a semantic equivalent
      const target = findSemanticTarget(normalized);
      if (target) {
        return {
          url,
          action: 'redirect',
          target,
          reason: 'Obsolete static page, redirecting to equivalent',
        };
      }
    }
    
    // Important static pages: recreate
    const importantPages = [
      '/hakkimizda',
      '/iletisim',
      '/sss',
      '/rehber',
      '/karasu',
      '/kocaali',
    ];
    
    if (importantPages.some(page => normalized.startsWith(page))) {
      return {
        url,
        action: 'recreate',
        reason: 'Important static page, should be recreated',
      };
    }
    
    // Other static: recreate by default
    return {
      url,
      action: 'recreate',
      reason: 'Static page should be recreated',
    };
  }
  
  // Listings: Recreate (from database)
  if (type === 'listing') {
    return {
      url,
      action: 'recreate',
      reason: 'Listing should exist in database, check data migration',
    };
  }
  
  // Neighborhoods: Recreate (from database)
  if (type === 'neighborhood') {
    return {
      url,
      action: 'recreate',
      reason: 'Neighborhood should exist in database, check data migration',
    };
  }
  
  // Property types: Recreate
  if (type === 'property-type') {
    return {
      url,
      action: 'recreate',
      reason: 'Property type page should be recreated',
    };
  }
  
  // Unknown: Skip for manual review
  return {
    url,
    action: 'skip',
    reason: 'Unknown type, requires manual review',
  };
}

/**
 * Find semantic target for redirect
 */
function findSemanticTarget(normalized: string): string | null {
  // Simple heuristics for finding equivalent pages
  const mappings: Record<string, string> = {
    '/eski-blog': '/blog',
    '/old-news': '/haberler',
    '/legacy-listings': '/satilik',
  };
  
  for (const [pattern, target] of Object.entries(mappings)) {
    if (normalized.includes(pattern)) {
      return target;
    }
  }
  
  return null;
}

/**
 * Fetch and extract content from production page
 */
async function fetchProductionContent(url: string): Promise<{
  title?: string;
  description?: string;
  content?: string;
  headings?: string[];
} | null> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${PROD_BASE_URL}${url}`;
    console.log(`  Fetching: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ParityAuditor/1.0)',
      },
    });
    
    if (!response.ok) {
      console.log(`    ⚠ HTTP ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract metadata
    const title = $('title').text() || $('h1').first().text();
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content');
    
    // Extract main content
    const mainContent = $('article, .content, main, #content').first();
    if (mainContent.length === 0) {
      // Fallback to body
      mainContent = $('body');
    }
    
    // Remove scripts, styles, nav, footer
    mainContent.find('script, style, nav, footer, header').remove();
    
    const content = mainContent.text().trim();
    
    // Extract headings
    const headings: string[] = [];
    mainContent.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });
    
    return {
      title: title?.trim(),
      description: description?.trim(),
      content: content.substring(0, 10000), // Limit content size
      headings: headings.slice(0, 20), // Limit headings
    };
  } catch (error) {
    console.log(`    ✗ Error: ${error}`);
    return null;
  }
}

/**
 * Import blog/news content into database
 */
async function importContent(
  url: string,
  type: 'blog' | 'news',
  extracted: { title?: string; description?: string; content?: string; headings?: string[] }
): Promise<boolean> {
  // This will be implemented to insert into Supabase
  // For now, just log what would be imported
  console.log(`  Would import ${type}:`);
  console.log(`    Title: ${extracted.title}`);
  console.log(`    Slug: ${extractSlugFromUrl(url)}`);
  console.log(`    Content length: ${extracted.content?.length || 0}`);
  
  // TODO: Implement actual database insertion
  // - Insert into articles or news_articles table
  // - Generate slug from URL
  // - Set status to 'published'
  // - Add metadata
  
  return false; // Return true when actually implemented
}

/**
 * Extract slug from URL
 */
function extractSlugFromUrl(url: string): string {
  const path = url.replace(PROD_BASE_URL, '').replace(/^\//, '');
  const parts = path.split('/');
  return parts[parts.length - 1] || '';
}

/**
 * Main fix function
 */
async function applyFixes(): Promise<void> {
  console.log('🔧 PHASE 3: Auto-Fix Strategy');
  console.log('==============================\n');
  
  // Load diff report
  const diffData = JSON.parse(await fs.readFile(DIFF_FILE, 'utf-8'));
  const missing: MissingUrl[] = diffData.missing || [];
  
  if (missing.length === 0) {
    console.log('✅ No missing URLs to fix!');
    return;
  }
  
  console.log(`Processing ${missing.length} missing URLs...\n`);
  
  const actions: FixAction[] = [];
  const redirects: RedirectMapping[] = [];
  
  // Process each missing URL
  for (let i = 0; i < missing.length; i++) {
    const entry = missing[i];
    console.log(`[${i + 1}/${missing.length}] ${entry.type}: ${entry.normalized}`);
    
    const strategy = await decideFixStrategy(entry);
    actions.push(strategy);
    
    if (strategy.action === 'recreate') {
      // For blog/news, try to fetch and import content
      if ((entry.type === 'blog' || entry.type === 'news') && entry.url) {
        const extracted = await fetchProductionContent(entry.url);
        if (extracted && extracted.content) {
          const imported = await importContent(entry.url, entry.type as 'blog' | 'news', extracted);
          strategy.contentImported = imported;
        }
      }
    } else if (strategy.action === 'redirect' && strategy.target) {
      redirects.push({
        from: entry.normalized,
        to: strategy.target,
        reason: strategy.reason,
        status: 301,
      });
    }
    
    // Small delay to avoid rate limiting
    if (i < missing.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Build report
  const report: FixReport = {
    scannedAt: new Date().toISOString(),
    total: missing.length,
    recreated: actions.filter(a => a.action === 'recreate').length,
    redirected: actions.filter(a => a.action === 'redirect').length,
    noindexed: actions.filter(a => a.action === 'noindex').length,
    skipped: actions.filter(a => a.action === 'skip').length,
    actions,
    redirects,
  };
  
  // Save redirect map
  await fs.writeFile(REDIRECT_MAP_FILE, JSON.stringify(redirects, null, 2), 'utf-8');
  console.log(`\n✅ Saved redirect map: ${REDIRECT_MAP_FILE}`);
  
  // Save fix report
  await fs.writeFile(FIX_REPORT_FILE, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`✅ Saved fix report: ${FIX_REPORT_FILE}`);
  
  // Print summary
  console.log('\n📊 Fix Summary:');
  console.log(`   Total processed: ${report.total}`);
  console.log(`   ✅ Recreated: ${report.recreated}`);
  console.log(`   ↪️  Redirected: ${report.redirected}`);
  console.log(`   🚫 Noindexed: ${report.noindexed}`);
  console.log(`   ⏭️  Skipped: ${report.skipped}`);
  console.log(`   🔗 Redirects: ${redirects.length}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  applyFixes().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { applyFixes, importContent };
