#!/usr/bin/env tsx
/**
 * PHASE 1: Automated Visual & DOM Snapshots
 * 
 * Uses Playwright to capture screenshots and extract DOM metrics
 * from both production and local versions
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import { UI_PARITY_CHECKLIST, getAllRoutes } from './ui-checklist';

const PROD_BASE = 'https://www.karasuemlak.net';
const LOCAL_BASE = 'http://localhost:3000';
const OUTPUT_DIR = path.join(process.cwd(), 'scripts/parity');
const ARTIFACTS_DIR = path.join(OUTPUT_DIR, 'parity-artifacts');
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, 'screenshots');

interface DOMMetrics {
  hero: boolean;
  cta: boolean;
  listingGrid: boolean;
  filters: boolean;
  h1: { present: boolean; text?: string };
  breadcrumbs: boolean;
  priceBlock: boolean;
  photoGallery: boolean;
  trustSignals: number;
  conversionWidgets: number;
}

interface PageSnapshot {
  route: string;
  name: string;
  prod: {
    url: string;
    screenshot: string;
    metrics: DOMMetrics;
    status: number;
    error?: string;
  };
  local: {
    url: string;
    screenshot: string;
    metrics: DOMMetrics;
    status: number;
    error?: string;
  };
  comparison: {
    missingLocally: boolean;
    regressions: string[];
    improvements: string[];
  };
}

/**
 * Extract DOM metrics from a page
 */
async function extractMetrics(page: Page): Promise<DOMMetrics> {
  return await page.evaluate(() => {
    const metrics: DOMMetrics = {
      hero: false,
      cta: false,
      listingGrid: false,
      filters: false,
      h1: { present: false },
      breadcrumbs: false,
      priceBlock: false,
      photoGallery: false,
      trustSignals: 0,
      conversionWidgets: 0,
    };

    // Check for hero section
    const hero = document.querySelector('section.hero, .hero, [class*="hero"], header + section');
    metrics.hero = !!hero;

    // Check for CTA buttons
    const cta = document.querySelector('button[class*="cta"], a[class*="cta"], .cta-button, [href*="whatsapp"], [href*="tel:"]');
    metrics.cta = !!cta;

    // Check for listing grid
    const grid = document.querySelector('[class*="grid"], [class*="listing"], .listings-grid, [class*="property"]');
    metrics.listingGrid = !!grid;

    // Check for filters
    const filterEl = document.querySelector('[class*="filter"], [class*="Filter"], form[class*="search"], .filters');
    metrics.filters = !!filterEl;

    // Check for H1
    const h1 = document.querySelector('h1');
    if (h1) {
      metrics.h1 = { present: true, text: h1.textContent?.trim() || '' };
    }

    // Check for breadcrumbs
    const breadcrumbs = document.querySelector('[class*="breadcrumb"], nav[aria-label*="breadcrumb"], .breadcrumbs');
    metrics.breadcrumbs = !!breadcrumbs;

    // Check for price block
    const price = document.querySelector('[class*="price"], [class*="Price"], .price-block, [data-price]');
    metrics.priceBlock = !!price;

    // Check for photo gallery
    const gallery = document.querySelector('[class*="gallery"], [class*="Gallery"], .image-gallery, [class*="carousel"]');
    metrics.photoGallery = !!gallery;

    // Count trust signals (phone, email, address, badges)
    const trustElements = document.querySelectorAll(
      '[href*="tel:"], [href*="mailto:"], [class*="address"], [class*="badge"], [class*="certification"], [class*="trust"]'
    );
    metrics.trustSignals = trustElements.length;

    // Count conversion widgets (WhatsApp, call, forms)
    const conversionElements = document.querySelectorAll(
      '[href*="whatsapp"], [href*="tel:"], [class*="contact-form"], [class*="inquiry"], button[class*="contact"]'
    );
    metrics.conversionWidgets = conversionElements.length;

    return metrics;
  });
}

/**
 * Take snapshot of a single route
 */
async function snapshotRoute(
  browser: Browser,
  route: string,
  baseUrl: string,
  name: string
): Promise<{ metrics: DOMMetrics; screenshot: string; status: number; error?: string }> {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });

  try {
    const url = route.startsWith('/') ? `${baseUrl}${route}` : route;
    console.log(`  Fetching: ${url}`);

    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    const status = response?.status() || 0;

    if (status >= 400) {
      return {
        metrics: {
          hero: false,
          cta: false,
          listingGrid: false,
          filters: false,
          h1: { present: false },
          breadcrumbs: false,
          priceBlock: false,
          photoGallery: false,
          trustSignals: 0,
          conversionWidgets: 0,
        },
        screenshot: '',
        status,
        error: `HTTP ${status}`,
      };
    }

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Extract metrics
    const metrics = await extractMetrics(page);

    // Take screenshot
    const screenshotPath = path.join(
      SCREENSHOTS_DIR,
      `${name}-${route.replace(/\//g, '_').replace(/\[|\]/g, '')}-${baseUrl.includes('localhost') ? 'local' : 'prod'}.png`
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    await page.close();

    return {
      metrics,
      screenshot: screenshotPath,
      status,
    };
  } catch (error) {
    await page.close();
    return {
      metrics: {
        hero: false,
        cta: false,
        listingGrid: false,
        filters: false,
        h1: { present: false },
        breadcrumbs: false,
        priceBlock: false,
        photoGallery: false,
        trustSignals: 0,
        conversionWidgets: 0,
      },
      screenshot: '',
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Compare metrics and identify regressions
 */
function compareMetrics(
  prod: DOMMetrics,
  local: DOMMetrics,
  checklist: any
): { regressions: string[]; improvements: string[] } {
  const regressions: string[] = [];
  const improvements: string[] = [];

  // Hero section
  if (prod.hero && !local.hero) {
    regressions.push('Hero section missing');
  } else if (!prod.hero && local.hero) {
    improvements.push('Hero section added');
  }

  // CTA
  if (prod.cta && !local.cta) {
    regressions.push('CTA buttons missing');
  } else if (local.conversionWidgets > prod.conversionWidgets) {
    improvements.push('More conversion widgets');
  }

  // Listing grid
  if (prod.listingGrid && !local.listingGrid && checklist.categories.listingCard.length > 0) {
    regressions.push('Listing grid missing');
  }

  // Filters
  if (prod.filters && !local.filters && checklist.categories.filters.length > 0) {
    regressions.push('Filters missing');
  }

  // H1
  if (prod.h1.present && !local.h1.present) {
    regressions.push('H1 heading missing');
  } else if (local.h1.present && !prod.h1.present) {
    improvements.push('H1 heading added');
  }

  // Breadcrumbs
  if (prod.breadcrumbs && !local.breadcrumbs) {
    regressions.push('Breadcrumbs missing');
  }

  // Trust signals
  if (local.trustSignals < prod.trustSignals) {
    regressions.push(`Fewer trust signals (${local.trustSignals} vs ${prod.trustSignals})`);
  } else if (local.trustSignals > prod.trustSignals) {
    improvements.push(`More trust signals (${local.trustSignals} vs ${prod.trustSignals})`);
  }

  // Conversion widgets
  if (local.conversionWidgets < prod.conversionWidgets) {
    regressions.push(`Fewer conversion widgets (${local.conversionWidgets} vs ${prod.conversionWidgets})`);
  } else if (local.conversionWidgets > prod.conversionWidgets) {
    improvements.push(`More conversion widgets (${local.conversionWidgets} vs ${prod.conversionWidgets})`);
  }

  return { regressions, improvements };
}

/**
 * Main snapshot function
 */
async function captureSnapshots(): Promise<void> {
  console.log('📸 PHASE 1: UI/UX Visual Snapshots');
  console.log('===================================\n');

  // Ensure directories exist
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });

  const routes = getAllRoutes();
  const snapshots: PageSnapshot[] = [];

  console.log(`Capturing snapshots for ${routes.length} routes...\n`);

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const checklist = UI_PARITY_CHECKLIST.find(c => c.route === route);
    const name = checklist?.name || route;

    console.log(`[${i + 1}/${routes.length}] ${name} (${route})`);

    // Skip dynamic routes for now (need actual slugs)
    if (route.includes('[') || route.includes(']')) {
      console.log('  ⏭️  Skipping dynamic route (needs actual slug)');
      continue;
    }

    // Snapshot production
    console.log('  📸 Production...');
    const prodSnapshot = await snapshotRoute(browser, route, PROD_BASE, name);

    // Snapshot local
    console.log('  📸 Local...');
    const localSnapshot = await snapshotRoute(browser, route, LOCAL_BASE, name);

    // Compare
    const comparison = compareMetrics(prodSnapshot.metrics, localSnapshot.metrics, checklist || {});

    const snapshot: PageSnapshot = {
      route,
      name,
      prod: {
        url: `${PROD_BASE}${route}`,
        screenshot: prodSnapshot.screenshot,
        metrics: prodSnapshot.metrics,
        status: prodSnapshot.status,
        error: prodSnapshot.error,
      },
      local: {
        url: `${LOCAL_BASE}${route}`,
        screenshot: localSnapshot.screenshot,
        metrics: localSnapshot.metrics,
        status: localSnapshot.status,
        error: localSnapshot.error,
      },
      comparison: {
        missingLocally: localSnapshot.status >= 400 || !!localSnapshot.error,
        regressions: comparison.regressions,
        improvements: comparison.improvements,
      },
    };

    snapshots.push(snapshot);

    // Print summary
    if (snapshot.comparison.missingLocally) {
      console.log(`  ⚠️  Missing locally`);
    } else if (snapshot.comparison.regressions.length > 0) {
      console.log(`  ⚠️  ${snapshot.comparison.regressions.length} regressions`);
    } else if (snapshot.comparison.improvements.length > 0) {
      console.log(`  ✅ ${snapshot.comparison.improvements.length} improvements`);
    } else {
      console.log(`  ✅ Parity maintained`);
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await browser.close();

  // Save report
  const report = {
    scannedAt: new Date().toISOString(),
    totalRoutes: routes.length,
    snapshots,
    summary: {
      total: snapshots.length,
      missing: snapshots.filter(s => s.comparison.missingLocally).length,
      regressions: snapshots.filter(s => s.comparison.regressions.length > 0).length,
      improvements: snapshots.filter(s => s.comparison.improvements.length > 0).length,
    },
  };

  const reportFile = path.join(OUTPUT_DIR, 'ui-report.json');
  await fs.writeFile(reportFile, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\n✅ Saved report: ${reportFile}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total routes: ${report.summary.total}`);
  console.log(`   ⚠️  Missing: ${report.summary.missing}`);
  console.log(`   ⚠️  Regressions: ${report.summary.regressions}`);
  console.log(`   ✅ Improvements: ${report.summary.improvements}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  captureSnapshots().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { captureSnapshots, extractMetrics };
