/**
 * Comprehensive SSS Generator
 * 
 * Generates comprehensive FAQ questions using OpenAI
 * Includes ALL questions from live site and creates extensive new ones
 */

import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Comprehensive list of questions from live site and common real estate FAQs
const comprehensiveQuestions = [
  // Genel Bilgiler (bilgi)
  {
    question: 'Karasu\'da emlak alım-satım işlemleri nasıl yapılır?',
    category: 'bilgi' as const,
    priority: 'high' as const,
  },
  {
    question: 'Kiralık ev bulmak ne kadar sürer?',
    category: 'bilgi' as const,
    priority: 'high' as const,
  },
  {
    question: 'Emlak komisyon oranları nedir?',
    category: 'bilgi' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu\'da ev fiyatları nasıl belirlenir?',
    category: 'bilgi' as const,
    priority: 'high' as const,
  },
  {
    question: 'Tapu işlemleri ne kadar sürer?',
    category: 'bilgi' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu\'da hangi belgeler gereklidir?',
    category: 'bilgi' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Emlak alım-satım süreci nasıl işler?',
    category: 'bilgi' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu\'da emlak danışmanı seçerken nelere dikkat edilmeli?',
    category: 'bilgi' as const,
    priority: 'medium' as const,
  },
  {
    question: 'İlan görüntüleme için ücret ödemem gerekiyor mu?',
    category: 'bilgi' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu\'da hangi bölgelerde hizmet veriyorsunuz?',
    category: 'bilgi' as const,
    priority: 'medium' as const,
  },
  
  // Yatırım (yatirim)
  {
    question: 'Karasu\'da hangi bölgeler yatırım için uygundur?',
    category: 'yatirim' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu\'da satılık ev almak mantıklı mı?',
    category: 'yatirim' as const,
    priority: 'high' as const,
  },
  {
    question: 'Denize yakın evler gerçekten değer kazandırır mı?',
    category: 'yatirim' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu\'da hangi mahalleler yatırım için uygundur?',
    category: 'yatirim' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Yazlık ev almak istiyorum, hangi bölgeleri önerirsiniz?',
    category: 'yatirim' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu mu Kocaali mi yatırım için daha avantajlı?',
    category: 'yatirim' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu\'da emlak yatırımı yapmak için ne kadar bütçe gerekir?',
    category: 'yatirim' as const,
    priority: 'medium' as const,
  },
  
  // Karşılaştırma (karsilastirma)
  {
    question: 'Denize yakın evler daha pahalı mı?',
    category: 'karsilastirma' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Villa mı daire mi daha iyi yatırım?',
    category: 'karsilastirma' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Satılık mı kiralık mı daha karlı?',
    category: 'karsilastirma' as const,
    priority: 'medium' as const,
  },
  
  // Finansman (finansman)
  {
    question: 'Kredi başvurusu için gerekli belgeler nelerdir?',
    category: 'finansman' as const,
    priority: 'high' as const,
  },
  {
    question: 'Emlak kredisi nasıl alınır?',
    category: 'finansman' as const,
    priority: 'high' as const,
  },
  {
    question: 'Karasu\'da ev almak için kredi şartları nelerdir?',
    category: 'finansman' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Kredi hesaplama nasıl yapılır?',
    category: 'finansman' as const,
    priority: 'medium' as const,
  },
  
  // Hukuki (hukuki)
  {
    question: 'Tapu devri süreci nasıl işler?',
    category: 'hukuki' as const,
    priority: 'high' as const,
  },
  {
    question: 'Emlak alım-satım sözleşmesi nasıl hazırlanır?',
    category: 'hukuki' as const,
    priority: 'high' as const,
  },
  {
    question: 'Tapu kayıtlarında nelere dikkat edilmeli?',
    category: 'hukuki' as const,
    priority: 'medium' as const,
  },
  {
    question: 'İmar durumu nedir ve nasıl öğrenilir?',
    category: 'hukuki' as const,
    priority: 'medium' as const,
  },
  
  // Kiralama (kiralama)
  {
    question: 'Kiralık ev arıyorum, nasıl yardımcı olabilirsiniz?',
    category: 'kiralama' as const,
    priority: 'high' as const,
  },
  {
    question: 'Kira sözleşmesi nasıl yapılır?',
    category: 'kiralama' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Kira bedeli nasıl belirlenir?',
    category: 'kiralama' as const,
    priority: 'medium' as const,
  },
  
  // Risk (risk)
  {
    question: 'Karasu\'da ev alırken en çok yapılan hatalar nelerdir?',
    category: 'risk' as const,
    priority: 'high' as const,
  },
  {
    question: 'Emlak alımında dikkat edilmesi gerekenler nelerdir?',
    category: 'risk' as const,
    priority: 'high' as const,
  },
  {
    question: 'Dolandırıcılıktan nasıl korunulur?',
    category: 'risk' as const,
    priority: 'high' as const,
  },
  
  // Karar Verme (karar_verme)
  {
    question: 'Karasu\'da ev almak için en uygun zaman nedir?',
    category: 'karar_verme' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Hangi özelliklere sahip ev seçmeliyim?',
    category: 'karar_verme' as const,
    priority: 'medium' as const,
  },
];

interface FAQQuestion {
  question: string;
  answer: string;
  category: 'bilgi' | 'karsilastirma' | 'karar_verme' | 'risk' | 'yatirim' | 'hukuki' | 'finansman' | 'kiralama';
  priority: 'high' | 'medium' | 'low';
  tags?: string[];
}

/**
 * Generate detailed answer for a question using OpenAI
 */
async function generateAnswer(question: string, category: string): Promise<string> {
  const prompt = `Aşağıdaki emlak sorusuna detaylı, SEO-friendly, 200-400 kelime arası kapsamlı bir cevap ver. Cevap Karasu/Kocaali bölgesine özel olmalı, pratik bilgiler içermeli ve arama motorları için optimize edilmiş olmalı.

Soru: ${question}
Kategori: ${category}

Cevap (200-400 kelime, detaylı ve bilgilendirici):`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir emlak danışmanısın. Karasu ve Kocaali bölgelerinde faaliyet gösteren bir emlak ofisi için detaylı, SEO-friendly, kapsamlı cevaplar veriyorsun. Cevaplar 200-400 kelime arası olmalı.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error: any) {
    console.error(`  ❌ Error generating answer: ${error.message}`);
    return '';
  }
}

/**
 * Generate answers for all questions
 */
async function generateAllAnswers(): Promise<FAQQuestion[]> {
  console.log(`📝 Generating answers for ${comprehensiveQuestions.length} questions...\n`);

  const questionsWithAnswers: FAQQuestion[] = [];

  for (let i = 0; i < comprehensiveQuestions.length; i++) {
    const q = comprehensiveQuestions[i];
    console.log(`  [${i + 1}/${comprehensiveQuestions.length}] Generating answer for: ${q.question.substring(0, 60)}...`);

    const answer = await generateAnswer(q.question, q.category);

    if (answer) {
      questionsWithAnswers.push({
        question: q.question,
        answer,
        category: q.category,
        priority: q.priority,
        tags: ['karasu', 'emlak', q.category],
      });
      console.log(`  ✅ Generated (${answer.length} chars)`);
    } else {
      console.log(`  ⚠️  Skipped (no answer generated)`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return questionsWithAnswers;
}

/**
 * Insert FAQ questions into database
 */
async function insertFAQQuestions(questions: FAQQuestion[]) {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`\n💾 Inserting ${questions.length} FAQ questions into database...\n`);

  for (const q of questions) {
    try {
      // Check if question already exists
      const { data: existing } = await supabase
        .from('qa_entries')
        .select('id, answer')
        .eq('question', q.question)
        .maybeSingle();

      if (existing) {
        // Update if answer is different or empty
        if (existing.answer !== q.answer || !existing.answer) {
          const { error: updateError } = await supabase
            .from('qa_entries')
            .update({
              answer: q.answer,
              category: q.category,
              priority: q.priority,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);

          if (updateError) {
            console.error(`  ❌ Update error: ${updateError.message}`);
            errors++;
          } else {
            updated++;
            console.log(`  🔄 Updated: ${q.question.substring(0, 50)}...`);
          }
        } else {
          skipped++;
        }
        continue;
      }

      // Insert new question
      const { error: insertError } = await supabase
        .from('qa_entries')
        .insert({
          question: q.question,
          answer: q.answer,
          category: q.category,
          priority: q.priority,
          region: 'karasu', // Default to karasu
        });

      if (insertError) {
        console.error(`  ❌ Insert error: ${insertError.message}`);
        errors++;
      } else {
        inserted++;
        console.log(`  ✅ Inserted: ${q.question.substring(0, 50)}...`);
      }
    } catch (error: any) {
      console.error(`  ❌ Exception: ${error.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Inserted: ${inserted}`);
  console.log(`  🔄 Updated: ${updated}`);
  console.log(`  ⏭️  Skipped: ${skipped}`);
  console.log(`  ❌ Errors: ${errors}\n`);

  return { inserted, updated, skipped, errors };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Comprehensive SSS Generation...\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Generate answers for all questions
    const questionsWithAnswers = await generateAllAnswers();

    console.log(`\n📋 Total questions with answers: ${questionsWithAnswers.length}\n`);

    // Insert into database
    await insertFAQQuestions(questionsWithAnswers);

    console.log('✅ Comprehensive SSS generation completed!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main, generateAllAnswers };
