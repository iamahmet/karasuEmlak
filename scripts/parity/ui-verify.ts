#!/usr/bin/env tsx
/**
 * PHASE 6: Verify UI Parity Thresholds
 * 
 * Checks if regressions are below acceptable threshold
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const SCORING_FILE = path.join(process.cwd(), 'scripts/parity/ui-scoring-report.json');
const MAX_REGRESSIONS = 3; // Allow max 3 regressions
const MIN_AVERAGE_SCORE = 7.0; // Minimum average score

async function verifyUIParity(): Promise<void> {
  console.log('✅ PHASE 6: UI Parity Verification');
  console.log('==================================\n');

  try {
    const scoringReport = JSON.parse(await fs.readFile(SCORING_FILE, 'utf-8'));

    const regressions = scoringReport.scores?.filter((s: any) => s.overall.difference < 0) || [];
    const averageNew = scoringReport.summary?.averageNew || 0;

    console.log(`📊 Verification Results:\n`);
    console.log(`   Total screens: ${scoringReport.summary?.totalScreens || 0}`);
    console.log(`   Regressions: ${regressions.length}`);
    console.log(`   Average score: ${averageNew.toFixed(1)}/10`);
    console.log(`   Threshold: ${MAX_REGRESSIONS} max regressions, ${MIN_AVERAGE_SCORE}/10 min average\n`);

    let passed = true;
    const issues: string[] = [];

    if (regressions.length > MAX_REGRESSIONS) {
      passed = false;
      issues.push(`Too many regressions: ${regressions.length} (max: ${MAX_REGRESSIONS})`);
    }

    if (averageNew < MIN_AVERAGE_SCORE) {
      passed = false;
      issues.push(`Average score too low: ${averageNew.toFixed(1)}/10 (min: ${MIN_AVERAGE_SCORE})`);
    }

    if (passed) {
      console.log('✅ UI Parity Verification PASSED\n');
      console.log('   All thresholds met. New version maintains or improves UI quality.');
    } else {
      console.log('⚠️  UI Parity Verification FAILED\n');
      console.log('   Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\n   Please fix regressions before deploying.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error reading scoring report:', error);
    console.log('⚠️  Run \`npm run parity:ui:score\` first');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyUIParity().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { verifyUIParity };
