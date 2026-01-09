/**
 * Performance Audit Script
 * Comprehensive performance check for the application
 * 
 * Usage: tsx scripts/performance/audit-performance.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface PerformanceCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
  recommendation?: string;
}

const checks: PerformanceCheck[] = [];

/**
 * Check for CLS issues (fixed dimensions on images)
 */
function checkCLSOptimization() {
  const componentsDir = path.join(process.cwd(), 'apps/web/components');
  const appDir = path.join(process.cwd(), 'apps/web/app');
  
  let imagesWithoutDimensions = 0;
  let imagesWithDimensions = 0;
  let totalImages = 0;

  const checkFile = (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Find image components
    const imageMatches = content.matchAll(/<img[^>]*>|<Image[^>]*>|<OptimizedImage[^>]*>/g);
    
    for (const match of imageMatches) {
      totalImages++;
      const imgTag = match[0];
      
      // Check for width and height attributes
      const hasWidth = /width\s*=\s*["']?\d+["']?/.test(imgTag);
      const hasHeight = /height\s*=\s*["']?\d+["']?/.test(imgTag);
      
      if (hasWidth && hasHeight) {
        imagesWithDimensions++;
      } else {
        imagesWithoutDimensions++;
      }
    }
  };

  // Check components directory
  if (fs.existsSync(componentsDir)) {
    const componentFiles = glob.sync('**/*.{tsx,jsx}', { cwd: componentsDir });
    componentFiles.forEach(file => {
      checkFile(path.join(componentsDir, file));
    });
  }

  // Check app directory
  if (fs.existsSync(appDir)) {
    const appFiles = glob.sync('**/*.{tsx,jsx}', { cwd: appDir });
    appFiles.forEach(file => {
      checkFile(path.join(appDir, file));
    });
  }

  const percentage = totalImages > 0 ? (imagesWithDimensions / totalImages) * 100 : 100;

  if (percentage < 80) {
    checks.push({
      name: 'CLS Optimization',
      status: 'warn',
      message: `${imagesWithDimensions}/${totalImages} images have fixed dimensions (${percentage.toFixed(1)}%)`,
      recommendation: 'Add width and height attributes to all images to prevent CLS',
    });
  } else {
    checks.push({
      name: 'CLS Optimization',
      status: 'pass',
      message: `${imagesWithDimensions}/${totalImages} images have fixed dimensions (${percentage.toFixed(1)}%)`,
    });
  }
}

/**
 * Check bundle size
 */
function checkBundleSize() {
  const buildDir = path.join(process.cwd(), 'apps/web/.next');
  
  if (!fs.existsSync(buildDir)) {
    checks.push({
      name: 'Bundle Size',
      status: 'warn',
      message: 'Build directory not found. Run "pnpm build" first.',
    });
    return;
  }

  const staticDir = path.join(buildDir, 'static');
  if (!fs.existsSync(staticDir)) {
    checks.push({
      name: 'Bundle Size',
      status: 'warn',
      message: 'Static build directory not found.',
    });
    return;
  }

  let totalSize = 0;
  let largeFiles: Array<{ name: string; size: number }> = [];

  const analyzeDir = (dir: string) => {
    const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
    
    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(file.path || dir, file.name);
        const stats = fs.statSync(filePath);
        const size = stats.size;
        totalSize += size;
        
        if (size > 500 * 1024) { // Files larger than 500KB
          largeFiles.push({
            name: file.name,
            size,
          });
        }
      }
    }
  };

  analyzeDir(staticDir);

  const totalMB = totalSize / (1024 * 1024);
  largeFiles.sort((a, b) => b.size - a.size);

  if (totalMB > 5) {
    checks.push({
      name: 'Bundle Size',
      status: 'warn',
      message: `Total bundle size: ${totalMB.toFixed(2)} MB (target: <5MB)`,
      recommendation: 'Consider code splitting and lazy loading to reduce bundle size',
    });
  } else {
    checks.push({
      name: 'Bundle Size',
      status: 'pass',
      message: `Total bundle size: ${totalMB.toFixed(2)} MB`,
    });
  }

  if (largeFiles.length > 0) {
    checks.push({
      name: 'Large Files',
      status: 'warn',
      message: `Found ${largeFiles.length} files > 500KB`,
      recommendation: `Largest files: ${largeFiles.slice(0, 5).map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join(', ')}`,
    });
  }
}

/**
 * Check for lazy loading usage
 */
function checkLazyLoading() {
  const appDir = path.join(process.cwd(), 'apps/web/app');
  const componentsDir = path.join(process.cwd(), 'apps/web/components');
  
  let dynamicImports = 0;
  let totalFiles = 0;

  const checkFile = (filePath: string) => {
    if (!fs.existsSync(filePath)) return;
    
    totalFiles++;
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes('dynamic(') || content.includes('lazy(') || content.includes('next/dynamic')) {
      dynamicImports++;
    }
  };

  // Check app directory
  if (fs.existsSync(appDir)) {
    const appFiles = glob.sync('**/*.{tsx,ts}', { cwd: appDir });
    appFiles.forEach(file => {
      checkFile(path.join(appDir, file));
    });
  }

  // Check components directory
  if (fs.existsSync(componentsDir)) {
    const componentFiles = glob.sync('**/*.{tsx,ts}', { cwd: componentsDir });
    componentFiles.forEach(file => {
      checkFile(path.join(componentsDir, file));
    });
  }

  const percentage = totalFiles > 0 ? (dynamicImports / totalFiles) * 100 : 0;

  if (percentage < 10) {
    checks.push({
      name: 'Lazy Loading',
      status: 'warn',
      message: `Only ${dynamicImports}/${totalFiles} files use lazy loading (${percentage.toFixed(1)}%)`,
      recommendation: 'Consider lazy loading heavy components to improve initial load time',
    });
  } else {
    checks.push({
      name: 'Lazy Loading',
      status: 'pass',
      message: `${dynamicImports}/${totalFiles} files use lazy loading (${percentage.toFixed(1)}%)`,
    });
  }
}

/**
 * Check for caching strategies
 */
function checkCaching() {
  const appDir = path.join(process.cwd(), 'apps/web/app');
  
  let pagesWithRevalidate = 0;
  let pagesWithGenerateStaticParams = 0;
  let totalPages = 0;

  if (!fs.existsSync(appDir)) {
    checks.push({
      name: 'Caching',
      status: 'warn',
      message: 'App directory not found',
    });
    return;
  }

  const pageFiles = glob.sync('**/page.tsx', { cwd: appDir });
  totalPages = pageFiles.length;

  pageFiles.forEach(file => {
    const filePath = path.join(appDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes('revalidate') || content.includes('export const revalidate')) {
      pagesWithRevalidate++;
    }
    
    if (content.includes('generateStaticParams')) {
      pagesWithGenerateStaticParams++;
    }
  });

  const revalidatePercentage = (pagesWithRevalidate / totalPages) * 100;
  const staticPercentage = (pagesWithGenerateStaticParams / totalPages) * 100;

  if (revalidatePercentage < 30) {
    checks.push({
      name: 'Caching Strategy',
      status: 'warn',
      message: `Only ${pagesWithRevalidate}/${totalPages} pages use revalidation (${revalidatePercentage.toFixed(1)}%)`,
      recommendation: 'Add revalidate to more pages for better caching',
    });
  } else {
    checks.push({
      name: 'Caching Strategy',
      status: 'pass',
      message: `${pagesWithRevalidate}/${totalPages} pages use revalidation (${revalidatePercentage.toFixed(1)}%)`,
    });
  }

  if (staticPercentage < 20) {
    checks.push({
      name: 'Static Generation',
      status: 'warn',
      message: `Only ${pagesWithGenerateStaticParams}/${totalPages} pages use generateStaticParams (${staticPercentage.toFixed(1)}%)`,
      recommendation: 'Consider static generation for more pages to improve performance',
    });
  } else {
    checks.push({
      name: 'Static Generation',
      status: 'pass',
      message: `${pagesWithGenerateStaticParams}/${totalPages} pages use generateStaticParams (${staticPercentage.toFixed(1)}%)`,
    });
  }
}

/**
 * Check for image optimization
 */
function checkImageOptimization() {
  const componentsDir = path.join(process.cwd(), 'apps/web/components');
  const appDir = path.join(process.cwd(), 'apps/web/app');
  
  let optimizedImages = 0;
  let regularImages = 0;

  const checkFile = (filePath: string) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Count OptimizedImage usage
    const optimizedMatches = content.match(/OptimizedImage|getOptimizedCloudinaryUrl/g);
    if (optimizedMatches) {
      optimizedImages += optimizedMatches.length;
    }
    
    // Count regular img tags (not in comments)
    const regularMatches = content.match(/<img[^>]*>/g);
    if (regularMatches) {
      regularImages += regularMatches.filter(m => !m.includes('//') && !m.includes('/*')).length;
    }
  };

  if (fs.existsSync(componentsDir)) {
    const componentFiles = glob.sync('**/*.{tsx,jsx}', { cwd: componentsDir });
    componentFiles.forEach(file => {
      checkFile(path.join(componentsDir, file));
    });
  }

  if (fs.existsSync(appDir)) {
    const appFiles = glob.sync('**/*.{tsx,jsx}', { cwd: appDir });
    appFiles.forEach(file => {
      checkFile(path.join(appDir, file));
    });
  }

  const total = optimizedImages + regularImages;
  const percentage = total > 0 ? (optimizedImages / total) * 100 : 100;

  if (percentage < 80) {
    checks.push({
      name: 'Image Optimization',
      status: 'warn',
      message: `${optimizedImages}/${total} images use optimization (${percentage.toFixed(1)}%)`,
      recommendation: 'Use OptimizedImage component for all images',
    });
  } else {
    checks.push({
      name: 'Image Optimization',
      status: 'pass',
      message: `${optimizedImages}/${total} images use optimization (${percentage.toFixed(1)}%)`,
    });
  }
}

/**
 * Run all checks
 */
async function runAudit() {
  console.log('🔍 Running Performance Audit...\n');

  checkCLSOptimization();
  checkBundleSize();
  checkLazyLoading();
  checkCaching();
  checkImageOptimization();

  // Print results
  console.log('📊 Performance Audit Results:\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const passed = checks.filter(c => c.status === 'pass').length;
  const warnings = checks.filter(c => c.status === 'warn').length;
  const failed = checks.filter(c => c.status === 'fail').length;

  checks.forEach(check => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${check.name}: ${check.message}`);
    if (check.recommendation) {
      console.log(`   💡 ${check.recommendation}`);
    }
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📈 Summary: ${passed} passed, ${warnings} warnings, ${failed} failed\n`);

  if (warnings === 0 && failed === 0) {
    console.log('🎉 All performance checks passed!');
  } else {
    console.log('💡 Review warnings and recommendations above.');
  }
}

runAudit().catch(console.error);
