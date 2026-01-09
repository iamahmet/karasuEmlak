#!/usr/bin/env tsx
/**
 * Content Quality Improvement Script
 * 
 * This script automatically improves content based on audit findings:
 * 1. Adds missing meta descriptions
 * 2. Generates SEO keywords
 * 3. Expands short content (using Flagship Content prompt for 1500+ words)
 * 4. Suggests FAQ sections
 * 5. Suggests internal links
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

interface ImprovementTask {
  id: string;
  type: 'article' | 'news' | 'listing';
  title: string;
  slug: string;
  task: 'meta' | 'keywords' | 'expand' | 'faq' | 'links';
  priority: number;
}

/**
 * Load audit report
 */
function loadAuditReport(): any {
  const fs = require('fs');
  const path = require('path');
  const reportPath = path.join(process.cwd(), 'CONTENT_AUDIT_REPORT.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ CONTENT_AUDIT_REPORT.json not found. Run content:audit first.');
    process.exit(1);
  }
  
  return JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
}

/**
 * Generate meta description
 */
async function generateMetaDescription(title: string, content: string): Promise<string> {
  const prompt = `Aşağıdaki içerik için SEO-friendly meta açıklama oluştur (120-155 karakter):

Başlık: ${title}
İçerik: ${content.substring(0, 500)}

Meta açıklama:
- 120-155 karakter arası
- Anahtar kelime içermeli
- Çekici ve bilgilendirici
- Doğal Türkçe

Sadece meta açıklamayı döndür, başka açıklama yapma.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Sen bir SEO uzmanısın. Kısa, çekici meta açıklamalar oluşturuyorsun.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}

/**
 * Generate SEO keywords
 */
async function generateKeywords(title: string, content: string): Promise<string[]> {
  const prompt = `Aşağıdaki içerik için SEO anahtar kelimeleri oluştur (5-8 kelime):

Başlık: ${title}
İçerik: ${content.substring(0, 500)}

Anahtar kelimeler:
- Virgülle ayrılmış
- İlgili ve semantik
- Yerel kelimeler varsa ekle (Karasu, Kocaali, mahalle adı)
- Zorlama anahtar kelime kullanma

Sadece kelimeleri virgülle ayrılmış liste halinde döndür, başka açıklama yapma.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Sen bir SEO uzmanısın. Doğal, semantik anahtar kelimeler öneriyorsun.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  const keywords = completion.choices[0]?.message?.content?.trim() || '';
  return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

/**
 * Expand short content using Flagship Content prompt
 */
async function expandContent(
  type: string,
  title: string,
  currentContent: string,
  targetWords: number = 1500
): Promise<string> {
  const { FLAGSHIP_CONTENT_PROMPT } = await import('../../apps/admin/lib/prompts/editorial-optimizer');
  
  const topicWords = title.split(' ').slice(0, 3).join(' ');
  const systemPrompt = FLAGSHIP_CONTENT_PROMPT.replace(/\[TOPIC\]/g, title).replace(/\[KEYWORD\]/g, topicWords);
  
  const prompt = `Mevcut içeriği genişlet ve geliştir. Minimum ${targetWords} kelime olmalı.

Mevcut İçerik:
${currentContent.substring(0, 1000)}

Gereksinimler:
- Minimum ${targetWords} kelime
- 10-15 alt başlık (H2/H3)
- Her H2 bölümü 300-500 kelime
- FAQ bölümü ekle (5 soru-cevap)
- İç link önerileri belirt
- Görsel önerileri ekle
- Anti-AI ton: "In conclusion", "Furthermore" gibi ifadeler KULLANMA
- Doğal, konuşma tonu: "By the way", "Honestly", "Let's see" gibi geçişler kullan

Sadece genişletilmiş içeriği HTML formatında döndür (H2, H3, <p>, <ul><li>).`;

  const completion = await openai.chat.completions.create({
    model: targetWords >= 1500 ? 'gpt-4o' : 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: targetWords >= 1500 ? 8000 : 4000,
  });

  return completion.choices[0]?.message?.content || currentContent;
}

/**
 * Generate FAQ section
 */
async function generateFAQ(title: string, content: string): Promise<Array<{ question: string; answer: string }>> {
  const prompt = `Aşağıdaki içerik için 5 adet "People Also Ask" tarzı FAQ oluştur:

Başlık: ${title}
İçerik: ${content.substring(0, 1500)}

FAQ Formatı:
- Her soru gerçek kullanıcı soruları gibi olmalı
- Cevaplar 40-90 kelime arası
- Doğal Türkçe
- İçeriğe uygun

JSON formatında döndür:
[
  {"question": "Soru 1", "answer": "Cevap 1"},
  {"question": "Soru 2", "answer": "Cevap 2"},
  ...
]

Sadece JSON döndür, başka açıklama yapma.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Sen bir içerik editörüsün. Kullanıcı sorularına uygun FAQ oluşturuyorsun.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  try {
    const response = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(response);
    return parsed.faq || parsed || [];
  } catch {
    return [];
  }
}

/**
 * Main improvement function
 */
async function improveContent() {
  console.log('🚀 Starting content quality improvement...\n');
  
  const report = loadAuditReport();
  const tasks: ImprovementTask[] = [];
  
  // Create improvement tasks
  for (const item of report.content) {
    if (item.score < 60) {
      // Priority: lower score = higher priority
      const priority = 100 - item.score;
      
      if (!item.hasMetaDescription) {
        tasks.push({
          id: item.id,
          type: item.type,
          title: item.title,
          slug: item.slug,
          task: 'meta',
          priority,
        });
      }
      
      if (!item.hasKeywords) {
        tasks.push({
          id: item.id,
          type: item.type,
          title: item.title,
          slug: item.slug,
          task: 'keywords',
          priority,
        });
      }
      
      if (item.wordCount < 300) {
        tasks.push({
          id: item.id,
          type: item.type,
          title: item.title,
          slug: item.slug,
          task: 'expand',
          priority: priority + 20, // Higher priority for short content
        });
      }
      
      if (!item.hasFAQ) {
        tasks.push({
          id: item.id,
          type: item.type,
          title: item.title,
          slug: item.slug,
          task: 'faq',
          priority,
        });
      }
    }
  }
  
  // Sort by priority
  tasks.sort((a, b) => b.priority - a.priority);
  
  // Process all tasks (or limit based on argument)
  const limit = process.argv.includes('--limit') 
    ? parseInt(process.argv[process.argv.indexOf('--limit') + 1]) || 20
    : tasks.length; // Process all by default
  
  console.log(`📋 Found ${tasks.length} improvement tasks`);
  console.log(`   Processing ${limit === tasks.length ? 'ALL' : limit} tasks\n`);
  
  const topTasks = tasks.slice(0, limit);
  let improved = 0;
  let errors = 0;
  
  console.log(`📋 Processing ${topTasks.length} tasks (out of ${tasks.length} total)\n`);
  
  for (const task of topTasks) {
    try {
      console.log(`\n🔧 Improving: ${task.title.substring(0, 50)}... (${task.task})`);
      
      // Get current content
      let table = '';
      let selectFields = '';
      let updateFields: any = {};
      
      switch (task.type) {
        case 'article':
          table = 'articles';
          selectFields = 'content, meta_description, keywords';
          break;
        case 'news':
          table = 'news_articles';
          selectFields = 'original_summary, emlak_analysis, seo_description, seo_keywords';
          break;
        case 'listing':
          table = 'listings';
          selectFields = 'description_long';
          break;
      }
      
      const { data, error: fetchError } = await supabase
        .from(table)
        .select(selectFields)
        .eq('id', task.id)
        .single();
      
      if (fetchError || !data) {
        console.log(`   ⚠️  Could not fetch content`);
        errors++;
        continue;
      }
      
      const content = task.type === 'news' 
        ? (data.original_summary || '') + ' ' + (data.emlak_analysis || '')
        : data.content || data.description_long || '';
      
      // Perform improvement
      if (task.task === 'meta') {
        const meta = await generateMetaDescription(task.title, content);
        if (meta) {
          if (task.type === 'news') {
            updateFields.seo_description = meta;
          } else {
            updateFields.meta_description = meta;
          }
        }
      } else if (task.task === 'keywords') {
        const keywords = await generateKeywords(task.title, content);
        if (keywords.length > 0) {
          if (task.type === 'news') {
            updateFields.seo_keywords = keywords;
          } else {
            updateFields.keywords = keywords;
          }
        }
      } else if (task.task === 'expand') {
        const expanded = await expandContent(task.type, task.title, content, 1500);
        if (expanded && expanded.length > content.length) {
          if (task.type === 'news') {
            updateFields.emlak_analysis = expanded;
            updateFields.emlak_analysis_generated = true;
          } else if (task.type === 'listing') {
            updateFields.description_long = expanded;
            updateFields.description_generated = true;
          } else {
            updateFields.content = expanded;
          }
        }
      } else if (task.task === 'faq') {
        const faq = await generateFAQ(task.title, content);
        if (faq.length > 0) {
          // Store FAQ in internal_links or create FAQ field
          updateFields.internal_links = JSON.stringify(faq);
        }
      }
      
      // Update database
      if (Object.keys(updateFields).length > 0) {
        updateFields.updated_at = new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from(table)
          .update(updateFields)
          .eq('id', task.id);
        
        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`);
          errors++;
        } else {
          console.log(`   ✅ Improved successfully`);
          improved++;
        }
      }
      
      // Rate limiting (reduced for faster processing)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      errors++;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('IMPROVEMENT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Improved: ${improved}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📋 Remaining tasks: ${tasks.length - topTasks.length}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (tasks.length > topTasks.length) {
    console.log(`💡 Run again to process more tasks (${tasks.length - topTasks.length} remaining)`);
  }
}

// Run
improveContent().catch(console.error);
