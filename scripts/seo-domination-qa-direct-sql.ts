/**
 * SEO Domination Q&A Generator - Direct SQL Version
 * 
 * Uses MCP Supabase to insert Q&As directly via SQL
 * to bypass schema cache issues.
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY in .env.local');
}

/**
 * AI Q&A BLOCKS (20 blocks, 40-70 words)
 */
const qaBlocks = [
  {
    question: "Karasu'da ev almak mantıklı mı?",
    location_scope: 'karasu',
    page_type: 'pillar',
    priority: 'high',
  },
  {
    question: "Karasu yatırım için uygun mu?",
    location_scope: 'karasu',
    page_type: 'pillar',
    priority: 'high',
  },
  {
    question: "Kocaali mi Karasu mu?",
    location_scope: 'global',
    page_type: 'comparison',
    priority: 'high',
  },
  {
    question: "Karasu'da hangi mahalleler değerleniyor?",
    location_scope: 'karasu',
    page_type: 'neighborhood',
    priority: 'high',
  },
  {
    question: "Karasu'da ev fiyatları ne durumda?",
    location_scope: 'karasu',
    page_type: 'pillar',
    priority: 'medium',
  },
  {
    question: "Kocaali yatırım potansiyeli nedir?",
    location_scope: 'kocaali',
    page_type: 'pillar',
    priority: 'high',
  },
  {
    question: "Karasu'da kiralama geliri ne kadar?",
    location_scope: 'karasu',
    page_type: 'pillar',
    priority: 'medium',
  },
  {
    question: "Sakarya emlak piyasası nasıl?",
    location_scope: 'global',
    page_type: 'pillar',
    priority: 'high',
  },
  {
    question: "Karasu'da ev alırken nelere dikkat edilmeli?",
    location_scope: 'karasu',
    page_type: 'blog',
    priority: 'high',
  },
  {
    question: "Kocaali'de yazlık ev almak mantıklı mı?",
    location_scope: 'kocaali',
    page_type: 'blog',
    priority: 'medium',
  },
  {
    question: "Karasu merkez mi sahil mi yatırım için?",
    location_scope: 'karasu',
    page_type: 'blog',
    priority: 'medium',
  },
  {
    question: "Karasu'da hangi ev tipleri yatırım için uygun?",
    location_scope: 'karasu',
    page_type: 'pillar',
    priority: 'medium',
  },
  {
    question: "Kocaali'de emlak alım-satım süreçleri nasıl?",
    location_scope: 'kocaali',
    page_type: 'blog',
    priority: 'low',
  },
  {
    question: "Karasu'da denize yakın ev fiyatları nasıl?",
    location_scope: 'karasu',
    page_type: 'cornerstone',
    priority: 'medium',
  },
  {
    question: "Sakarya'da emlak yatırımı yapmak mantıklı mı?",
    location_scope: 'global',
    page_type: 'pillar',
    priority: 'high',
  },
  {
    question: "Karasu'da ev almak için kredi şartları neler?",
    location_scope: 'karasu',
    page_type: 'blog',
    priority: 'low',
  },
  {
    question: "Kocaali vs Karasu: Hangi bölge daha uygun?",
    location_scope: 'global',
    page_type: 'comparison',
    priority: 'high',
  },
  {
    question: "Karasu'da yatırım için en uygun mahalleler?",
    location_scope: 'karasu',
    page_type: 'neighborhood',
    priority: 'high',
  },
  {
    question: "Karasu'da ev alırken tapu işlemleri nasıl?",
    location_scope: 'karasu',
    page_type: 'blog',
    priority: 'low',
  },
  {
    question: "Kocaali'de yatırım amaçlı ev almak mantıklı mı?",
    location_scope: 'kocaali',
    page_type: 'pillar',
    priority: 'medium',
  },
];

/**
 * Generate Q&A answer using OpenAI
 */
async function generateQAAnswer(question: string): Promise<string> {
  const prompt = `Sen bir emlak uzmanısın. Aşağıdaki soruya 40-70 kelimelik, kısa, net ve bilgilendirici bir cevap ver.

Soru: ${question}

Gereksinimler:
1. 40-70 kelime
2. Kısa, net, direkt cevap
3. Objektif, bilgilendirici (satış dili yok)
4. AI Overviews için optimize edilmiş
5. Gerçek veriler ve bilgiler içermeli

Sadece cevabı döndür (soru sorma, sadece cevap ver).`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Sen bir emlak uzmanısın. Kısa, net ve bilgilendirici cevaplar veriyorsun.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 150,
  });

  return completion.choices[0]?.message?.content?.trim() || '';
}

/**
 * Generate SQL for Q&A insertion
 */
function generateQASQL(qa: typeof qaBlocks[0], answer: string): string {
  const questionEscaped = qa.question.replace(/'/g, "''");
  const answerEscaped = answer.replace(/'/g, "''");
  
  return `
    INSERT INTO public.ai_questions (
      question, answer, location_scope, page_type, priority, 
      status, generated_by_ai, created_at, updated_at
    ) VALUES (
      '${questionEscaped}',
      '${answerEscaped}',
      '${qa.location_scope}',
      '${qa.page_type}',
      '${qa.priority}',
      'draft',
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT DO NOTHING;
  `;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 SEO Domination Q&A Generator (Direct SQL)\n');
  console.log(`Generating ${qaBlocks.length} Q&A blocks...\n`);

  const sqlStatements: string[] = [];
  let generated = 0;
  let skipped = 0;

  for (const qa of qaBlocks) {
    try {
      console.log(`❓ Generating: "${qa.question}"`);
      
      const answer = await generateQAAnswer(qa.question);
      
      if (!answer || answer.length < 40) {
        console.log(`   ⚠️  Answer too short (${answer.length} chars), skipping`);
        skipped++;
        continue;
      }

      const sql = generateQASQL(qa, answer);
      sqlStatements.push(sql);
      
      generated++;
      console.log(`   ✅ Generated (${answer.length} chars)`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`   ❌ Error:`, error.message);
      skipped++;
    }
  }

  // Write SQL file
  const sqlFile = `scripts/seo-domination-qa-insert.sql`;
  const fullSQL = `-- SEO Domination Q&A Blocks
-- Generated: ${new Date().toISOString()}
-- Total: ${generated} Q&As

${sqlStatements.join('\n')}
`;

  const fs = await import('fs/promises');
  await fs.writeFile(sqlFile, fullSQL, 'utf-8');

  console.log(`\n\n✨ Q&A generation completed!`);
  console.log(`📊 Statistics:`);
  console.log(`   ✅ Generated: ${generated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`\n📝 SQL file created: ${sqlFile}`);
  console.log(`\n⚠️  Next step: Run the SQL file using MCP Supabase or apply_migration`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { generateQAAnswer, generateQASQL };
