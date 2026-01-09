#!/usr/bin/env tsx
/**
 * PHASE 0: Production URL Inventory
 * 
 * Fetches and parses production sitemap(s) to build a complete URL inventory.
 * Handles:
 * - sitemap-index.xml (if exists)
 * - Multiple sitemap files
 * - URL normalization (trailing slashes, lowercase)
 * - Categorization by type (static/blog/news/listing/neighborhood)
 */

import { parseStringPromise } from 'xml2js';
import * as fs from 'fs/promises';
import * as path from 'path';

const PROD_BASE_URL = 'https://www.karasuemlak.net';
const OUTPUT_DIR = path.join(process.cwd(), 'scripts/parity');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'prod-urls.json');

interface UrlEntry {
  url: string;
  normalized: string;
  lastmod?: string;
  type: 'static' | 'blog' | 'news' | 'listing' | 'neighborhood' | 'property-type' | 'unknown';
  priority?: number;
  changefreq?: string;
}

/**
 * Normalize URL for comparison
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
 * Fetch and parse XML sitemap
 */
async function fetchSitemap(url: string): Promise<any> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ParityAuditor/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xml = await response.text();
    return await parseStringPromise(xml);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

/**
 * Extract URLs from sitemap XML
 */
function extractUrlsFromSitemap(sitemapXml: any): UrlEntry[] {
  const entries: UrlEntry[] = [];
  
  if (sitemapXml.urlset?.url) {
    // Standard sitemap format
    for (const urlEntry of sitemapXml.urlset.url) {
      const loc = urlEntry.loc?.[0] || urlEntry.loc;
      if (!loc) continue;
      
      const normalized = normalizeUrl(loc);
      entries.push({
        url: loc,
        normalized,
        lastmod: urlEntry.lastmod?.[0] || urlEntry.lastmod,
        priority: urlEntry.priority?.[0] ? parseFloat(urlEntry.priority[0]) : undefined,
        changefreq: urlEntry.changefreq?.[0] || urlEntry.changefreq,
        type: categorizeUrl(loc),
      });
    }
  } else if (sitemapXml.sitemapindex?.sitemap) {
    // Sitemap index format
    console.log('Found sitemap index, will fetch individual sitemaps...');
    // Return empty, caller will handle fetching sub-sitemaps
    return [];
  }
  
  return entries;
}

/**
 * Extract sitemap references from sitemap index
 */
function extractSitemapRefs(sitemapIndexXml: any): string[] {
  const refs: string[] = [];
  
  if (sitemapIndexXml.sitemapindex?.sitemap) {
    for (const sitemapEntry of sitemapIndexXml.sitemapindex.sitemap) {
      const loc = sitemapEntry.loc?.[0] || sitemapEntry.loc;
      if (loc) {
        refs.push(loc);
      }
    }
  }
  
  return refs;
}

/**
 * Main scan function
 */
async function scanProduction(): Promise<void> {
  console.log('🔍 PHASE 0: Production URL Inventory');
  console.log('=====================================\n');
  
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  const allUrls = new Map<string, UrlEntry>();
  
  // Try sitemap-index.xml first
  let sitemapIndexUrl = `${PROD_BASE_URL}/sitemap-index.xml`;
  let sitemapUrls: string[] = [];
  
  try {
    const sitemapIndexXml = await fetchSitemap(sitemapIndexUrl);
    const refs = extractSitemapRefs(sitemapIndexXml);
    
    if (refs.length > 0) {
      console.log(`Found sitemap index with ${refs.length} sitemaps`);
      sitemapUrls = refs;
    } else {
      // Not a sitemap index, try as regular sitemap
      const urls = extractUrlsFromSitemap(sitemapIndexXml);
      urls.forEach(entry => allUrls.set(entry.normalized, entry));
      console.log(`Found ${urls.length} URLs in main sitemap`);
    }
  } catch (error) {
    console.log('sitemap-index.xml not found, trying /sitemap.xml...');
    sitemapIndexUrl = `${PROD_BASE_URL}/sitemap.xml`;
    
    try {
      const sitemapXml = await fetchSitemap(sitemapIndexUrl);
      const urls = extractUrlsFromSitemap(sitemapXml);
      urls.forEach(entry => allUrls.set(entry.normalized, entry));
      console.log(`Found ${urls.length} URLs in sitemap.xml`);
    } catch (error2) {
      console.error('Failed to fetch sitemap:', error2);
      throw error2;
    }
  }
  
  // Fetch all sub-sitemaps if we found a sitemap index
  if (sitemapUrls.length > 0) {
    console.log(`\nFetching ${sitemapUrls.length} sub-sitemaps...`);
    
    for (const sitemapUrl of sitemapUrls) {
      try {
        const sitemapXml = await fetchSitemap(sitemapUrl);
        const urls = extractUrlsFromSitemap(sitemapXml);
        
        urls.forEach(entry => {
          // Keep the entry with the most recent lastmod if duplicate
          const existing = allUrls.get(entry.normalized);
          if (!existing || (entry.lastmod && (!existing.lastmod || entry.lastmod > existing.lastmod))) {
            allUrls.set(entry.normalized, entry);
          }
        });
        
        console.log(`  ✓ ${sitemapUrl}: ${urls.length} URLs`);
      } catch (error) {
        console.error(`  ✗ Failed to fetch ${sitemapUrl}:`, error);
      }
    }
  }
  
  // Convert to array and sort
  const urlArray = Array.from(allUrls.values()).sort((a, b) => 
    a.normalized.localeCompare(b.normalized)
  );
  
  // Statistics
  const stats = {
    total: urlArray.length,
    byType: {} as Record<string, number>,
  };
  
  urlArray.forEach(entry => {
    stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
  });
  
  console.log('\n📊 Production URL Inventory:');
  console.log(`   Total URLs: ${stats.total}`);
  console.log('   By type:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`     ${type}: ${count}`);
  });
  
  // Save to file
  const output = {
    scannedAt: new Date().toISOString(),
    baseUrl: PROD_BASE_URL,
    stats,
    urls: urlArray,
  };
  
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Saved to: ${OUTPUT_FILE}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scanProduction().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { scanProduction, normalizeUrl, categorizeUrl };
