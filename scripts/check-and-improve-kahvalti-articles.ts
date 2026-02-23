#!/usr/bin/env tsx

/**
 * Check and Improve Kahvaltı Yerleri Articles
 * 
 * Mevcut kahvaltı yerleri yazılarını kontrol eder ve gerekirse iyileştirir:
 * 1. İçerik kalite skorlarını kontrol eder
 * 2. Düşük kaliteli içerikleri iyileştirir
 * 3. Eksik FAQ ekler
 * 4. İç linklemeyi güçlendirir
 * 5. SEO optimizasyonları yapar
 */

import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gerekli!");
  process.exit(1);
}

if (!geminiApiKey && !openaiApiKey) {
  console.error("❌ GEMINI_API_KEY veya OPENAI_API_KEY gerekli!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_description?: string;
  keywords?: string[];
  seo_score?: number;
  category?: string;
  status: string;
}

interface QualityReport {
  score: number;
  issues: Array<{
    type: string;
    severity: string;
    message: string;
    suggestion: string;
  }>;
  suggestions: string[];
  needsImprovement: boolean;
}

/**
 * Fetch kahvaltı articles
 */
async function fetchKahvaltiArticles(): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("id, title, slug, content, excerpt, meta_description, keywords, seo_score, category, status")
    .or("title.ilike.%kahvaltı%,title.ilike.%kahvalti%,slug.ilike.%kahvaltı%,slug.ilike.%kahvalti%")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching articles:", error);
    return [];
  }

  return data || [];
}

/**
 * Check content quality
 */
async function checkContentQuality(article: Article): Promise<QualityReport> {
  const cleanContent = article.content.replace(/<[^>]*>/g, ' ').trim();
  const wordCount = cleanContent.split(/\s+/).filter(w => w.length > 0).length;
  
  const issues: QualityReport['issues'] = [];
  const suggestions: string[] = [];
  let score = article.seo_score || 70;

  // Check word count
  if (wordCount < 1000 && (article.category === 'Rehber' || article.category?.toLowerCase().includes('rehber'))) {
    issues.push({
      type: 'word-count',
      severity: 'high',
      message: `Cornerstone makale için yetersiz kelime sayısı: ${wordCount} (minimum 2000 önerilir)`,
      suggestion: 'İçeriği genişletin, daha fazla detay ekleyin'
    });
    score -= 20;
  } else if (wordCount < 500 && article.category === 'Blog') {
    issues.push({
      type: 'word-count',
      severity: 'medium',
      message: `Blog yazısı için yetersiz kelime sayısı: ${wordCount} (minimum 1000 önerilir)`,
      suggestion: 'İçeriği genişletin'
    });
    score -= 10;
  }

  // Check meta description
  if (!article.meta_description || article.meta_description.length < 120) {
    issues.push({
      type: 'seo',
      severity: 'medium',
      message: 'Meta description eksik veya çok kısa',
      suggestion: '120-160 karakter arası SEO-friendly meta description ekleyin'
    });
    score -= 5;
  }

  // Check excerpt
  if (!article.excerpt || article.excerpt.length < 100) {
    issues.push({
      type: 'content',
      severity: 'low',
      message: 'Excerpt eksik veya çok kısa',
      suggestion: '150-200 kelimelik excerpt ekleyin'
    });
    score -= 3;
  }

  // Check keywords
  if (!article.keywords || article.keywords.length === 0) {
    issues.push({
      type: 'seo',
      severity: 'medium',
      message: 'SEO keywords eksik',
      suggestion: '5-10 adet anahtar kelime ekleyin'
    });
    score -= 5;
  }

  // Check for AI patterns
  const aiPatterns = [
    'sonuç olarak',
    'özetlemek gerekirse',
    'bu makalede',
    'bu yazıda',
    'in conclusion',
    'furthermore',
    'moreover',
  ];
  
  const contentLower = cleanContent.toLowerCase();
  const foundPatterns = aiPatterns.filter(pattern => contentLower.includes(pattern));
  
  if (foundPatterns.length > 0) {
    issues.push({
      type: 'ai-pattern',
      severity: 'medium',
      message: `${foundPatterns.length} AI pattern tespit edildi: ${foundPatterns.join(', ')}`,
      suggestion: 'Bu ifadeleri daha doğal alternatiflerle değiştirin'
    });
    score -= 10;
  }

  // Check internal links
  const internalLinksMatch = article.content.match(/href=["']\/[^"']+["']/g);
  const internalLinksCount = internalLinksMatch ? internalLinksMatch.length : 0;
  
  if (internalLinksCount < 3) {
    issues.push({
      type: 'internal-links',
      severity: 'low',
      message: `Yetersiz iç link: ${internalLinksCount} (minimum 3-5 önerilir)`,
      suggestion: 'İlgili sayfalara daha fazla iç link ekleyin'
    });
    score -= 5;
  }

  // Check FAQ
  const { data: faqData } = await supabase
    .from('ai_questions')
    .select('id')
    .eq('page_slug', article.slug)
    .eq('status', 'published');

  if (!faqData || faqData.length < 3) {
    issues.push({
      type: 'faq',
      severity: 'low',
      message: `Yetersiz FAQ: ${faqData?.length || 0} (minimum 3-5 önerilir)`,
      suggestion: 'İçerikle ilgili FAQ soruları ekleyin'
    });
    score -= 3;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues,
    suggestions,
    needsImprovement: score < 75 || issues.some(i => i.severity === 'high'),
  };
}

/**
 * Improve content using AI
 */
async function improveContent(article: Article, qualityReport: QualityReport): Promise<{
  content?: string;
  meta_description?: string;
  excerpt?: string;
  keywords?: string[];
}> {
  if (!openai) {
    return {};
  }

  const improvements: any = {};

  // Improve content if needed
  if (qualityReport.issues.some(i => i.type === 'ai-pattern' || i.type === 'word-count')) {
    console.log('   🤖 İçerik iyileştiriliyor...');
    
    const prompt = `Aşağıdaki blog yazısını iyileştir. Şu sorunları düzelt:
${qualityReport.issues.filter(i => i.type === 'ai-pattern' || i.type === 'word-count').map(i => `- ${i.message}: ${i.suggestion}`).join('\n')}

Mevcut İçerik:
${article.content.substring(0, 3000)}${article.content.length > 3000 ? '...' : ''}

Gereksinimler:
1. AI pattern'leri kaldır ("sonuç olarak", "özetlemek gerekirse" gibi)
2. İçeriği daha doğal ve özgün hale getir
3. ${article.category === 'Rehber' || article.category?.toLowerCase().includes('rehber') ? 'Minimum 2000 kelime' : 'Minimum 1000 kelime'} olacak şekilde genişlet
4. Yerel bilgiler ekle (Karasu, Kocaali)
5. Karasu Emlak ile mantıklı bağlantılar kur

Sadece iyileştirilmiş içeriği HTML formatında döndür (başlıklar, paragraflar, listeler dahil).`;

    try {
      const completion = await openai.chat.completions.create({
        model: article.category === 'Rehber' || article.category?.toLowerCase().includes('rehber') ? 'gpt-4o' : 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sen Karasu\'da 15 yıldır hizmet veren profesyonel bir emlak danışmanısın. İçerikleri iyileştiriyorsun.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: article.category === 'Rehber' || article.category?.toLowerCase().includes('rehber') ? 8000 : 4000,
      });

      improvements.content = completion.choices[0]?.message?.content?.trim() || article.content;
    } catch (error: any) {
      console.warn(`   ⚠️  İçerik iyileştirme hatası: ${error.message}`);
    }
  }

  // Generate meta description if missing
  if (qualityReport.issues.some(i => i.type === 'seo' && i.message.includes('meta'))) {
    console.log('   📝 Meta description oluşturuluyor...');
    
    const prompt = `Aşağıdaki blog yazısı için SEO-friendly meta açıklama oluştur (120-155 karakter):

Başlık: ${article.title}
İçerik: ${article.content.substring(0, 500)}

Meta açıklama:
- 120-155 karakter arası
- Anahtar kelime içermeli
- Çekici ve bilgilendirici
- Doğal Türkçe

Sadece meta açıklamayı döndür, başka açıklama yapma.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sen bir SEO uzmanısın. Kısa, çekici meta açıklamalar oluşturuyorsun.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      improvements.meta_description = completion.choices[0]?.message?.content?.trim() || article.meta_description;
    } catch (error: any) {
      console.warn(`   ⚠️  Meta description hatası: ${error.message}`);
    }
  }

  // Generate excerpt if missing
  if (qualityReport.issues.some(i => i.type === 'content' && i.message.includes('excerpt'))) {
    console.log('   📄 Excerpt oluşturuluyor...');
    
    const prompt = `Aşağıdaki blog yazısı için 150-200 kelimelik excerpt oluştur:

Başlık: ${article.title}
İçerik: ${article.content.substring(0, 1000)}

Excerpt:
- 150-200 kelime
- İçeriğin özeti
- Çekici ve bilgilendirici
- Doğal Türkçe

Sadece excerpt'i döndür, başka açıklama yapma.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sen bir içerik uzmanısın. Özetler oluşturuyorsun.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      improvements.excerpt = completion.choices[0]?.message?.content?.trim() || article.excerpt;
    } catch (error: any) {
      console.warn(`   ⚠️  Excerpt hatası: ${error.message}`);
    }
  }

  // Generate keywords if missing
  if (qualityReport.issues.some(i => i.type === 'seo' && i.message.includes('keywords'))) {
    console.log('   🔑 Keywords oluşturuluyor...');
    
    const prompt = `Aşağıdaki blog yazısı için SEO anahtar kelimeleri oluştur (5-10 kelime):

Başlık: ${article.title}
İçerik: ${article.content.substring(0, 500)}

Anahtar kelimeler:
- 5-10 adet
- SEO-friendly
- İçerikle ilgili
- Yerel (Karasu, Kocaali) odaklı

JSON formatında döndür:
{
  "keywords": ["kelime1", "kelime2", "kelime3"]
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Sen bir SEO uzmanısın. Anahtar kelimeler oluşturuyorsun.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const response = completion.choices[0]?.message?.content || '{}';
      const parsed = JSON.parse(response);
      improvements.keywords = parsed.keywords || article.keywords || [];
    } catch (error: any) {
      console.warn(`   ⚠️  Keywords hatası: ${error.message}`);
    }
  }

  return improvements;
}

/**
 * Add missing FAQs
 */
async function addMissingFAQs(article: Article): Promise<void> {
  // Check existing FAQs
  const { data: existingFAQs } = await supabase
    .from('ai_questions')
    .select('id')
    .eq('page_slug', article.slug)
    .eq('status', 'published');

  const faqCount = existingFAQs?.length || 0;
  
  if (faqCount >= 5) {
    console.log(`   ✅ Yeterli FAQ mevcut (${faqCount})`);
    return;
  }

  const neededCount = 5 - faqCount;
  console.log(`   ❓ ${neededCount} adet FAQ ekleniyor...`);

  if (!openai) {
    return;
  }

  const prompt = `Aşağıdaki blog yazısı için ${neededCount} adet SEO-friendly FAQ sorusu ve cevabı oluştur:

Başlık: ${article.title}
İçerik: ${article.content.substring(0, 1000)}

FAQ Gereksinimleri:
- Sorular doğal dilde, arama motorlarında aranabilecek şekilde
- Cevaplar 40-70 kelime arası, kısa ve net
- Karasu/Kocaali odaklı
- Emlak bağlantılı

JSON formatında döndür:
{
  "faq": [
    {"question": "Soru 1", "answer": "Cevap 1"},
    {"question": "Soru 2", "answer": "Cevap 2"}
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sen bir emlak uzmanısın. FAQ soruları oluşturuyorsun.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(response);
    const faqs = parsed.faq || [];

    for (const faq of faqs.slice(0, neededCount)) {
      try {
        await supabase.from('ai_questions').insert({
          question: faq.question,
          answer: faq.answer,
          location_scope: 'karasu',
          page_type: 'blog',
          page_slug: article.slug,
          priority: 'medium',
          status: 'published',
          generated_by_ai: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log(`   ✅ FAQ eklendi: ${faq.question.substring(0, 50)}...`);
      } catch (error: any) {
        console.warn(`   ⚠️  FAQ ekleme hatası: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.warn(`   ⚠️  FAQ oluşturma hatası: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  console.log("🔍 Kahvaltı Yerleri Yazıları Kontrol Ediliyor...\n");

  const articles = await fetchKahvaltiArticles();
  console.log(`📚 Toplam ${articles.length} yazı bulundu\n`);

  let improved = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of articles) {
    console.log(`\n📝 "${article.title}"`);
    console.log(`   📍 Slug: ${article.slug}`);
    
    try {
      // Check quality
      const qualityReport = await checkContentQuality(article);
      
      console.log(`   📊 Kalite Skoru: ${qualityReport.score}/100`);
      
      if (qualityReport.issues.length > 0) {
        console.log(`   ⚠️  ${qualityReport.issues.length} sorun tespit edildi:`);
        qualityReport.issues.forEach(issue => {
          console.log(`      - [${issue.severity.toUpperCase()}] ${issue.message}`);
        });
      }

      if (!qualityReport.needsImprovement) {
        console.log(`   ✅ İyileştirme gerekmiyor`);
        skipped++;
        continue;
      }

      // Improve content
      console.log(`   🔧 İyileştirmeler yapılıyor...`);
      const improvements = await improveContent(article, qualityReport);

      // Update article
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (improvements.content) {
        updateData.content = improvements.content;
      }
      if (improvements.meta_description) {
        updateData.meta_description = improvements.meta_description;
      }
      if (improvements.excerpt) {
        updateData.excerpt = improvements.excerpt;
      }
      if (improvements.keywords) {
        updateData.keywords = improvements.keywords;
      }

      // Recalculate SEO score
      const newQualityReport = await checkContentQuality({
        ...article,
        ...improvements,
      });
      updateData.seo_score = newQualityReport.score;

      const { error: updateError } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', article.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`   ✅ İyileştirildi (Yeni skor: ${newQualityReport.score}/100)`);

      // Add missing FAQs
      await addMissingFAQs(article);

      improved++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      console.error(`   ❌ Hata: ${error.message}`);
      errors++;
    }
  }

  // Summary
  console.log("\n📊 Özet:");
  console.log(`   ✅ İyileştirildi: ${improved}`);
  console.log(`   ⏭️  Atlandı: ${skipped}`);
  console.log(`   ❌ Hata: ${errors}`);
  console.log(`   📁 Toplam: ${articles.length}\n`);
}

// Run
main()
  .then(() => {
    console.log("✅ Kontrol tamamlandı.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script hatası:", error);
    process.exit(1);
  });
