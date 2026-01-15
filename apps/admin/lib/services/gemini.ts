/**
 * AI Service for Admin Panel
 * Content quality analysis and improvement using Google Gemini (with OpenAI fallback)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

interface QualityAnalysis {
  score: number; // 0-100
  passed: boolean;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
  }>;
  suggestions: string[];
  aiGenerated: boolean;
  humanLikeScore: number; // 0-100
  seoScore: number; // 0-100
}

interface ContentImprovement {
  improved: string;
  score: {
    before: number;
    after: number;
    improvement: number;
  };
  changes: Array<{
    type: 'replaced' | 'added' | 'removed';
    improved: string;
    reason: string;
  }>;
}

/**
 * Get Gemini client instance
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Get OpenAI client instance (fallback)
 */
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({ apiKey });
}

/**
 * Check content quality using OpenAI (fallback when Gemini fails)
 */
async function checkContentQualityWithOpenAI(
  content: string,
  title: string,
  context?: {
    category?: string;
    keywords?: string[];
  }
): Promise<QualityAnalysis> {
  try {
    const openai = getOpenAIClient();
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    
    const prompt = `Sen bir içerik kalite uzmanısın. Aşağıdaki Türkçe blog yazısını analiz et ve detaylı kalite raporu oluştur.

Başlık: ${title}
Kategori: ${context?.category || 'Genel'}
Anahtar Kelimeler: ${context?.keywords?.join(', ') || 'Yok'}

İçerik:
${cleanContent.substring(0, 4000)}${cleanContent.length > 4000 ? '...' : ''}

Analiz kriterleri:
1. SEO uyumluluğu (anahtar kelime kullanımı, meta bilgiler, yapı) - 0-100 skor
2. Okunabilirlik (cümle uzunluğu, kelime seçimi, akıcılık) - 0-100 skor
3. İçerik kalitesi (bilgi değeri, derinlik, özgünlük) - 0-100 skor
4. AI ile yazılmış olma olasılığı (generic ifadeler, tekrarlar, placeholder'lar) - true/false
5. İnsan yazısı gibi görünme skoru (doğallık, kişisellik, özgünlük) - 0-100 skor
6. Yapı ve format (başlıklar, paragraflar, listeler) - 0-100 skor

JSON formatında döndür (sadece JSON, başka açıklama yapma):
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
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sen bir içerik kalite analiz uzmanısın. Sadece geçerli JSON formatında yanıt ver.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(responseText);

    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      passed: parsed.passed !== false && (parsed.score || 0) >= 70,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      aiGenerated: parsed.aiGenerated === true,
      humanLikeScore: Math.max(0, Math.min(100, parsed.humanLikeScore || 0)),
      seoScore: Math.max(0, Math.min(100, parsed.seoScore || 0)),
    };
  } catch (error: any) {
    console.error('[OpenAI] Error checking content quality:', error);
    throw error;
  }
}

/**
 * Improve content using OpenAI (fallback when Gemini fails)
 */
async function improveContentWithOpenAI(
  content: string,
  title: string,
  qualityAnalysis: QualityAnalysis
): Promise<ContentImprovement> {
  try {
    const openai = getOpenAIClient();
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    
    const prompt = `Sen bir içerik editörüsün. Aşağıdaki Türkçe blog yazısını analiz sonuçlarına göre iyileştir.

Yazı Başlığı: ${title}
Orijinal İçerik: ${cleanContent.substring(0, 4000)}

Mevcut Kalite Skoru: ${qualityAnalysis.score}/100
Tespit Edilen Sorunlar:
${qualityAnalysis.issues.map(i => `- ${i.message}: ${i.suggestion}`).join('\n')}

İyileştirme Önerileri:
${qualityAnalysis.suggestions.join('\n')}

Görevler:
1. Generic ifadeleri kaldır ve daha özgün ifadeler kullan
2. Tekrar eden kelimeleri eş anlamlılarıyla değiştir
3. Cümle yapılarını çeşitlendir (kısa + uzun karışımı)
4. Daha samimi ve doğal bir ton kullan
5. İçeriği daha akıcı ve okunabilir hale getir
6. SEO uyumluluğunu artır (anahtar kelimeleri doğal şekilde kullan)

ÖNEMLİ: 
- İçeriğin anlamını ve bilgi değerini koru
- HTML etiketlerini koru (varsa)
- Sadece iyileştirilmiş içeriği döndür, ek açıklama yapma
- Türkçe karakterleri doğru kullan
- Orijinal içeriğin uzunluğuna yakın tut`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Sen bir içerik editörüsün. Sadece iyileştirilmiş içeriği döndür, ek açıklama yapma.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const improved = completion.choices[0]?.message?.content?.trim() || content;
    
    // Calculate improvement score
    const estimatedNewScore = Math.min(100, qualityAnalysis.score + 20);
    
    return {
      improved,
      score: {
        before: qualityAnalysis.score,
        after: estimatedNewScore,
        improvement: estimatedNewScore - qualityAnalysis.score,
      },
      changes: qualityAnalysis.issues.map(issue => ({
        type: 'replaced' as const,
        improved: issue.suggestion,
        reason: issue.message,
      })),
    };
  } catch (error: any) {
    console.error('[OpenAI] Error improving content:', error);
    throw error;
  }
}


/**
 * Check content quality using Gemini
 */
export async function checkContentQualityWithGemini(
  content: string,
  title: string,
  context?: {
    category?: string;
    keywords?: string[];
  }
): Promise<QualityAnalysis> {
  try {
    const genAI = getGeminiClient();
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    
    const prompt = `Sen bir içerik kalite uzmanısın. Aşağıdaki Türkçe blog yazısını analiz et ve detaylı kalite raporu oluştur.

Başlık: ${title}
Kategori: ${context?.category || 'Genel'}
Anahtar Kelimeler: ${context?.keywords?.join(', ') || 'Yok'}

İçerik:
${cleanContent.substring(0, 4000)}${cleanContent.length > 4000 ? '...' : ''}

Analiz kriterleri:
1. SEO uyumluluğu (anahtar kelime kullanımı, meta bilgiler, yapı) - 0-100 skor
2. Okunabilirlik (cümle uzunluğu, kelime seçimi, akıcılık) - 0-100 skor
3. İçerik kalitesi (bilgi değeri, derinlik, özgünlük) - 0-100 skor
4. AI ile yazılmış olma olasılığı (generic ifadeler, tekrarlar, placeholder'lar) - true/false
5. İnsan yazısı gibi görünme skoru (doğallık, kişisellik, özgünlük) - 0-100 skor
6. Yapı ve format (başlıklar, paragraflar, listeler) - 0-100 skor

JSON formatında döndür (sadece JSON, başka açıklama yapma):
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
}`;

    // Try different models with fallback
    let model;
    let result;
    const modelsToTry = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
    
    for (const modelName of modelsToTry) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
          },
        });
        result = await model.generateContent(prompt);
        break; // Success, exit loop
      } catch (error: any) {
        console.warn(`[Gemini] Model ${modelName} failed, trying next...`, error.message);
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          // Last model failed, throw error
          throw error;
        }
      }
    }
    
    if (!result) {
      throw new Error('All Gemini models failed');
    }
    
    const response = result.response.text();
    
    // Parse JSON response
    let parsed: any;
    try {
      parsed = JSON.parse(response);
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON response');
      }
    }
    
    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      passed: parsed.passed !== false && (parsed.score || 0) >= 70,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      aiGenerated: parsed.aiGenerated === true,
      humanLikeScore: Math.max(0, Math.min(100, parsed.humanLikeScore || 0)),
      seoScore: Math.max(0, Math.min(100, parsed.seoScore || 0)),
    };
  } catch (error: any) {
    console.error('[Gemini] Error checking content quality:', error);
    
    // Fallback to OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      console.log('[AI Service] Falling back to OpenAI for quality analysis...');
      try {
        return await checkContentQualityWithOpenAI(content, title, context);
      } catch (openaiError: any) {
        console.error('[OpenAI] Fallback also failed:', openaiError);
      }
    }
    
    // Final fallback to basic quality check
    return {
      score: 50,
      passed: false,
      issues: [{
        type: 'error',
        severity: 'medium',
        message: 'Kalite analizi yapılamadı: ' + (error.message || 'Bilinmeyen hata'),
        suggestion: 'İçeriği manuel olarak kontrol edin',
      }],
      suggestions: ['İçeriği gözden geçirin ve iyileştirin'],
      aiGenerated: false,
      humanLikeScore: 50,
      seoScore: 50,
    };
  }
}

/**
 * Improve content using Gemini
 */
export async function improveContentWithGemini(
  content: string,
  title: string,
  qualityAnalysis: QualityAnalysis
): Promise<ContentImprovement> {
  try {
    const genAI = getGeminiClient();
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    
    const prompt = `Sen bir içerik editörüsün. Aşağıdaki Türkçe blog yazısını analiz sonuçlarına göre iyileştir.

Yazı Başlığı: ${title}
Orijinal İçerik: ${cleanContent.substring(0, 4000)}

Mevcut Kalite Skoru: ${qualityAnalysis.score}/100
Tespit Edilen Sorunlar:
${qualityAnalysis.issues.map(i => `- ${i.message}: ${i.suggestion}`).join('\n')}

İyileştirme Önerileri:
${qualityAnalysis.suggestions.join('\n')}

Görevler:
1. Generic ifadeleri kaldır ve daha özgün ifadeler kullan
2. Tekrar eden kelimeleri eş anlamlılarıyla değiştir
3. Cümle yapılarını çeşitlendir (kısa + uzun karışımı)
4. Daha samimi ve doğal bir ton kullan
5. İçeriği daha akıcı ve okunabilir hale getir
6. SEO uyumluluğunu artır (anahtar kelimeleri doğal şekilde kullan)

ÖNEMLİ: 
- İçeriğin anlamını ve bilgi değerini koru
- HTML etiketlerini koru (varsa)
- Sadece iyileştirilmiş içeriği döndür, ek açıklama yapma
- Türkçe karakterleri doğru kullan
- Orijinal içeriğin uzunluğuna yakın tut`;

    // Try different models with fallback
    let model;
    let result;
    const modelsToTry = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
    
    for (const modelName of modelsToTry) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        });
        result = await model.generateContent(prompt);
        break; // Success, exit loop
      } catch (error: any) {
        console.warn(`[Gemini] Model ${modelName} failed, trying next...`, error.message);
        if (modelName === modelsToTry[modelsToTry.length - 1]) {
          // Last model failed, throw error
          throw error;
        }
      }
    }
    
    if (!result) {
      throw new Error('All Gemini models failed');
    }
    
    const improved = result.response.text().trim();
    
    // Calculate improvement score
    const estimatedNewScore = Math.min(100, qualityAnalysis.score + 20);
    
    return {
      improved,
      score: {
        before: qualityAnalysis.score,
        after: estimatedNewScore,
        improvement: estimatedNewScore - qualityAnalysis.score,
      },
      changes: qualityAnalysis.issues.map(issue => ({
        type: 'replaced' as const,
        improved: issue.suggestion,
        reason: issue.message,
      })),
    };
  } catch (error: any) {
    console.error('[Gemini] Error improving content:', error);
    
    // Fallback to OpenAI if available
    if (process.env.OPENAI_API_KEY) {
      console.log('[AI Service] Falling back to OpenAI for content improvement...');
      try {
        return await improveContentWithOpenAI(content, title, qualityAnalysis);
      } catch (openaiError: any) {
        console.error('[OpenAI] Fallback also failed:', openaiError);
        throw new Error('İçerik iyileştirme başarısız (Gemini ve OpenAI): ' + (openaiError.message || error.message || 'Bilinmeyen hata'));
      }
    }
    
    throw new Error('İçerik iyileştirme başarısız: ' + (error.message || 'Bilinmeyen hata'));
  }
}

/**
 * Batch analyze multiple contents
 */
export async function batchAnalyzeContentQuality(
  contents: Array<{ id: string; title: string; content: string }>
): Promise<Array<{ id: string; analysis: QualityAnalysis }>> {
  const results = [];
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < contents.length; i += batchSize) {
    const batch = contents.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (item) => {
        const analysis = await checkContentQualityWithGemini(item.content, item.title);
        return { id: item.id, analysis };
      })
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('[Gemini] Batch analysis error:', result.reason);
      }
    }
    
    // Small delay between batches
    if (i + batchSize < contents.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
