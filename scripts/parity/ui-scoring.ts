#!/usr/bin/env tsx
/**
 * PHASE 2: Better or Worse Heuristics
 * 
 * Scores old vs new per screen with 0-10 rubric
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const UI_REPORT_FILE = path.join(process.cwd(), 'scripts/parity/ui-report.json');

interface ComponentScore {
  component: string;
  oldScore: number;
  newScore: number;
  difference: number;
  notes: string[];
}

interface ScreenScore {
  route: string;
  name: string;
  overall: {
    old: number;
    new: number;
    difference: number;
  };
  components: ComponentScore[];
  regressions: string[];
  improvements: string[];
}

/**
 * Score a listing card component
 */
function scoreListingCard(metrics: any, checklist: any): number {
  let score = 0;
  const maxScore = 10;

  // Has image: +2
  if (metrics.listingGrid) score += 2;

  // Has price: +2
  if (metrics.priceBlock) score += 2;

  // Has CTA: +2
  if (metrics.cta) score += 2;

  // Has trust signals: +2
  if (metrics.trustSignals >= 2) score += 2;
  else if (metrics.trustSignals >= 1) score += 1;

  // Has conversion widgets: +2
  if (metrics.conversionWidgets >= 2) score += 2;
  else if (metrics.conversionWidgets >= 1) score += 1;

  return Math.min(score, maxScore);
}

/**
 * Score filters component
 */
function scoreFilters(metrics: any, checklist: any): number {
  let score = 0;
  const maxScore = 10;

  // Filters present: +3
  if (metrics.filters) score += 3;

  // Trust signals (filter reliability): +2
  if (metrics.trustSignals > 0) score += 2;

  // Conversion options: +2
  if (metrics.conversionWidgets > 0) score += 2;

  // Clear navigation: +3
  if (metrics.breadcrumbs) score += 3;

  return Math.min(score, maxScore);
}

/**
 * Score detail page
 */
function scoreDetailPage(metrics: any, checklist: any): number {
  let score = 0;
  const maxScore = 10;

  // Gallery present: +2
  if (metrics.photoGallery) score += 2;

  // Price block: +2
  if (metrics.priceBlock) score += 2;

  // Sticky CTA: +2
  if (metrics.cta) score += 2;

  // Trust signals: +2
  if (metrics.trustSignals >= 3) score += 2;
  else if (metrics.trustSignals >= 1) score += 1;

  // Conversion widgets: +2
  if (metrics.conversionWidgets >= 2) score += 2;
  else if (metrics.conversionWidgets >= 1) score += 1;

  return Math.min(score, maxScore);
}

/**
 * Score blog/news page
 */
function scoreBlogPage(metrics: any, checklist: any): number {
  let score = 0;
  const maxScore = 10;

  // H1 present: +2
  if (metrics.h1.present) score += 2;

  // Breadcrumbs: +2
  if (metrics.breadcrumbs) score += 2;

  // Trust signals: +2
  if (metrics.trustSignals > 0) score += 2;

  // Conversion widgets: +2
  if (metrics.conversionWidgets > 0) score += 2;

  // Hero/image: +2
  if (metrics.hero || metrics.photoGallery) score += 2;

  return Math.min(score, maxScore);
}

/**
 * Score a screen based on metrics
 */
function scoreScreen(route: string, metrics: any, checklist: any): number {
  // Determine page type and use appropriate scoring
  if (route.includes('/ilan/') || route.includes('/listing/')) {
    return scoreDetailPage(metrics, checklist);
  } else if (route.includes('/blog/') || route.includes('/haberler/')) {
    return scoreBlogPage(metrics, checklist);
  } else if (route.includes('/satilik') || route.includes('/kiralik')) {
    return scoreFilters(metrics, checklist);
  } else {
    // Generic scoring
    let score = 0;
    if (metrics.hero) score += 2;
    if (metrics.h1.present) score += 2;
    if (metrics.cta) score += 2;
    if (metrics.trustSignals >= 2) score += 2;
    if (metrics.conversionWidgets >= 1) score += 2;
    return Math.min(score, 10);
  }
}

/**
 * Generate scoring report
 */
async function generateScoringReport(): Promise<void> {
  console.log('📊 PHASE 2: UI/UX Scoring');
  console.log('==========================\n');

  // Load UI report
  const reportData = JSON.parse(await fs.readFile(UI_REPORT_FILE, 'utf-8'));
  const { UI_PARITY_CHECKLIST } = await import('./ui-checklist');

  const scores: ScreenScore[] = [];

  for (const snapshot of reportData.snapshots || []) {
    const checklist = UI_PARITY_CHECKLIST.find(c => c.route === snapshot.route);

    // Score old (production)
    const oldScore = scoreScreen(snapshot.route, snapshot.prod.metrics, checklist);

    // Score new (local)
    const newScore = scoreScreen(snapshot.route, snapshot.local.metrics, checklist);

    // Component-level scores
    const components: ComponentScore[] = [];

    // Listing card score
    if (checklist?.categories.listingCard.length > 0) {
      const oldCardScore = scoreListingCard(snapshot.prod.metrics, checklist);
      const newCardScore = scoreListingCard(snapshot.local.metrics, checklist);
      components.push({
        component: 'Listing Card',
        oldScore: oldCardScore,
        newScore: newCardScore,
        difference: newCardScore - oldCardScore,
        notes: [],
      });
    }

    // Filters score
    if (checklist?.categories.filters.length > 0) {
      const oldFilterScore = scoreFilters(snapshot.prod.metrics, checklist);
      const newFilterScore = scoreFilters(snapshot.local.metrics, checklist);
      components.push({
        component: 'Filters',
        oldScore: oldFilterScore,
        newScore: newFilterScore,
        difference: newFilterScore - oldFilterScore,
        notes: [],
      });
    }

    // Identify regressions and improvements
    const regressions: string[] = [];
    const improvements: string[] = [];

    components.forEach(comp => {
      if (comp.difference < 0) {
        regressions.push(`${comp.component} regressed (${comp.oldScore} → ${comp.newScore})`);
      } else if (comp.difference > 0) {
        improvements.push(`${comp.component} improved (${comp.oldScore} → ${comp.newScore})`);
      }
    });

    if (newScore < oldScore) {
      regressions.push(`Overall score regressed (${oldScore} → ${newScore})`);
    } else if (newScore > oldScore) {
      improvements.push(`Overall score improved (${oldScore} → ${newScore})`);
    }

    scores.push({
      route: snapshot.route,
      name: snapshot.name,
      overall: {
        old: oldScore,
        new: newScore,
        difference: newScore - oldScore,
      },
      components,
      regressions,
      improvements,
    });
  }

  // Generate summary
  const summary = {
    totalScreens: scores.length,
    regressions: scores.filter(s => s.overall.difference < 0).length,
    improvements: scores.filter(s => s.overall.difference > 0).length,
    parity: scores.filter(s => s.overall.difference === 0).length,
    averageOld: scores.reduce((sum, s) => sum + s.overall.old, 0) / scores.length,
    averageNew: scores.reduce((sum, s) => sum + s.overall.new, 0) / scores.length,
  };

  const scoringReport = {
    generatedAt: new Date().toISOString(),
    summary,
    scores,
  };

  const outputFile = path.join(process.cwd(), 'scripts/parity/ui-scoring-report.json');
  await fs.writeFile(outputFile, JSON.stringify(scoringReport, null, 2), 'utf-8');

  console.log(`✅ Saved scoring report: ${outputFile}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total screens: ${summary.totalScreens}`);
  console.log(`   ⚠️  Regressions: ${summary.regressions}`);
  console.log(`   ✅ Improvements: ${summary.improvements}`);
  console.log(`   ➖ Parity: ${summary.parity}`);
  console.log(`   Average score (old): ${summary.averageOld.toFixed(1)}/10`);
  console.log(`   Average score (new): ${summary.averageNew.toFixed(1)}/10`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateScoringReport().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateScoringReport, scoreScreen };
