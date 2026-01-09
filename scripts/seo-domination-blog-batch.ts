/**
 * SEO Domination Blog Posts Generator - Batch Version
 * 
 * Generates blog posts in smaller batches to avoid timeouts
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

const supportBlogPosts = [
  "Karasu'da ev alırken dikkat edilmesi gerekenler",
  "Karasu merkez mi sahil mi?",
  "Kocaali yatırım potansiyeli",
  "Karasu'da ev fiyatları neden artıyor?",
  "Karasu'da kiralama geliri ne kadar?",
  "Kocaali'de yazlık ev almak mantıklı mı?",
  "Karasu'da hangi mahalleler değerleniyor?",
  "Sakarya emlak piyasası 2024",
  "Karasu'da ev almak için kredi şartları",
  "Kocaali vs Karasu: Hangi bölge daha uygun?",
  "Karasu'da yatırım için en uygun ev tipleri",
  "Kocaali'de emlak alım-satım süreçleri",
  "Karasu'da denize yakın ev fiyatları",
  "Sakarya'da emlak yatırımı yapmak mantıklı mı?",
  "Karasu'da ev alırken tapu işlemleri",
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

async function generateBlogPost(title: string): Promise<void> {
  console.log(`\n📝 Generating: "${title}"`);
  
  try {
    const prompt = `Sen bir emlak uzmanısın. Aşağıdaki konuda 800-1500 kelimelik, bilgilendirici bir blog yazısı yaz.

Başlık: ${title}

Gereksinimler:
1. 800-1500 kelime
2. Yapılandırılmış (H2/H3 başlıklar)
3. Bilgilendirici, objektif ton
4. Gerçek kullanıcı sorularını yanıtla
5. İlgili iç linkler öner (Karasu, Kocaali, yatırım sayfalarına)

JSON formatında döndür:
{
  "title": "makale başlığı",
  "excerpt": "100-150 kelimelik özet",
  "content": "tam içerik (HTML formatında)",
  "meta_description": "150-160 karakter SEO açıklaması",
  "seo_keywords": "virgülle ayrılmış anahtar kelimeler"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir emlak uzmanısın. Bilgilendirici ve objektif içerik üretiyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let articleData;
    
    try {
      articleData = JSON.parse(responseText);
    } catch {
      articleData = {
        title,
        excerpt: responseText.substring(0, 150),
        content: responseText,
        meta_description: `${title} - Karasu Emlak blog`,
        seo_keywords: title,
      };
    }

    const slug = generateSlug(articleData.title || title);

    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      console.log(`   ⏭️  Already exists: ${slug}`);
      return;
    }

    // Use API route
    const response = await fetch(`${baseUrl}/api/articles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: articleData.title || title,
        slug,
        excerpt: articleData.excerpt || '',
        content: articleData.content || '',
        metaDescription: articleData.meta_description || '',
        seoKeywords: articleData.seo_keywords || title,
        author: 'Karasu Emlak',
        isPublished: false,
        locale: 'tr',
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || data.message || 'Failed to create blog post');
    }

    console.log(`   ✅ Created: ${slug}`);
  } catch (error: any) {
    console.error(`   ❌ Error:`, error.message || error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const batchArg = args.find(arg => arg.startsWith('--batch='));
  const batch = batchArg ? parseInt(batchArg.split('=')[1]) : 0;
  const batchSize = 5;

  const start = batch * batchSize;
  const end = Math.min(start + batchSize, supportBlogPosts.length);
  const posts = supportBlogPosts.slice(start, end);

  console.log(`🚀 SEO Domination Blog Posts Generator`);
  console.log(`Batch ${batch + 1}: Posts ${start + 1}-${end} of ${supportBlogPosts.length}\n`);

  for (const title of posts) {
    await generateBlogPost(title);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting
  }

  console.log(`\n\n✨ Batch ${batch + 1} completed!`);
  if (end < supportBlogPosts.length) {
    console.log(`\nRun next batch: pnpm tsx scripts/seo-domination-blog-batch.ts --batch=${batch + 1}`);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
