#!/usr/bin/env tsx
/**
 * PHASE 6: Generate Human-Readable UI Parity Report
 * 
 * Combines all UI audit data into a comprehensive markdown report
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'scripts/parity');
const UI_REPORT_FILE = path.join(OUTPUT_DIR, 'ui-report.json');
const SCORING_FILE = path.join(OUTPUT_DIR, 'ui-scoring-report.json');
const DESIGN_AUDIT_FILE = path.join(OUTPUT_DIR, 'design-system-audit.json');

async function generateUIReport(): Promise<void> {
  console.log('📄 Generating UI Parity Report...\n');

  // Load all reports
  const uiReport = JSON.parse(await fs.readFile(UI_REPORT_FILE, 'utf-8').catch(() => '{"snapshots":[]}'));
  const scoringReport = JSON.parse(await fs.readFile(SCORING_FILE, 'utf-8').catch(() => '{"scores":[]}'));
  const designAudit = JSON.parse(await fs.readFile(DESIGN_AUDIT_FILE, 'utf-8').catch(() => '{"tokens":{}}'));

  let md = `# UI/UX Parity Report\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;

  // Summary
  md += `## Executive Summary\n\n`;
  md += `| Metric | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| Screens Audited | ${uiReport.snapshots?.length || 0} |\n`;
  md += `| Missing Locally | ${uiReport.summary?.missing || 0} |\n`;
  md += `| Regressions | ${scoringReport.summary?.regressions || 0} |\n`;
  md += `| Improvements | ${scoringReport.summary?.improvements || 0} |\n`;
  md += `| Design Tokens | ${designAudit.tokens?.total || 0} |\n\n`;

  // Screenshots
  if (uiReport.snapshots?.length > 0) {
    md += `## Visual Comparisons\n\n`;
    md += `Screenshots saved in: \`scripts/parity/parity-artifacts/screenshots/\`\n\n`;
    
    uiReport.snapshots.forEach((snapshot: any) => {
      md += `### ${snapshot.name} (${snapshot.route})\n\n`;
      
      if (snapshot.comparison.missingLocally) {
        md += `⚠️ **Missing Locally**\n\n`;
      } else {
        md += `- Production: [Screenshot](${snapshot.prod.screenshot})\n`;
        md += `- Local: [Screenshot](${snapshot.local.screenshot})\n\n`;
        
        if (snapshot.comparison.regressions.length > 0) {
          md += `**Regressions:**\n`;
          snapshot.comparison.regressions.forEach((reg: string) => {
            md += `- ⚠️ ${reg}\n`;
          });
          md += `\n`;
        }
        
        if (snapshot.comparison.improvements.length > 0) {
          md += `**Improvements:**\n`;
          snapshot.comparison.improvements.forEach((imp: string) => {
            md += `- ✅ ${imp}\n`;
          });
          md += `\n`;
        }
      }
    });
  }

  // Scoring
  if (scoringReport.scores?.length > 0) {
    md += `## Scoring Analysis\n\n`;
    md += `| Screen | Old Score | New Score | Difference |\n`;
    md += `|--------|-----------|-----------|------------|\n`;
    
    scoringReport.scores.forEach((score: any) => {
      const diff = score.overall.difference;
      const emoji = diff < 0 ? '⚠️' : diff > 0 ? '✅' : '➖';
      md += `| ${score.name} | ${score.overall.old}/10 | ${score.overall.new}/10 | ${diff > 0 ? '+' : ''}${diff} ${emoji} |\n`;
    });
    
    md += `\n`;
  }

  // Design System
  if (designAudit.tokens) {
    md += `## Design System Audit\n\n`;
    md += `**Design Tokens:** ${designAudit.tokens.total}\n`;
    md += `- Colors: ${designAudit.tokens.byType?.color || 0}\n`;
    md += `- Spacing: ${designAudit.tokens.byType?.spacing || 0}\n`;
    md += `- Typography: ${designAudit.tokens.byType?.typography || 0}\n\n`;
    
    if (designAudit.recommendations?.length > 0) {
      md += `**Recommendations:**\n`;
      designAudit.recommendations.forEach((rec: string) => {
        md += `- ${rec}\n`;
      });
      md += `\n`;
    }
  }

  // Action Items
  md += `## Action Items\n\n`;
  
  const regressions = scoringReport.scores?.filter((s: any) => s.overall.difference < 0) || [];
  if (regressions.length > 0) {
    md += `### Critical Regressions (Must Fix)\n\n`;
    regressions.forEach((score: any) => {
      md += `- **${score.name}**: ${score.regressions.join(', ')}\n`;
    });
    md += `\n`;
  }

  const improvements = scoringReport.scores?.filter((s: any) => s.overall.difference > 0) || [];
  if (improvements.length > 0) {
    md += `### Improvements Made\n\n`;
    improvements.forEach((score: any) => {
      md += `- **${score.name}**: ${score.improvements.join(', ')}\n`;
    });
    md += `\n`;
  }

  md += `---\n\n`;
  md += `*Next: Run \`npm run parity:ui:verify\` to check regression threshold*\n`;

  const outputFile = path.join(OUTPUT_DIR, 'ui-report.md');
  await fs.writeFile(outputFile, md, 'utf-8');

  console.log(`✅ Saved report: ${outputFile}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateUIReport().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateUIReport };
