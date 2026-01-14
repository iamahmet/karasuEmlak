import { NextRequest } from "next/server";
import { createServiceClient } from "@karasu/lib/supabase/service";
import { checkContentQuality } from "@karasu/lib/content/quality-gate";
import { logAuditEvent } from "@karasu/lib/audit";
import { withErrorHandling, createSuccessResponse, createErrorResponse } from "@/lib/admin/api/error-handler";
import { getRequestId } from "@/lib/admin/api/middleware";
import OpenAI from "openai";
import { FLAGSHIP_CONTENT_PROMPT, EDITORIAL_SYSTEM_PROMPT } from "@/lib/prompts/editorial-optimizer";
// import { requireStaff } from "@/lib/auth/server";

/**
 * Content Studio Create API
 * Admin API: Uses service role to bypass RLS
 */
async function handlePost(request: NextRequest) {
  const requestId = getRequestId(request);
  // Development mode: Skip auth check
  // const user = await requireStaff();
  // Admin API: ALWAYS use service role client
  const supabase = createServiceClient();
  
  // Get current user (or use mock user in development)
  let user;
  if (process.env.NODE_ENV === "development") {
    // Mock user for development
    const { data: mockUser } = await supabase.auth.getUser();
    user = mockUser?.user || { id: "00000000-0000-0000-0000-000000000000" };
  } else {
    // user = await requireStaff();
    user = { id: "00000000-0000-0000-0000-000000000000" };
  }
  
  const body = await request.json();
  const { type, template, topic, brief, locale, context, region } = body;

  if (!topic) {
    return createErrorResponse(
      requestId,
      "VALIDATION_ERROR",
      "Konu gereklidir",
      undefined,
      400
    );
  }

  // Initialize OpenAI client
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return createErrorResponse(
      requestId,
      "CONFIG_ERROR",
      "OpenAI API anahtarı yapılandırılmamış",
      undefined,
      500
    );
  }

  const openai = new OpenAI({ apiKey: openaiKey });

  // Determine word count based on type
  const wordCount = type === 'cornerstone' ? 2000 : type === 'normal' ? 1000 : 800;
  const useFlagshipPrompt = type === 'cornerstone' || wordCount >= 1500;

  // Extract main keyword from topic (first 2-3 words)
  const topicWords = topic.split(' ').slice(0, 3).join(' ');

  // Build Karasu Emlak specific context
  const karasuContext = `
KARASU EMLAK İÇERİK BAĞLAMI:
- Bölge: Karasu, Kocaali, Sakarya
- Site: KarasuEmlak.net - Karasu ve çevresinin güvenilir emlak platformu
- Uzmanlık: Yerel emlak piyasası, mahalle analizleri, yatırım rehberleri
- Hedef Kitle: Emlak alıcıları, yatırımcılar, bölge hakkında bilgi arayanlar
- Ton: Yerel uzman, güvenilir, bilgilendirici, doğal (AI gibi değil)
`;

  // Template-specific instructions
  const templateInstructions: Record<string, string> = {
    neighborhood: `
Bu bir MAHALLE REHBERİ içeriğidir. Şunları içermelidir:
- Mahalle hakkında genel bilgi (konum, tarihçe)
- Ulaşım ve erişim bilgileri
- Denize yakınlık ve mesafe
- Sosyal yaşam (okul, market, sağlık kuruluşları)
- Emlak fiyatları ve trendler
- Yatırım potansiyeli analizi
- Kimler için uygun (aile, yatırımcı, emekli)
- FAQ bölümü (5-7 soru)
`,
    'market-analysis': `
Bu bir PİYASA ANALİZİ içeriğidir. Şunları içermelidir:
- Güncel emlak piyasası durumu
- Fiyat trendleri ve değişimler
- Bölgesel karşılaştırmalar
- Yatırım fırsatları
- Gelecek öngörüleri
- Veri ve istatistikler
`,
    investment: `
Bu bir YATIRIM REHBERİ içeriğidir. Şunları içermelidir:
- Yatırım potansiyeli analizi
- Kira getirisi hesaplamaları
- Risk değerlendirmesi
- Yatırım stratejileri
- Vergi ve yasal bilgiler
- Başarı hikayeleri (varsa)
`,
    news: `
Bu bir EMLAK HABERİ içeriğidir. Şunları içermelidir:
- Güncel haber/olay
- Etkiler ve sonuçlar
- Uzman görüşleri
- İlgili veriler
- Yerel bağlam
`,
  };

  const templateInstruction = templateInstructions[template] || '';

  // Build system prompt
  const systemPrompt = useFlagshipPrompt
    ? `${FLAGSHIP_CONTENT_PROMPT}\n\n${karasuContext}`
    : `${EDITORIAL_SYSTEM_PROMPT}\n\n${karasuContext}`;

  // Build user prompt
  const userPrompt = useFlagshipPrompt
    ? `Aşağıdaki konu hakkında kapsamlı bir "Flagship Content" makalesi oluştur:

KONU: ${topic}
HEDEF ANAHTAR KELİME: ${topicWords}
KELİME SAYISI: Minimum ${wordCount} kelime${useFlagshipPrompt ? ' (tercihen 2000+)' : ''}
${brief ? `DETAYLI İSTEKLER:\n${brief}` : ''}
${templateInstruction}

Lütfen şu formatta JSON döndür:
{
  "title": "H1 başlığı (30-60 karakter, High CTR, Curiosity Gap)",
  "content": "HTML formatında içerik (H1, H2, H3, H4 başlıklar, <p> paragraflar, <ul><li> listeler)",
  "excerpt": "150-200 kelimelik özet",
  "metaDescription": "SEO meta açıklaması (120-155 karakter)",
  "keywords": "virgülle ayrılmış SEO anahtar kelimeleri (5-10 kelime)",
  "faq": [
    {"question": "Soru 1", "answer": "Cevap 1"},
    {"question": "Soru 2", "answer": "Cevap 2"},
    {"question": "Soru 3", "answer": "Cevap 3"},
    {"question": "Soru 4", "answer": "Cevap 4"},
    {"question": "Soru 5", "answer": "Cevap 5"}
  ],
  "internalLinks": ["İç link önerisi 1", "İç link önerisi 2", "İç link önerisi 3"]
}

ÖNEMLİ:
- Minimum ${wordCount} kelime${useFlagshipPrompt ? ', tercihen 2000+' : ''}
- 10-15 alt başlık (H2/H3)
- Her H2 bölümü 300-500 kelime
- FAQ bölümü ekle (5 soru-cevap)
- İç link önerileri belirt
- Görsel önerileri ekle (Image Idea formatında)
- Anti-AI ton: "In conclusion", "Furthermore" gibi ifadeler KULLANMA
- Doğal, konuşma tonu: "By the way", "Honestly", "Let's see" gibi geçişler kullan
- Yerel bilgiler ekle (Karasu, Kocaali, mahalle adları, gerçek detaylar)`
    : `Aşağıdaki konu hakkında ${wordCount} kelimelik kapsamlı bir içerik oluştur:

KONU: ${topic}
${brief ? `DETAYLI İSTEKLER:\n${brief}` : ''}
${templateInstruction}

Lütfen şu formatta JSON döndür:
{
  "title": "Başlık (30-60 karakter)",
  "content": "HTML formatında içerik (başlıklar için <h2>, <h3> kullan, paragraflar için <p> kullan)",
  "excerpt": "Özet (150-200 karakter)",
  "metaDescription": "SEO meta açıklaması (120-160 karakter)",
  "keywords": "virgülle ayrılmış SEO anahtar kelimeleri (5-10 kelime)"
}

İçerik şunları içermeli:
- Giriş paragrafı (primary keyword ilk 100 kelimede)
- En az 3-4 alt başlık (H2)
- Her alt başlık altında 2-3 paragraf
- Sonuç paragrafı (CTA ile)
- SEO uyumlu yapı
- Yerel bilgiler (Karasu, Kocaali, mahalle adları)

ÖNEMLİ - İÇERİK KALİTE STANDARTLARI:
- "Sonuç", "Özet", "Değerlendirme" gibi başlıklar KULLANMA
- "Sonuç olarak", "Özetlemek gerekirse", "Kısaca", "bu makalede", "bu yazıda" gibi generic ifadeler KULLANMA
- Özgün ve doğal ifadeler kullan, AI detection'dan kaçın
- Cümle yapılarını çeşitlendir (kısa + uzun karışımı)
- Tekrar eden kelimelerden kaçın, eş anlamlılar kullan
- Kurumsal kimliğe uygun profesyonel ton kullan
- Minimum 300 kelime (ideal: 800-2000 kelime)`;

  // Generate content
  const completion = await openai.chat.completions.create({
    model: useFlagshipPrompt ? "gpt-4o" : "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: useFlagshipPrompt ? 8000 : Math.min(wordCount * 2, 4000),
    response_format: { type: "json_object" },
  });

  const responseText = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(responseText);

  const generated = {
    title: parsed.title || topic,
    content: parsed.content || '',
    meta_title: parsed.title || parsed.metaDescription || topic,
    meta_description: parsed.metaDescription || parsed.meta_description || '',
    excerpt: parsed.excerpt || '',
  };

  // Create slug from title (Turkish character handling with smart truncation)
  let slug = generated.title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Truncate at word boundary if too long (max 100 chars)
  const maxLength = 100;
  if (slug.length > maxLength) {
    const truncated = slug.substring(0, maxLength);
    const lastHyphen = truncated.lastIndexOf('-');
    if (lastHyphen > maxLength * 0.5) {
      slug = truncated.substring(0, lastHyphen);
    } else {
      slug = truncated.replace(/-+$/, '');
    }
  }

  // Check if article with same slug exists
  const { data: existingArticle } = await supabase
    .from("articles")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existingArticle) {
    // Append timestamp to slug if exists
    slug = `${slug}-${Date.now()}`;
  }

  // Extract keywords from parsed response if available
  const keywords = parsed.keywords 
    ? parsed.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
    : [];

  // Create article directly in articles table (Karasu Emlak uses articles, not content_items)
  const { data: article, error: createError } = await supabase
    .from("articles")
    .insert({
      title: generated.title,
      slug,
      content: generated.content,
      excerpt: generated.excerpt || generated.meta_description?.substring(0, 200) || '',
      meta_description: generated.meta_description,
      keywords: keywords.length > 0 ? keywords : null,
      author: "Karasu Emlak",
      status: "draft",
      category: template === 'neighborhood' ? 'Mahalle Rehberi' : 
                template === 'market-analysis' ? 'Piyasa Analizi' :
                template === 'investment' ? 'Yatırım Rehberi' :
                template === 'news' ? 'Haber' : 'Blog',
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating article:", createError);
    throw createError;
  }

  const contentItem = { id: article.id }; // For compatibility with existing code

  // Calculate quality score
  const qualityCheck = checkContentQuality({
    title: generated.title,
    content: generated.content,
    excerpt: generated.excerpt,
    meta_title: generated.meta_title,
    meta_description: generated.meta_description,
    slug,
  });
  
  const qualityScore = {
    score: qualityCheck.score,
    passed: qualityCheck.passed,
    issues: qualityCheck.issues,
    suggestions: qualityCheck.suggestions,
  };

  // Update article with quality score
  await supabase
    .from("articles")
    .update({ seo_score: qualityScore.score })
    .eq("id", article.id);

  // Log audit event
  await logAuditEvent({
    type: 'content.created',
    user_id: user.id,
    resource_type: 'article',
    resource_id: article.id,
    metadata: { type, template, locale, topic },
  });

  return createSuccessResponse(requestId, {
    contentId: article.id,
    articleId: article.id, // For compatibility
    qualityScore,
    article: {
      id: article.id,
      title: article.title,
      slug: article.slug,
      status: article.status,
    },
  });
}

export const POST = withErrorHandling(handlePost);
