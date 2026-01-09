/**
 * Performance Check Script
 * Quick performance health check
 */

import * as fs from 'fs';
import * as path from 'path';

interface PerformanceCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

const checks: PerformanceCheck[] = [];

/**
 * Check bundle sizes
 */
function checkBundleSizes() {
  const buildDir = path.join(process.cwd(), 'apps/web/.next');
  
  if (!fs.existsSync(buildDir)) {
    checks.push({
      name: 'Bundle sizes',
      status: 'warn',
      message: 'Build directory not found. Run "pnpm build" first.',
    });
    return;
  }

  const staticDir = path.join(buildDir, 'static/chunks');
  if (!fs.existsSync(staticDir)) {
    checks.push({
      name: 'Bundle sizes',
      status: 'warn',
      message: 'Static chunks not found.',
    });
    return;
  }

  const files = fs.readdirSync(staticDir);
  let totalSize = 0;
  let largeFiles = 0;

  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(staticDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
      
      if (stats.size > 500 * 1024) { // > 500KB
        largeFiles++;
      }
    }
  }

  const totalMB = totalSize / (1024 * 1024);
  
  if (totalMB > 5) {
    checks.push({
      name: 'Bundle sizes',
      status: 'fail',
      message: `Total bundle size is ${totalMB.toFixed(2)} MB (target: < 5 MB). ${largeFiles} files > 500KB.`,
    });
  } else if (largeFiles > 0) {
    checks.push({
      name: 'Bundle sizes',
      status: 'warn',
      message: `Bundle size is ${totalMB.toFixed(2)} MB. ${largeFiles} files > 500KB.`,
    });
  } else {
    checks.push({
      name: 'Bundle sizes',
      status: 'pass',
      message: `Bundle size is ${totalMB.toFixed(2)} MB. All files < 500KB.`,
    });
  }
}

/**
 * Check for lazy loading usage
 */
function checkLazyLoading() {
  const appDir = path.join(process.cwd(), 'apps/web/app');
  
  if (!fs.existsSync(appDir)) {
    checks.push({
      name: 'Lazy loading',
      status: 'warn',
      message: 'App directory not found.',
    });
    return;
  }

  // Check for dynamic imports
  const files = fs.readdirSync(appDir, { recursive: true });
  let dynamicImports = 0;
  let totalFiles = 0;

  for (const file of files) {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      totalFiles++;
      const filePath = path.join(appDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.includes('dynamic(') || content.includes('lazy(')) {
        dynamicImports++;
      }
    }
  }

  const percentage = (dynamicImports / totalFiles) * 100;
  
  if (percentage < 5) {
    checks.push({
      name: 'Lazy loading',
      status: 'warn',
      message: `Only ${dynamicImports}/${totalFiles} files use lazy loading (${percentage.toFixed(1)}%). Consider lazy loading heavy components.`,
    });
  } else {
    checks.push({
      name: 'Lazy loading',
      status: 'pass',
      message: `${dynamicImports}/${totalFiles} files use lazy loading (${percentage.toFixed(1)}%).`,
    });
  }
}

/**
 * Check image optimization
 */
function checkImageOptimization() {
  const componentsDir = path.join(process.cwd(), 'apps/web/components');
  
  if (!fs.existsSync(componentsDir)) {
    checks.push({
      name: 'Image optimization',
      status: 'warn',
      message: 'Components directory not found.',
    });
    return;
  }

  const files = fs.readdirSync(componentsDir, { recursive: true });
  let optimizedImages = 0;
  let totalImages = 0;

  for (const file of files) {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(componentsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      if (content.includes('<img') || content.includes('Image')) {
        totalImages++;
        if (content.includes('OptimizedImage') || content.includes('getOptimizedCloudinaryUrl')) {
          optimizedImages++;
        }
      }
    }
  }

  if (totalImages === 0) {
    checks.push({
      name: 'Image optimization',
      status: 'pass',
      message: 'No images found in components.',
    });
  } else {
    const percentage = (optimizedImages / totalImages) * 100;
    
    if (percentage < 80) {
      checks.push({
        name: 'Image optimization',
        status: 'warn',
        message: `Only ${optimizedImages}/${totalImages} images use optimization (${percentage.toFixed(1)}%).`,
      });
    } else {
      checks.push({
        name: 'Image optimization',
        status: 'pass',
        message: `${optimizedImages}/${totalImages} images use optimization (${percentage.toFixed(1)}%).`,
      });
    }
  }
}

/**
 * Main check function
 */
async function runChecks() {
  console.log('🔍 Running performance checks...\n');

  checkBundleSizes();
  checkLazyLoading();
  checkImageOptimization();

  // Print results
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PERFORMANCE CHECK RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const passed = checks.filter(c => c.status === 'pass').length;
  const warned = checks.filter(c => c.status === 'warn').length;
  const failed = checks.filter(c => c.status === 'fail').length;

  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${passed} passed, ${warned} warned, ${failed} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runChecks().catch(console.error);
}

export { runChecks };
