/**
 * Enhanced SSS Generator
 * 
 * Generates comprehensive FAQ questions using OpenAI
 * Includes questions from live site and creates new ones
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

// Questions from live site (https://www.karasuemlak.net/sss)
const liveSiteQuestions = [
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
    question: 'Karasu\'da hangi bölgeler yatırım için uygundur?',
    category: 'yatirim' as const,
    priority: 'high' as const,
  },
  {
    question: 'Tapu işlemleri ne kadar sürer?',
    category: 'bilgi' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Kredi başvurusu için gerekli belgeler nelerdir?',
    category: 'bilgi' as const,
    priority: 'medium' as const,
  },
  {
    question: 'Karasu\'da ev fiyatları nasıl belirlenir?',
    category: 'bilgi' as const,
    priority: 'high' as const,
  },
  {
    question: 'Denize yakın evler daha pahalı mı?',
    category: 'karsilastirma' as const,
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
 * Generate comprehensive FAQ questions using OpenAI
 */
async function generateFAQQuestions(): Promise<FAQQuestion[]> {
  console.log('🤖 Generating FAQ questions with OpenAI...\n');

  const prompt = `Sen bir emlak danışmanısın. Karasu ve Kocaali bölgelerinde faaliyet gösteren bir emlak ofisi için kapsamlı SSS (Sık Sorulan Sorular) listesi oluştur.

Kategoriler:
- bilgi: Genel bilgilendirme soruları
- karsilastirma: Karşılaştırma soruları
- karar_verme: Karar verme sürecine yardımcı sorular
- risk: Risk ve dikkat edilmesi gerekenler
- yatirim: Yatırım odaklı sorular
- hukuki: Hukuki süreçler ve belgeler
- finansman: Kredi, finansman, ödeme planları
- kiralama: Kiralama süreçleri ve koşulları

Her kategori için 5-8 adet gerçekçi, SEO-friendly soru ve detaylı cevap oluştur. Sorular:
- Doğal dilde, arama motorlarında aranabilecek şekilde
- Yerel (Karasu/Kocaali) odaklı
- Pratik ve faydalı
- 150-300 kelime arası detaylı cevaplar

JSON formatında döndür:
[
  {
    "question": "Soru metni",
    "answer": "Detaylı cevap (150-300 kelime)",
    "category": "kategori",
    "priority": "high|medium|low",
    "tags": ["tag1", "tag2"]
  }
]`;

  try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen bir emlak danışmanısın. Karasu ve Kocaali bölgelerinde faaliyet gösteren bir emlak ofisi için kapsamlı SSS listesi oluşturuyorsun. JSON formatında yanıt ver. Her kategori için 5-8 soru oluştur.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      // Handle both {questions: [...]} and direct array
      const questions = Array.isArray(parsed) ? parsed : (parsed.questions || Object.values(parsed).flat());

    console.log(`✅ Generated ${questions.length} FAQ questions\n`);
    return questions;
  } catch (error: any) {
    console.error('❌ Error generating FAQ questions:', error.message);
    return [];
  }
}

/**
 * Generate answers for live site questions
 */
async function generateAnswersForLiveQuestions(): Promise<FAQQuestion[]> {
  console.log('📝 Generating answers for live site questions...\n');

  const questionsWithAnswers: FAQQuestion[] = [];

  for (const q of liveSiteQuestions) {
    const prompt = `Aşağıdaki emlak sorusuna detaylı, SEO-friendly, 150-300 kelime arası bir cevap ver. Cevap Karasu/Kocaali bölgesine özel olmalı ve pratik bilgiler içermeli.

Soru: ${q.question}

Cevap:`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Sen bir emlak danışmanısın. Karasu ve Kocaali bölgelerinde faaliyet gösteren bir emlak ofisi için detaylı, SEO-friendly cevaplar veriyorsun.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const answer = response.choices[0]?.message?.content?.trim() || '';

      questionsWithAnswers.push({
        question: q.question,
        answer,
        category: q.category,
        priority: q.priority,
        tags: ['karasu', 'emlak'],
      });

      console.log(`  ✅ Generated answer for: ${q.question.substring(0, 50)}...`);
    } catch (error: any) {
      console.error(`  ❌ Error generating answer for "${q.question}":`, error.message);
    }
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
        .single();

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
          region: 'karasu', // Default to karasu, can be updated later
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
  console.log('🚀 Starting Enhanced SSS Generation...\n');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    // Step 1: Generate answers for live site questions
    const liveQuestionsWithAnswers = await generateAnswersForLiveQuestions();

    // Step 2: Generate new comprehensive FAQ questions
    const newQuestions = await generateFAQQuestions();

    // Step 3: Combine all questions
    const allQuestions = [...liveQuestionsWithAnswers, ...newQuestions];

    console.log(`\n📋 Total questions: ${allQuestions.length}\n`);

    // Step 4: Insert into database
    await insertFAQQuestions(allQuestions);

    console.log('✅ Enhanced SSS generation completed!\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main, generateFAQQuestions, generateAnswersForLiveQuestions };
