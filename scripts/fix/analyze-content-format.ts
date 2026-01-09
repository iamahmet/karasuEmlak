#!/usr/bin/env tsx
/**
 * PHASE 0: Content Format Analyzer
 * 
 * Analyzes all content fields to determine their format:
 * - HTML entity escaped (&lt;h2&gt;)
 * - HTML (<h2>)
 * - Markdown (## Heading)
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ContentAnalysis {
  table: string;
  field: string;
  total: number;
  htmlEscaped: number;
  html: number;
  markdown: number;
  empty: number;
  unknown: number;
  samples: Array<{
    id: string;
    format: 'html-escaped' | 'html' | 'markdown' | 'empty' | 'unknown';
    preview: string;
  }>;
}

/**
 * Detect content format
 */
function detectFormat(content: string | null | undefined): 'html-escaped' | 'html' | 'markdown' | 'empty' | 'unknown' {
  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return 'empty';
  }

  const trimmed = content.trim();

  // Check for HTML entity escaped
  if (trimmed.includes('&lt;') || trimmed.includes('&gt;') || trimmed.includes('&amp;')) {
    // Check if it's actually escaped HTML (not just text with & symbols)
    if (trimmed.match(/&lt;[a-z][a-z0-9]*&gt;/i)) {
      return 'html-escaped';
    }
  }

  // Check for HTML tags
  if (trimmed.match(/<[a-z][a-z0-9]*[^>]*>/i)) {
    return 'html';
  }

  // Check for Markdown patterns
  if (
    trimmed.match(/^#{1,6}\s+/m) || // Headings
    trimmed.match(/^\*\s+/m) || // Unordered lists
    trimmed.match(/^\d+\.\s+/m) || // Ordered lists
    trimmed.match(/\*\*.*\*\*/) || // Bold
    trimmed.match(/\[.*\]\(.*\)/) // Links
  ) {
    return 'markdown';
  }

  return 'unknown';
}

/**
 * Analyze a table field
 */
async function analyzeField(
  table: string,
  field: string,
  idField: string = 'id',
  limit: number = 1000
): Promise<ContentAnalysis> {
  console.log(`\n📊 Analyzing ${table}.${field}...`);

  const { data, error } = await supabase
    .from(table)
    .select(`${idField}, ${field}`)
    .limit(limit);

  if (error) {
    console.error(`❌ Error fetching ${table}:`, error);
    return {
      table,
      field,
      total: 0,
      htmlEscaped: 0,
      html: 0,
      markdown: 0,
      empty: 0,
      unknown: 0,
      samples: [],
    };
  }

  const analysis: ContentAnalysis = {
    table,
    field,
    total: data.length,
    htmlEscaped: 0,
    html: 0,
    markdown: 0,
    empty: 0,
    unknown: 0,
    samples: [],
  };

  for (const row of data) {
    const content = row[field];
    const format = detectFormat(content);
    
    analysis[format === 'html-escaped' ? 'htmlEscaped' : format === 'html' ? 'html' : format === 'markdown' ? 'markdown' : format === 'empty' ? 'empty' : 'unknown']++;

    // Collect samples (first 10 of each type)
    if (analysis.samples.length < 10) {
      const preview = content 
        ? (typeof content === 'string' ? content.substring(0, 200) : String(content))
        : '';
      
      analysis.samples.push({
        id: row[idField],
        format,
        preview: preview.replace(/\n/g, ' ').substring(0, 150),
      });
    }
  }

  return analysis;
}

/**
 * Main analysis function
 */
async function main() {
  console.log('🔍 CONTENT FORMAT ANALYSIS');
  console.log('=' .repeat(60));

  const analyses: ContentAnalysis[] = [];

  // Analyze articles.content
  analyses.push(await analyzeField('articles', 'content', 'id', 1000));

  // Analyze news_articles fields
  analyses.push(await analyzeField('news_articles', 'original_summary', 'id', 500));
  analyses.push(await analyzeField('news_articles', 'emlak_analysis', 'id', 500));

  // Analyze listings.description_long
  analyses.push(await analyzeField('listings', 'description_long', 'id', 500));

  // Analyze neighborhoods.description
  analyses.push(await analyzeField('neighborhoods', 'description', 'id', 200));

  // Print summary
  console.log('\n📈 SUMMARY');
  console.log('=' .repeat(60));

  for (const analysis of analyses) {
    if (analysis.total === 0) continue;

    console.log(`\n${analysis.table}.${analysis.field}:`);
    console.log(`  Total: ${analysis.total}`);
    console.log(`  HTML Escaped: ${analysis.htmlEscaped} (${Math.round((analysis.htmlEscaped / analysis.total) * 100)}%)`);
    console.log(`  HTML: ${analysis.html} (${Math.round((analysis.html / analysis.total) * 100)}%)`);
    console.log(`  Markdown: ${analysis.markdown} (${Math.round((analysis.markdown / analysis.total) * 100)}%)`);
    console.log(`  Empty: ${analysis.empty} (${Math.round((analysis.empty / analysis.total) * 100)}%)`);
    console.log(`  Unknown: ${analysis.unknown} (${Math.round((analysis.unknown / analysis.total) * 100)}%)`);

    if (analysis.samples.length > 0) {
      console.log(`\n  Samples:`);
      for (const sample of analysis.samples.slice(0, 3)) {
        console.log(`    [${sample.format}] ${sample.preview}...`);
      }
    }
  }

  // Overall statistics
  const total = analyses.reduce((sum, a) => sum + a.total, 0);
  const totalEscaped = analyses.reduce((sum, a) => sum + a.htmlEscaped, 0);
  const totalHTML = analyses.reduce((sum, a) => sum + a.html, 0);
  const totalMarkdown = analyses.reduce((sum, a) => sum + a.markdown, 0);

  console.log('\n📊 OVERALL STATISTICS');
  console.log('=' .repeat(60));
  console.log(`Total records analyzed: ${total}`);
  console.log(`HTML Escaped: ${totalEscaped} (${Math.round((totalEscaped / total) * 100)}%)`);
  console.log(`HTML: ${totalHTML} (${Math.round((totalHTML / total) * 100)}%)`);
  console.log(`Markdown: ${totalMarkdown} (${Math.round((totalMarkdown / total) * 100)}%)`);

  // Recommendation
  console.log('\n💡 RECOMMENDATION');
  console.log('=' .repeat(60));
  if (totalEscaped > total * 0.3) {
    console.log('⚠️  High percentage of HTML-escaped content detected!');
    console.log('   Action required: Run migration script to decode entities.');
  } else if (totalHTML > totalMarkdown) {
    console.log('✅ Most content is HTML format.');
    console.log('   Recommendation: Keep HTML standard, ensure proper sanitization.');
  } else {
    console.log('✅ Most content is Markdown format.');
    console.log('   Recommendation: Use Markdown standard with remark/rehype.');
  }
}

// Run
main().catch(console.error);
