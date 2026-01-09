/**
 * Create Missing Blog Posts
 * 
 * Creates essential blog posts for Karasu Emlak website
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

interface BlogPost {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  brief: string;
  wordCount: number;
}

const blogPosts: BlogPost[] = [
  {
    title: 'Karasu Ev Alırken Dikkat Edilmesi Gerekenler',
    slug: 'karasu-ev-alirken-dikkat-edilmesi-gerekenler',
    category: 'Rehber',
    tags: ['karasu', 'ev almak', 'rehber', 'dikkat edilmesi gerekenler', 'emlak'],
    brief: 'Karasu\'da ev alırken dikkat edilmesi gereken tüm önemli noktalar, yasal süreçler, teknik kontroller ve profesyonel yardım konularını kapsayan kapsamlı bir rehber.',
    wordCount: 2000,
  },
  {
    title: 'Karasu\'da Emlak Yatırımı Rehberi: 2024',
    slug: 'karasu-emlak-yatirim-rehberi-2024',
    category: 'Yatırım Rehberi',
    tags: ['karasu', 'emlak yatırımı', 'yatırım rehberi', '2024', 'gayrimenkul yatırımı'],
    brief: 'Karasu\'da emlak yatırımı yapmak isteyenler için kapsamlı bir rehber. Piyasa analizi, yatırım fırsatları, riskler ve getiri potansiyeli hakkında detaylı bilgiler.',
    wordCount: 2000,
  },
  {
    title: 'Karasu\'da Kiralık Ev Ararken Bilmeniz Gerekenler',
    slug: 'karasu-kiralik-ev-ararken-bilmeniz-gerekenler',
    category: 'Rehber',
    tags: ['karasu', 'kiralık ev', 'kiralama rehberi', 'ev kiralamak'],
    brief: 'Karasu\'da kiralık ev ararken dikkat edilmesi gerekenler, kira sözleşmesi, depozito, ev sahibi ile iletişim ve haklarınız hakkında kapsamlı bilgiler.',
    wordCount: 1500,
  },
  {
    title: 'Karasu Emlak Piyasası 2024: Güncel Durum ve Trendler',
    slug: 'karasu-emlak-piyasasi-2024',
    category: 'Piyasa Analizi',
    tags: ['karasu', 'emlak piyasası', '2024', 'piyasa analizi', 'fiyat trendleri'],
    brief: 'Karasu emlak piyasasının 2024 yılındaki durumu, fiyat trendleri, bölgesel karşılaştırmalar ve gelecek öngörüleri hakkında detaylı analiz.',
    wordCount: 2000,
  },
  {
    title: 'Karasu\'da Villa Satın Alma Rehberi',
    slug: 'karasu-villa-satin-alma-rehberi',
    category: 'Rehber',
    tags: ['karasu', 'villa', 'villa satın alma', 'lüks emlak', 'yazlık villa'],
    brief: 'Karasu\'da villa satın almak isteyenler için kapsamlı rehber. Villa seçimi, fiyat aralıkları, konum avantajları ve yatırım potansiyeli.',
    wordCount: 1800,
  },
  {
    title: 'Karasu\'da Arsa Yatırımı: Fırsatlar ve Riskler',
    slug: 'karasu-arsa-yatirimi-firsatlar-riskler',
    category: 'Yatırım Rehberi',
    tags: ['karasu', 'arsa yatırımı', 'arsa', 'yatırım', 'gayrimenkul'],
    brief: 'Karasu\'da arsa yatırımı yapmak isteyenler için detaylı rehber. Arsa seçimi, yasal süreçler, yatırım fırsatları ve dikkat edilmesi gerekenler.',
    wordCount: 1600,
  },
  {
    title: 'Karasu\'da Emlak Vergileri ve Masrafları',
    slug: 'karasu-emlak-vergileri-masraflari',
    category: 'Rehber',
    tags: ['karasu', 'emlak vergileri', 'masraflar', 'ev almak', 'maliyetler'],
    brief: 'Karasu\'da ev alırken karşılaşacağınız tüm vergiler, harçlar ve masraflar hakkında detaylı bilgiler. Toplam maliyet hesaplama rehberi.',
    wordCount: 1500,
  },
  {
    title: 'Karasu\'da Yazlık Ev Seçimi: Dikkat Edilmesi Gerekenler',
    slug: 'karasu-yazlik-ev-secimi',
    category: 'Rehber',
    tags: ['karasu', 'yazlık ev', 'yazlık', 'tatil evi', 'deniz kenarı'],
    brief: 'Karasu\'da yazlık ev seçerken dikkat edilmesi gerekenler, konum seçimi, denize yakınlık, yazlık ev özellikleri ve yatırım potansiyeli.',
    wordCount: 1700,
  },
  {
    title: 'Karasu\'da Emlak Kredisi: Başvuru ve Onay Süreci',
    slug: 'karasu-emlak-kredisi-basvuru-onay',
    category: 'Rehber',
    tags: ['karasu', 'emlak kredisi', 'konut kredisi', 'kredi başvurusu', 'finansman'],
    brief: 'Karasu\'da emlak kredisi başvurusu, gerekli belgeler, onay süreci, faiz oranları ve kredi seçenekleri hakkında kapsamlı bilgiler.',
    wordCount: 1500,
  },
  {
    title: 'Karasu\'da Emlak Danışmanı Seçimi: Doğru Tercih İçin Rehber',
    slug: 'karasu-emlak-danismani-secimi',
    category: 'Rehber',
    tags: ['karasu', 'emlak danışmanı', 'emlakçı seçimi', 'profesyonel yardım'],
    brief: 'Karasu\'da güvenilir emlak danışmanı seçimi, danışmanın özellikleri, hizmetleri ve doğru tercih yapmak için dikkat edilmesi gerekenler.',
    wordCount: 1400,
  },
];

// Load environment variables
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key must be set in environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateBlogPost(post: BlogPost): Promise<void> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  // Check if article already exists
  const { data: existing } = await supabase
    .from('articles')
    .select('id, title')
    .eq('slug', post.slug)
    .maybeSingle();

  if (existing) {
    console.log(`⏭️  Article "${post.title}" already exists (ID: ${existing.id}), skipping...`);
    return;
  }

  console.log(`📝 Generating article: "${post.title}"...`);

  // Build Karasu Emlak context
  const karasuContext = `
KARASU EMLAK İÇERİK BAĞLAMI:
- Bölge: Karasu, Kocaali, Sakarya
- Site: KarasuEmlak.net - Karasu ve çevresinin güvenilir emlak platformu
- Uzmanlık: Yerel emlak piyasası, mahalle analizleri, yatırım rehberleri
- Hedef Kitle: Emlak alıcıları, yatırımcılar, bölge hakkında bilgi arayanlar
- Ton: Yerel uzman, güvenilir, bilgilendirici, doğal (AI gibi değil)
- Telefon: +90 546 639 54 61
`;

  // Use flagship prompt for longer articles
  const useFlagshipPrompt = post.wordCount >= 1500;
  
  // Flagship content prompt (inline version)
  const flagshipPrompt = `# ROLE
You are a world-class SEO Specialist and Senior Content Writer with 15+ years of experience. Your goal is to write "Flagship Content" that ranks #1 on Google, beating all competitors in depth, engagement, and authority. You do NOT write like an AI. You write like a witty, experienced human expert (solopreneur vibe) who speaks directly to the reader.

# OBJECTIVE
Write a comprehensive, SEO-optimized, and highly engaging article on: ${post.title}
Targeting keyword: ${post.tags[0]}

# TONE & STYLE
- Anti-AI / Human Touch: Never start sentences with "In conclusion," "Furthermore," "Additionally"
- Use natural, conversational connectors: "By the way," "Honestly," "Let's see," "You see"
- Write at 6th-grade reading level but with PhD-level depth
- Use specific examples, data, and logic. Avoid fluff.
- Vibe: Slightly informal, modern, authoritative but friendly.

# FORMATTING
- Use Markdown formatting
- Strict H1, H2, H3, H4 structure
- Use **Bold** for emphasis, *Italics* for nuance
- Length: ${post.wordCount} words or cover the topic exhaustively

# CONTENT REQUIREMENTS
${post.brief}

${karasuContext}

Return JSON:
{
  "title": "${post.title}",
  "content": "Full HTML content with proper headings",
  "excerpt": "200 character summary",
  "meta_description": "160 character SEO description",
  "keywords": ["keyword1", "keyword2"],
  "faq": [{"question": "Q", "answer": "A"}]
}`;

  const standardPrompt = `Sen Karasu Emlak için uzman bir içerik yazarısın. ${post.brief}

${karasuContext}

Gereksinimler:
- ${post.wordCount} kelime civarında kapsamlı içerik
- SEO uyumlu başlıklar (H2, H3)
- Pratik bilgiler ve öneriler
- Yerel bilgiler ve örnekler
- Doğal, insan gibi yazı (AI gibi değil)
- FAQ bölümü (5-7 soru)
- İç linkler için uygun yerler

JSON formatında döndür:
{
  "title": "${post.title}",
  "content": "HTML formatında içerik",
  "excerpt": "200 karakterlik özet",
  "meta_description": "160 karakterlik SEO açıklaması",
  "keywords": ["keyword1", "keyword2", ...],
  "faq": [
    {"question": "Soru", "answer": "Cevap"},
    ...
  ]
}`;

  const prompt = useFlagshipPrompt ? flagshipPrompt : standardPrompt;

  try {
    const response = await openai.chat.completions.create({
      model: useFlagshipPrompt ? 'gpt-4o' : 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: useFlagshipPrompt 
            ? 'Sen Karasu Emlak için uzman bir SEO ve içerik uzmanısın. Flagship content yazıyorsun.'
            : 'Sen Karasu Emlak için uzman bir içerik yazarısın. Doğal, bilgilendirici ve SEO uyumlu içerikler üretiyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: useFlagshipPrompt ? 4000 : 3000,
    });

    const generated = JSON.parse(response.choices[0].message.content || '{}');

    // Extract keywords
    const keywords = generated.keywords || post.tags;

    // Create article
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title: generated.title || post.title,
        slug: post.slug,
        content: generated.content || '',
        excerpt: generated.excerpt || post.brief.substring(0, 200),
        meta_description: generated.meta_description || post.brief.substring(0, 160),
        keywords: keywords,
        author: 'Karasu Emlak',
        status: 'published',
        category: post.category,
        tags: post.tags,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error creating article "${post.title}":`, error);
      return;
    }

    console.log(`✅ Successfully created: "${post.title}" (ID: ${article.id})`);
  } catch (error) {
    console.error(`❌ Error generating article "${post.title}":`, error);
  }
}

async function main() {
  console.log('🚀 Starting blog post creation...\n');

  for (const post of blogPosts) {
    await generateBlogPost(post);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✨ Blog post creation completed!');
}

main().catch(console.error);
