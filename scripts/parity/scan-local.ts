#!/usr/bin/env tsx
/**
 * PHASE 1: Local URL Inventory
 * 
 * Scans local sitemap and route files to build URL inventory.
 * Handles:
 * - Local sitemap.xml (if server is running)
 * - Route file scanning (app router structure)
 * - Dynamic route patterns (not instances, but patterns)
 */

import { parseStringPromise } from 'xml2js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

const LOCAL_BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'scripts/parity');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'local-urls.json');
const APP_DIR = path.join(process.cwd(), 'apps/web/app');

interface UrlEntry {
  url: string;
  normalized: string;
  type: 'static' | 'blog' | 'news' | 'listing' | 'neighborhood' | 'property-type' | 'unknown';
  source: 'sitemap' | 'route-file' | 'dynamic-pattern';
  pattern?: string; // For dynamic routes
}

/**
 * Normalize URL for comparison (same as scan-prod.ts)
 */
function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // Remove protocol and domain for comparison
  normalized = normalized.replace(/^https?:\/\/[^\/]+/, '');
  
  // Remove trailing slash (except root)
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  // Lowercase
  normalized = normalized.toLowerCase();
  
  // Remove query params and fragments
  normalized = normalized.split('?')[0].split('#')[0];
  
  return normalized;
}

/**
 * Categorize URL by path pattern
 */
function categorizeUrl(url: string): UrlEntry['type'] {
  const normalized = normalizeUrl(url);
  
  if (normalized.startsWith('/blog/')) {
    return 'blog';
  }
  if (normalized.startsWith('/haberler/')) {
    return 'news';
  }
  if (normalized.startsWith('/ilan/')) {
    return 'listing';
  }
  if (normalized.startsWith('/mahalle/')) {
    return 'neighborhood';
  }
  if (normalized.startsWith('/tip/')) {
    return 'property-type';
  }
  
  return 'static';
}

/**
 * Fetch local sitemap (if server is running)
 */
async function fetchLocalSitemap(): Promise<UrlEntry[]> {
  const entries: UrlEntry[] = [];
  
  try {
    console.log(`Fetching local sitemap: ${LOCAL_BASE_URL}/sitemap.xml`);
    const response = await fetch(`${LOCAL_BASE_URL}/sitemap.xml`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ParityAuditor/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xml = await response.text();
    const parsed = await parseStringPromise(xml);
    
    if (parsed.urlset?.url) {
      for (const urlEntry of parsed.urlset.url) {
        const loc = urlEntry.loc?.[0] || urlEntry.loc;
        if (!loc) continue;
        
        const normalized = normalizeUrl(loc);
        entries.push({
          url: loc,
          normalized,
          type: categorizeUrl(loc),
          source: 'sitemap',
        });
      }
    }
    
    console.log(`  ✓ Found ${entries.length} URLs from local sitemap`);
  } catch (error) {
    console.log(`  ⚠ Local sitemap not available (server may not be running): ${error}`);
    console.log(`    Will scan route files instead...`);
  }
  
  return entries;
}

/**
 * Scan route files to discover static routes
 */
async function scanRouteFiles(): Promise<UrlEntry[]> {
  const entries: UrlEntry[] = [];
  
  if (!await fs.access(APP_DIR).then(() => true).catch(() => false)) {
    console.log(`  ⚠ App directory not found: ${APP_DIR}`);
    return entries;
  }
  
  console.log(`\nScanning route files in: ${APP_DIR}`);
  
  // Find all page.tsx files
  const pageFiles = await glob('**/page.tsx', {
    cwd: APP_DIR,
    absolute: false,
  });
  
  console.log(`  Found ${pageFiles.length} page files`);
  
  for (const pageFile of pageFiles) {
    const routePath = path.dirname(pageFile);
    const relativePath = path.relative(APP_DIR, routePath);
    
    // Convert file path to URL path
    let urlPath = '/' + relativePath.replace(/\\/g, '/');
    
    // Handle locale routes: [locale]/...
    if (urlPath.startsWith('/[locale]/')) {
      urlPath = urlPath.replace('/[locale]', '');
    }
    
    // Handle dynamic segments: [slug] -> pattern
    const hasDynamic = urlPath.includes('[');
    if (hasDynamic) {
      // This is a dynamic route pattern
      const pattern = urlPath.replace(/\[([^\]]+)\]/g, ':$1');
      entries.push({
        url: urlPath,
        normalized: urlPath, // Keep pattern for matching
        type: categorizeUrl(urlPath),
        source: 'dynamic-pattern',
        pattern,
      });
    } else {
      // Static route
      const normalized = normalizeUrl(urlPath);
      entries.push({
        url: urlPath === '/' ? LOCAL_BASE_URL : `${LOCAL_BASE_URL}${urlPath}`,
        normalized,
        type: categorizeUrl(urlPath),
        source: 'route-file',
      });
    }
  }
  
  console.log(`  ✓ Found ${entries.length} routes from files`);
  
  return entries;
}

/**
 * Read sitemap.ts to extract static routes
 */
async function extractStaticRoutesFromSitemapCode(): Promise<UrlEntry[]> {
  const entries: UrlEntry[] = [];
  
  const sitemapFile = path.join(APP_DIR, 'sitemap.ts');
  
  try {
    const content = await fs.readFile(sitemapFile, 'utf-8');
    
    // Extract static routes array
    const staticRoutesMatch = content.match(/const staticRoutes = \[([\s\S]*?)\];/);
    if (staticRoutesMatch) {
      const routesContent = staticRoutesMatch[1];
      const routeMatches = routesContent.matchAll(/['"`]([^'"`]+)['"`]/g);
      
      for (const match of routeMatches) {
        const route = match[1].trim();
        if (route) {
          const normalized = normalizeUrl(route);
          entries.push({
            url: route === '' ? LOCAL_BASE_URL : `${LOCAL_BASE_URL}${route}`,
            normalized,
            type: categorizeUrl(route),
            source: 'route-file',
          });
        }
      }
    }
    
    console.log(`  ✓ Extracted ${entries.length} static routes from sitemap.ts`);
  } catch (error) {
    console.log(`  ⚠ Could not read sitemap.ts: ${error}`);
  }
  
  return entries;
}

/**
 * Main scan function
 */
async function scanLocal(): Promise<void> {
  console.log('🔍 PHASE 1: Local URL Inventory');
  console.log('=================================\n');
  
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  const allUrls = new Map<string, UrlEntry>();
  
  // Method 1: Fetch local sitemap (if server running)
  const sitemapUrls = await fetchLocalSitemap();
  sitemapUrls.forEach(entry => {
    allUrls.set(entry.normalized, entry);
  });
  
  // Method 2: Extract from sitemap.ts code
  const staticRoutes = await extractStaticRoutesFromSitemapCode();
  staticRoutes.forEach(entry => {
    // Don't overwrite sitemap entries
    if (!allUrls.has(entry.normalized)) {
      allUrls.set(entry.normalized, entry);
    }
  });
  
  // Method 3: Scan route files
  const routeFiles = await scanRouteFiles();
  routeFiles.forEach(entry => {
    // Don't overwrite existing entries
    if (!allUrls.has(entry.normalized)) {
      allUrls.set(entry.normalized, entry);
    }
  });
  
  // Convert to array and sort
  const urlArray = Array.from(allUrls.values()).sort((a, b) => 
    a.normalized.localeCompare(b.normalized)
  );
  
  // Statistics
  const stats = {
    total: urlArray.length,
    byType: {} as Record<string, number>,
    bySource: {} as Record<string, number>,
  };
  
  urlArray.forEach(entry => {
    stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
    stats.bySource[entry.source] = (stats.bySource[entry.source] || 0) + 1;
  });
  
  console.log('\n📊 Local URL Inventory:');
  console.log(`   Total URLs: ${stats.total}`);
  console.log('   By type:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`     ${type}: ${count}`);
  });
  console.log('   By source:');
  Object.entries(stats.bySource).forEach(([source, count]) => {
    console.log(`     ${source}: ${count}`);
  });
  
  // Save to file
  const output = {
    scannedAt: new Date().toISOString(),
    baseUrl: LOCAL_BASE_URL,
    stats,
    urls: urlArray,
  };
  
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Saved to: ${OUTPUT_FILE}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scanLocal().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { scanLocal, normalizeUrl, categorizeUrl };
