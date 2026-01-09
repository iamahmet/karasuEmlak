#!/usr/bin/env tsx
/**
 * PHASE 3: Design System Consolidation Audit
 * 
 * Audits design tokens and component consistency
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

const APP_DIR = path.join(process.cwd(), 'apps/web');

interface DesignToken {
  type: 'color' | 'spacing' | 'typography' | 'border' | 'shadow';
  name: string;
  value: string;
  usage: string[];
}

interface ComponentAudit {
  name: string;
  file: string;
  usesTokens: boolean;
  customStyles: string[];
  accessibility: {
    hasLabels: boolean;
    hasAria: boolean;
    keyboardNav: boolean;
  };
}

/**
 * Extract CSS variables from globals.css
 */
async function extractDesignTokens(): Promise<DesignToken[]> {
  const globalsFile = path.join(APP_DIR, 'app/globals.css');
  const content = await fs.readFile(globalsFile, 'utf-8');

  const tokens: DesignToken[] = [];

  // Extract CSS variables
  const varRegex = /--([\w-]+):\s*([^;]+);/g;
  let match;

  while ((match = varRegex.exec(content)) !== null) {
    const name = match[1];
    const value = match[2].trim();

    let type: DesignToken['type'] = 'color';
    if (name.includes('spacing') || name.includes('gap') || name.includes('padding') || name.includes('margin')) {
      type = 'spacing';
    } else if (name.includes('font') || name.includes('text') || name.includes('line-height')) {
      type = 'typography';
    } else if (name.includes('radius') || name.includes('border')) {
      type = 'border';
    } else if (name.includes('shadow')) {
      type = 'shadow';
    }

    tokens.push({
      type,
      name: `--${name}`,
      value,
      usage: [],
    });
  }

  return tokens;
}

/**
 * Audit component files
 */
async function auditComponents(): Promise<ComponentAudit[]> {
  const componentFiles = await glob('**/*.tsx', {
    cwd: path.join(APP_DIR, 'components'),
    absolute: true,
  });

  const audits: ComponentAudit[] = [];

  for (const file of componentFiles.slice(0, 20)) { // Limit for performance
    const content = await fs.readFile(file, 'utf-8');
    const name = path.basename(file, '.tsx');

    const usesTokens = /var\(--[\w-]+\)|className.*["'](text-|bg-|p-|m-|rounded-)/.test(content);
    const customStyles = content.match(/style=\{[^}]+\}/g) || [];
    const hasLabels = /htmlFor|label|Label/.test(content);
    const hasAria = /aria-/.test(content);
    const keyboardNav = /onKeyDown|tabIndex/.test(content);

    audits.push({
      name,
      file,
      usesTokens,
      customStyles: customStyles.slice(0, 5), // Limit
      accessibility: {
        hasLabels,
        hasAria,
        keyboardNav,
      },
    });
  }

  return audits;
}

/**
 * Generate design system audit report
 */
async function generateDesignSystemAudit(): Promise<void> {
  console.log('🎨 PHASE 3: Design System Audit');
  console.log('=================================\n');

  console.log('Extracting design tokens...');
  const tokens = await extractDesignTokens();

  console.log(`Found ${tokens.length} design tokens`);
  console.log(`  Colors: ${tokens.filter(t => t.type === 'color').length}`);
  console.log(`  Spacing: ${tokens.filter(t => t.type === 'spacing').length}`);
  console.log(`  Typography: ${tokens.filter(t => t.type === 'typography').length}`);

  console.log('\nAuditing components...');
  const components = await auditComponents();

  console.log(`Audited ${components.length} components`);

  const report = {
    generatedAt: new Date().toISOString(),
    tokens: {
      total: tokens.length,
      byType: {
        color: tokens.filter(t => t.type === 'color').length,
        spacing: tokens.filter(t => t.type === 'spacing').length,
        typography: tokens.filter(t => t.type === 'typography').length,
        border: tokens.filter(t => t.type === 'border').length,
        shadow: tokens.filter(t => t.type === 'shadow').length,
      },
      list: tokens,
    },
    components: {
      total: components.length,
      usingTokens: components.filter(c => c.usesTokens).length,
      withCustomStyles: components.filter(c => c.customStyles.length > 0).length,
      accessibility: {
        withLabels: components.filter(c => c.accessibility.hasLabels).length,
        withAria: components.filter(c => c.accessibility.hasAria).length,
        keyboardNav: components.filter(c => c.accessibility.keyboardNav).length,
      },
      list: components,
    },
    recommendations: [
      components.filter(c => !c.usesTokens).length > 0
        ? `${components.filter(c => !c.usesTokens).length} components not using design tokens`
        : null,
      components.filter(c => c.customStyles.length > 3).length > 0
        ? `${components.filter(c => c.customStyles.length > 3).length} components with excessive custom styles`
        : null,
      components.filter(c => !c.accessibility.hasLabels && !c.accessibility.hasAria).length > 0
        ? `${components.filter(c => !c.accessibility.hasLabels && !c.accessibility.hasAria).length} components missing accessibility attributes`
        : null,
    ].filter(Boolean),
  };

  const outputFile = path.join(process.cwd(), 'scripts/parity/design-system-audit.json');
  await fs.writeFile(outputFile, JSON.stringify(report, null, 2), 'utf-8');

  console.log(`\n✅ Saved audit: ${outputFile}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Design tokens: ${report.tokens.total}`);
  console.log(`   Components using tokens: ${report.components.usingTokens}/${report.components.total}`);
  console.log(`   Accessibility: ${report.components.accessibility.withLabels} with labels, ${report.components.accessibility.withAria} with ARIA`);
  
  if (report.recommendations.length > 0) {
    console.log(`\n⚠️  Recommendations:`);
    report.recommendations.forEach(rec => console.log(`   - ${rec}`));
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDesignSystemAudit().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { generateDesignSystemAudit };
