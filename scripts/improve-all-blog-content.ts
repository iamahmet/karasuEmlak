/**
 * Script to analyze and improve all blog articles
 * 
 * Usage: pnpm tsx scripts/improve-all-blog-content.ts
 */

import { createClient } from '@supabase/supabase-js';
import { analyzeContentWithAI, improveContentWithAI } from '../apps/web/lib/services/ai-content-improver';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env files
function loadEnv() {
  const envFiles = [
    join(process.cwd(), '.env.local'),
    join(process.cwd(), '.env'),
    join(process.cwd(), 'apps/web/.env.local'),
    join(process.cwd(), 'apps/web/.env'),
  ];

  for (const envFile of envFiles) {
    try {
      const content = readFileSync(envFile, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      }
    } catch {
      // File doesn't exist, continue
    }
  }
}

// Load env before creating client
loadEnv();

// Create service client directly
function createServiceClient() {
  // Try multiple env variable names
  const supabaseUrl = 
    process.env.SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://lbfimbcvvvbczllhqqlf.supabase.co';
    
  const serviceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZmltYmN2dnZiY3psbGhxcWxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTgyMDQ5OSwiZXhwIjoyMDgxMzk2NDk5fQ.gzQQlg-0iKGeMJe41s-89U1MGvlgSwBIWPGe61Zc2zo';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing required Supabase environment variables.\n' +
      'Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY\n' +
      `SUPABASE_URL: ${supabaseUrl ? 'SET' : 'MISSING'}\n` +
      `SUPABASE_SERVICE_ROLE_KEY: ${serviceRoleKey ? 'SET' : 'MISSING'}\n` +
      '\nPlease check:\n' +
      '- .env.local (root)\n' +
      '- .env (root)\n' +
      '- apps/web/.env.local\n' +
      '- apps/web/.env'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const supabase = createServiceClient();

interface Article {
  id: string;
  title: string;
  content: string;
  slug: string;
}

async function improveAllArticles() {
  console.log('🚀 Blog içeriklerini analiz ve iyileştirme başlatılıyor...\n');

  // Fetch all articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, content, slug')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Makaleler yüklenemedi:', error);
    return;
  }

  if (!articles || articles.length === 0) {
    console.log('⚠️  Yayınlanmış makale bulunamadı');
    return;
  }

  console.log(`📝 ${articles.length} makale bulundu\n`);

  let improvedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const article of articles) {
    try {
      console.log(`\n📄 Analiz ediliyor: ${article.title}`);
      
      // Analyze content
      const analysis = await analyzeContentWithAI(article.content || '', article.title);
      
      console.log(`   Skor: ${analysis.humanLikeScore}/100, AI Olasılığı: ${Math.round(analysis.aiProbability * 100)}%`);
      
      // Only improve if score is low or AI probability is high
      if (analysis.humanLikeScore < 70 || analysis.aiProbability > 0.5) {
        console.log(`   ⚠️  İyileştirme gerekiyor (Skor: ${analysis.humanLikeScore}, AI: ${Math.round(analysis.aiProbability * 100)}%)`);
        
        // Improve content
        const improvement = await improveContentWithAI(article.content || '', article.title, analysis);
        
        if (improvement.score.improvement > 0) {
          // Update article in database
          const { error: updateError } = await supabase
            .from('articles')
            .update({
              content: improvement.improved,
              updated_at: new Date().toISOString(),
            })
            .eq('id', article.id);

          if (updateError) {
            console.error(`   ❌ Güncelleme hatası: ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`   ✅ İyileştirildi: ${improvement.score.before} → ${improvement.score.after} (+${improvement.score.improvement})`);
            improvedCount++;
          }
        } else {
          console.log(`   ⏭️  İyileştirme gerekmiyor`);
          skippedCount++;
        }
      } else {
        console.log(`   ✅ İyi kalite, iyileştirme gerekmiyor`);
        skippedCount++;
      }

      // Rate limiting - wait 2 seconds between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`   ❌ Hata: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n📊 Özet:`);
  console.log(`✅ İyileştirildi: ${improvedCount}`);
  console.log(`⏭️  Atlandı: ${skippedCount}`);
  console.log(`❌ Hata: ${errorCount}`);
  console.log(`\n✨ Tamamlandı!`);
}

// Run
improveAllArticles().catch(console.error);
