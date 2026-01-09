/**
 * Content Quality Service
 * 
 * OpenAI-powered content quality assessment, SEO compliance checking,
 * and content improvement suggestions.
 */

import OpenAI from 'openai';

// Initialize OpenAI client (lazy load)
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (typeof window !== 'undefined') {
    // Client-side: don't initialize OpenAI (security)
    return null;
  }

  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[Content Quality Service] OPENAI_API_KEY not found');
      return null;
    }

    try {
      openaiClient = new OpenAI({
        apiKey,
      });
    } catch (error) {
      console.error('[Content Quality Service] Failed to initialize OpenAI:', error);
      return null;
    }
  }

  return openaiClient;
}

export interface QualityIssue {
  type: 'ai-pattern' | 'seo' | 'readability' | 'structure' | 'engagement' | 'uniqueness' | 'html-structure';
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
  location?: string;
}

export interface QualityReport {
  score: number; // 0-100
  passed: boolean;
  issues: QualityIssue[];
  suggestions: string[];
  aiGenerated: boolean;
  humanLikeScore: number; // 0-100
  seoScore: number; // 0-100
}

export interface SEOReport {
  score: number; // 0-100
  passed: boolean;
  issues: QualityIssue[];
  suggestions: string[];
  keywordDensity: number;
  metaDescriptionLength: number;
  titleLength: number;
}

export interface HumanLikeScore {
  score: number; // 0-100
  confidence: number; // 0-1
  indicators: string[];
}

export interface ContentContext {
  category?: string;
  tags?: string[];
  targetAudience?: string;
  keywords?: string[];
}

/**
 * Check content quality using OpenAI
 */
export async function checkContentQuality(
  content: string,
  title: string,
  context?: ContentContext
): Promise<QualityReport> {
  const client = getOpenAIClient();
  
  if (!client) {
    // Fallback to local quality checker
    const { detectLowQualityContent } = await import('@/lib/utils/content-quality-checker');
    const qualityScore = detectLowQualityContent(content, title);
    
    return {
      score: qualityScore.overall,
      passed: qualityScore.overall >= 70,
      issues: qualityScore.issues,
      suggestions: qualityScore.suggestions,
      aiGenerated: qualityScore.aiProbability > 0.7,
      humanLikeScore: (1 - qualityScore.aiProbability) * 100,
      seoScore: qualityScore.seo,
    };
  }

  try {
    const prompt = `Aşağıdaki blog yazısını analiz et ve kalite raporu oluştur:

Başlık: ${title}
Kategori: ${context?.category || 'Genel'}
Anahtar Kelimeler: ${context?.keywords?.join(', ') || 'Yok'}

İçerik:
${content.substring(0, 4000)}${content.length > 4000 ? '...' : ''}

Analiz kriterleri:
1. SEO uyumluluğu (anahtar kelime kullanımı, meta bilgiler, yapı)
2. Okunabilirlik (cümle uzunluğu, kelime seçimi, akıcılık)
3. İçerik kalitesi (bilgi değeri, derinlik, özgünlük)
4. AI ile yazılmış olma olasılığı (generic ifadeler, tekrarlar, placeholder'lar)
5. İnsan yazısı gibi görünme skoru (doğallık, kişisellik, özgünlük)
6. Yapı ve format (başlıklar, paragraflar, listeler)

JSON formatında döndür:
{
  "score": 0-100,
  "passed": true/false,
  "issues": [
    {
      "type": "ai-pattern|seo|readability|structure|engagement|uniqueness",
      "severity": "low|medium|high",
      "message": "Sorun açıklaması",
      "suggestion": "İyileştirme önerisi"
    }
  ],
  "suggestions": ["Öneri 1", "Öneri 2"],
  "aiGenerated": true/false,
  "humanLikeScore": 0-100,
  "seoScore": 0-100
}

Sadece JSON döndür, başka açıklama yapma.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir içerik kalite uzmanısın. Blog yazılarını analiz edip detaylı kalite raporları oluşturuyorsun. Türkçe içerikler için optimize edilmişsin.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(response);
    
    return {
      score: parsed.score || 0,
      passed: parsed.passed || false,
      issues: parsed.issues || [],
      suggestions: parsed.suggestions || [],
      aiGenerated: parsed.aiGenerated || false,
      humanLikeScore: parsed.humanLikeScore || 0,
      seoScore: parsed.seoScore || 0,
    };
  } catch (error) {
    console.error('[Content Quality Service] Error checking quality:', error);
    
    // Fallback to local quality checker
    const { detectLowQualityContent } = await import('@/lib/utils/content-quality-checker');
    const qualityScore = detectLowQualityContent(content, title);
    
    return {
      score: qualityScore.overall,
      passed: qualityScore.overall >= 70,
      issues: qualityScore.issues,
      suggestions: qualityScore.suggestions,
      aiGenerated: qualityScore.aiProbability > 0.7,
      humanLikeScore: (1 - qualityScore.aiProbability) * 100,
      seoScore: qualityScore.seo,
    };
  }
}

/**
 * Improve content with AI
 */
export async function improveContentWithAI(
  content: string,
  title: string,
  context: ContentContext = {}
): Promise<string> {
  const client = getOpenAIClient();
  
  if (!client) {
    // Fallback: return original content
    console.warn('[Content Quality Service] OpenAI not available, returning original content');
    return content;
  }

  try {
    const prompt = `Aşağıdaki blog yazısını iyileştir:

Başlık: ${title}
Kategori: ${context.category || 'Genel'}
Anahtar Kelimeler: ${context.keywords?.join(', ') || 'Yok'}

Mevcut İçerik:
${content.substring(0, 6000)}${content.length > 6000 ? '...' : ''}

İyileştirme gereksinimleri:
1. AI pattern'lerini kaldır (generic ifadeler, tekrarlar, placeholder'lar)
2. SEO optimizasyonu yap (anahtar kelimeleri doğal şekilde kullan)
3. Okunabilirliği artır (kısa cümleler, basit kelimeler)
4. İçeriği daha doğal ve insan yazısı gibi yap
5. Yapıyı iyileştir (başlıklar, paragraflar, listeler)
6. Bilgi değerini artır

HTML formatında döndür (H2, H3, <p>, <ul><li> tag'leri kullan).
Sadece iyileştirilmiş içeriği döndür, başka açıklama yapma.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Sen bir içerik editörüsün. Blog yazılarını iyileştirip daha kaliteli, SEO uyumlu ve okunabilir hale getiriyorsun. Türkçe içerikler için optimize edilmişsin.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 8000,
    });

    const improved = completion.choices[0]?.message?.content?.trim();
    return improved || content;
  } catch (error) {
    console.error('[Content Quality Service] Error improving content:', error);
    return content; // Return original on error
  }
}

/**
 * Validate SEO compliance using OpenAI
 */
export async function validateSEOCompliance(
  content: string,
  metadata: {
    title?: string;
    description?: string;
    keywords?: string[];
  }
): Promise<SEOReport> {
  const client = getOpenAIClient();
  
  if (!client) {
    // Fallback to local SEO checker
    const { checkSEOCompliance } = await import('@/lib/utils/content-quality-checker');
    return checkSEOCompliance(content, metadata.title || '', metadata);
  }

  try {
    const prompt = `Aşağıdaki blog yazısının SEO uyumluluğunu kontrol et:

Başlık: ${metadata.title || 'Yok'}
Meta Açıklama: ${metadata.description || 'Yok'}
Anahtar Kelimeler: ${metadata.keywords?.join(', ') || 'Yok'}

İçerik:
${content.substring(0, 3000)}${content.length > 3000 ? '...' : ''}

SEO kriterleri:
1. Başlık uzunluğu (30-60 karakter)
2. Meta açıklama uzunluğu (120-155 karakter)
3. Anahtar kelime kullanımı (doğal, aşırı değil)
4. Heading yapısı (H2, H3)
5. İçerik uzunluğu (300+ kelime)
6. Görsel alt text'leri
7. İç linkler

JSON formatında döndür:
{
  "score": 0-100,
  "passed": true/false,
  "issues": [
    {
      "type": "seo",
      "severity": "low|medium|high",
      "message": "Sorun açıklaması",
      "suggestion": "İyileştirme önerisi"
    }
  ],
  "suggestions": ["Öneri 1", "Öneri 2"],
  "keywordDensity": 0-100,
  "metaDescriptionLength": 0,
  "titleLength": 0
}

Sadece JSON döndür, başka açıklama yapma.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir SEO uzmanısın. Blog yazılarının SEO uyumluluğunu kontrol ediyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(response);
    
    return {
      score: parsed.score || 0,
      passed: parsed.passed || false,
      issues: parsed.issues || [],
      suggestions: parsed.suggestions || [],
      keywordDensity: parsed.keywordDensity || 0,
      metaDescriptionLength: parsed.metaDescriptionLength || metadata.description?.length || 0,
      titleLength: parsed.titleLength || metadata.title?.length || 0,
    };
  } catch (error) {
    console.error('[Content Quality Service] Error validating SEO:', error);
    
    // Fallback to local SEO checker
    const { checkSEOCompliance } = await import('@/lib/utils/content-quality-checker');
    return checkSEOCompliance(content, metadata.title || '', metadata);
  }
}

/**
 * Verify human-like writing
 */
export async function verifyHumanLikeWriting(content: string): Promise<HumanLikeScore> {
  const client = getOpenAIClient();
  
  if (!client) {
    // Fallback: use local AI pattern detection
    const { detectAIPatterns } = await import('@/lib/utils/content-quality-checker');
    const patterns = detectAIPatterns(content);
    const aiProbability = patterns.reduce((acc, p) => acc + p.confidence, 0) / Math.max(1, patterns.length);
    
    return {
      score: (1 - aiProbability) * 100,
      confidence: 0.7, // Lower confidence for local detection
      indicators: patterns.map(p => p.pattern),
    };
  }

  try {
    const prompt = `Aşağıdaki metnin insan tarafından yazılmış gibi görünüp görünmediğini analiz et:

${content.substring(0, 2000)}${content.length > 2000 ? '...' : ''}

Analiz kriterleri:
1. Generic AI ifadeleri var mı?
2. Tekrarlayan içerik var mı?
3. Doğal dil kullanımı var mı?
4. Kişisel ton var mı?
5. Özgünlük var mı?

JSON formatında döndür:
{
  "score": 0-100,
  "confidence": 0-1,
  "indicators": ["Gösterge 1", "Gösterge 2"]
}

Sadece JSON döndür, başka açıklama yapma.`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir içerik analiz uzmanısın. Metinlerin insan tarafından yazılmış olup olmadığını tespit ediyorsun.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(response);
    
    return {
      score: parsed.score || 0,
      confidence: parsed.confidence || 0.5,
      indicators: parsed.indicators || [],
    };
  } catch (error) {
    console.error('[Content Quality Service] Error verifying human-like writing:', error);
    
    // Fallback
    const { detectAIPatterns } = await import('@/lib/utils/content-quality-checker');
    const patterns = detectAIPatterns(content);
    const aiProbability = patterns.reduce((acc, p) => acc + p.confidence, 0) / Math.max(1, patterns.length);
    
    return {
      score: (1 - aiProbability) * 100,
      confidence: 0.7,
      indicators: patterns.map(p => p.pattern),
    };
  }
}
