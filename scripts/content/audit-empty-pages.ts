#!/usr/bin/env tsx
/**
 * Empty Pages Audit Script
 * 
 * Scans all pages and identifies empty or incomplete pages
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface PageAudit {
  route: string;
  file: string;
  type: 'static' | 'dynamic' | 'api';
  hasContent: boolean;
  issues: string[];
  dataSource?: string;
  dataCount?: number;
}

/**
 * Check if page has data
 */
async function checkPageData(route: string): Promise<{ hasData: boolean; count: number; source?: string }> {
  // Extract route pattern
  if (route.includes('/blog/')) {
    const { data, error } = await supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published');
    return { hasData: (data?.length || 0) > 0, count: data?.length || 0, source: 'articles' };
  }
  
  if (route.includes('/haberler/')) {
    const { data, error } = await supabase
      .from('news_articles')
      .select('id', { count: 'exact', head: true })
      .eq('published', true)
      .is('deleted_at', null);
    return { hasData: (data?.length || 0) > 0, count: data?.length || 0, source: 'news_articles' };
  }
  
  if (route.includes('/satilik') || route.includes('/kiralik')) {
    const { data, error } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('published', true)
      .eq('available', true)
      .is('deleted_at', null);
    return { hasData: (data?.length || 0) > 0, count: data?.length || 0, source: 'listings' };
  }
  
  if (route.includes('/mahalle/')) {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('id', { count: 'exact', head: true })
      .eq('published', true)
      .is('deleted_at', null);
    return { hasData: (data?.length || 0) > 0, count: data?.length || 0, source: 'neighborhoods' };
  }
  
  // Static pages - assume they have content
  return { hasData: true, count: 1, source: 'static' };
}

/**
 * Audit all pages
 */
async function auditPages() {
  console.log('🔍 Scanning all pages...\n');
  
  const pagesDir = path.join(process.cwd(), 'apps/web/app');
  const pageFiles = await glob('**/page.tsx', { cwd: pagesDir, absolute: true });
  
  const audits: PageAudit[] = [];
  const emptyPages: PageAudit[] = [];
  
  for (const file of pageFiles) {
    const relativePath = path.relative(pagesDir, file);
    const route = '/' + relativePath.replace(/\/page\.tsx$/, '').replace(/\[.*?\]/g, '*');
    
    // Skip API routes and special files
    if (route.includes('/api/') || route.includes('/_') || route.includes('/layout')) {
      continue;
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    const hasContent = content.length > 500; // Basic check
    
    const issues: string[] = [];
    
    // Check for common empty page patterns
    if (content.includes('Not Found') || content.includes('404')) {
      issues.push('404/Not Found page');
    }
    
    if (content.includes('loading') && content.includes('Loading')) {
      issues.push('Only loading state');
    }
    
    if (content.length < 500) {
      issues.push('Very short content');
    }
    
    // Check data source
    let dataCheck = { hasData: true, count: 0, source: 'static' };
    if (route.includes('/blog') || route.includes('/haberler') || route.includes('/satilik') || 
        route.includes('/kiralik') || route.includes('/mahalle')) {
      dataCheck = await checkPageData(route);
    }
    
    const audit: PageAudit = {
      route,
      file: relativePath,
      type: route.includes('[') ? 'dynamic' : 'static',
      hasContent,
      issues,
      dataSource: dataCheck.source,
      dataCount: dataCheck.count,
    };
    
    audits.push(audit);
    
    if (!dataCheck.hasData || issues.length > 0) {
      emptyPages.push(audit);
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Generate report
  const report = {
    summary: {
      total: audits.length,
      empty: emptyPages.length,
      withData: audits.filter(a => a.dataCount && a.dataCount > 0).length,
      withoutData: audits.filter(a => a.dataCount === 0).length,
    },
    emptyPages: emptyPages.map(p => ({
      route: p.route,
      type: p.type,
      issues: p.issues,
      dataSource: p.dataSource,
      dataCount: p.dataCount,
    })),
    allPages: audits.map(p => ({
      route: p.route,
      type: p.type,
      hasData: p.dataCount && p.dataCount > 0,
      dataCount: p.dataCount,
    })),
  };
  
  // Save report
  const reportPath = path.join(process.cwd(), 'EMPTY_PAGES_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Print summary
  console.log('\n📊 PAGE AUDIT SUMMARY');
  console.log('====================');
  console.log(`Total Pages: ${report.summary.total}`);
  console.log(`Empty/Issues: ${report.summary.empty}`);
  console.log(`With Data: ${report.summary.withData}`);
  console.log(`Without Data: ${report.summary.withoutData}`);
  
  console.log('\n📋 Empty Pages:');
  emptyPages.forEach((page, i) => {
    console.log(`\n${i + 1}. ${page.route}`);
    console.log(`   Type: ${page.type}`);
    console.log(`   Data Source: ${page.dataSource || 'N/A'}`);
    console.log(`   Data Count: ${page.dataCount || 0}`);
    console.log(`   Issues: ${page.issues.join(', ') || 'None'}`);
  });
  
  console.log(`\n✅ Full report saved to: ${reportPath}`);
  
  return report;
}

// Run
auditPages().catch(console.error);
