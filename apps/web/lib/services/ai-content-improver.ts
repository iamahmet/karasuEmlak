/**
 * AI Content Improver Service
 * Uses OpenAI/Gemini to analyze and improve content quality
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ContentAnalysis {
  humanLikeScore: number; // 0-100
  aiProbability: number; // 0-1
  issues: Array<{
    type: 'generic-phrase' | 'repetition' | 'structure' | 'tone' | 'uniqueness';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
    location?: number;
  }>;
  strengths: string[];
  suggestions: string[];
}

interface ImprovedContent {
  original: string;
  improved: string;
  changes: Array<{
    type: 'replaced' | 'added' | 'removed';
    original?: string;
    improved: string;
    reason: string;
  }>;
  score: {
    before: number;
    after: number;
    improvement: number;
  };
}

/**
 * Analyze content using AI
 */
export async function analyzeContentWithAI(
  content: string,
  title: string
): Promise<ContentAnalysis> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // Prefer OpenAI, fallback to Gemini
  if (openaiKey) {
    return analyzeWithOpenAI(content, title);
  } else if (geminiKey) {
    return analyzeWithGemini(content, title);
  } else {
    // Fallback to local detection
    return analyzeLocally(content, title);
  }
}

/**
 * Analyze content using OpenAI
 */
async function analyzeWithOpenAI(
  content: string,
  title: string
): Promise<ContentAnalysis> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
  const prompt = `Sen bir içerik kalite analiz uzmanısın. Aşağıdaki Türkçe blog yazısını analiz et ve JSON formatında detaylı bir rapor hazırla.

Yazı Başlığı: ${title}
İçerik: ${cleanContent.substring(0, 4000)}

Analiz kriterleri:
1. İnsan yazısı gibi görünme skoru (0-100, yüksek = daha doğal)
2. AI yazısı olma olasılığı (0-1, yüksek = AI yazısı gibi)
3. Tespit edilen sorunlar (generic phrases, repetition, structure, tone, uniqueness)
4. Güçlü yönler
5. İyileştirme önerileri

JSON formatı:
{
  "humanLikeScore": 0-100,
  "aiProbability": 0-1,
  "issues": [
    {
      "type": "generic-phrase|repetition|structure|tone|uniqueness",
      "severity": "low|medium|high",
      "message": "Sorun açıklaması",
      "suggestion": "Öneri",
      "location": karakter pozisyonu (opsiyonel)
    }
  ],
  "strengths": ["güçlü yön 1", "güçlü yön 2"],
  "suggestions": ["öneri 1", "öneri 2"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen bir içerik kalite analiz uzmanısın. Sadece geçerli JSON formatında yanıt ver.',
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

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      humanLikeScore: result.humanLikeScore || 50,
      aiProbability: result.aiProbability || 0.5,
      issues: result.issues || [],
      strengths: result.strengths || [],
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return analyzeLocally(content, title);
  }
}

/**
 * Analyze content using Gemini
 */
async function analyzeWithGemini(
  content: string,
  title: string
): Promise<ContentAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
  const prompt = `Sen bir içerik kalite analiz uzmanısın. Aşağıdaki Türkçe blog yazısını analiz et ve JSON formatında detaylı bir rapor hazırla.

Yazı Başlığı: ${title}
İçerik: ${cleanContent.substring(0, 4000)}

Analiz kriterleri:
1. İnsan yazısı gibi görünme skoru (0-100, yüksek = daha doğal)
2. AI yazısı olma olasılığı (0-1, yüksek = AI yazısı gibi)
3. Tespit edilen sorunlar (generic phrases, repetition, structure, tone, uniqueness)
4. Güçlü yönler
5. İyileştirme önerileri

Sadece geçerli JSON formatında yanıt ver:
{
  "humanLikeScore": 0-100,
  "aiProbability": 0-1,
  "issues": [{"type": "generic-phrase|repetition|structure|tone|uniqueness", "severity": "low|medium|high", "message": "...", "suggestion": "..."}],
  "strengths": ["..."],
  "suggestions": ["..."]
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        humanLikeScore: parsed.humanLikeScore || 50,
        aiProbability: parsed.aiProbability || 0.5,
        issues: parsed.issues || [],
        strengths: parsed.strengths || [],
        suggestions: parsed.suggestions || [],
      };
    }
    
    return analyzeLocally(content, title);
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return analyzeLocally(content, title);
  }
}

/**
 * Local fallback analysis
 */
function analyzeLocally(content: string, title: string): ContentAnalysis {
  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const issues: ContentAnalysis['issues'] = [];
  const strengths: string[] = [];
  const suggestions: string[] = [];
  
  // Generic phrases detection
  const genericPhrases = [
    'bu makalede', 'bu yazıda', 'özetlemek gerekirse', 'sonuç olarak',
    'kısacası', 'birçok kişi', 'çoğu insan', 'genellikle',
  ];
  
  let genericCount = 0;
  genericPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = cleanContent.match(regex);
    if (matches) {
      genericCount += matches.length;
    }
  });
  
  if (genericCount >= 3) {
    issues.push({
      type: 'generic-phrase',
      severity: genericCount >= 5 ? 'high' : 'medium',
      message: `${genericCount} adet generic ifade tespit edildi`,
      suggestion: 'Generic ifadeleri kaldırın ve daha özgün ifadeler kullanın',
    });
  }
  
  // Repetition detection
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    const lower = word.toLowerCase();
    wordFreq[lower] = (wordFreq[lower] || 0) + 1;
  });
  
  const repeatedWords = Object.entries(wordFreq)
    .filter(([_, count]) => count > 5)
    .map(([word, count]) => ({ word, count }));
  
  if (repeatedWords.length > 0) {
    issues.push({
      type: 'repetition',
      severity: repeatedWords.length >= 3 ? 'high' : 'medium',
      message: `${repeatedWords.length} kelime çok fazla tekrar ediyor`,
      suggestion: 'Tekrar eden kelimeleri eş anlamlılarıyla değiştirin',
    });
  }
  
  // Structure analysis
  const avgSentenceLength = words.length / sentences.length;
  if (avgSentenceLength > 25) {
    issues.push({
      type: 'structure',
      severity: 'medium',
      message: 'Cümleler çok uzun',
      suggestion: 'Cümleleri kısaltın ve daha okunabilir hale getirin',
    });
  } else if (avgSentenceLength >= 10 && avgSentenceLength <= 20) {
    strengths.push('İyi cümle uzunluğu');
  }
  
  // Calculate scores
  let humanLikeScore = 70;
  let aiProbability = 0.3;
  
  if (genericCount >= 5) {
    humanLikeScore -= 20;
    aiProbability += 0.3;
  }
  if (repeatedWords.length >= 3) {
    humanLikeScore -= 15;
    aiProbability += 0.2;
  }
  if (avgSentenceLength > 25) {
    humanLikeScore -= 10;
    aiProbability += 0.1;
  }
  
  humanLikeScore = Math.max(0, Math.min(100, humanLikeScore));
  aiProbability = Math.max(0, Math.min(1, aiProbability));
  
  if (humanLikeScore < 60) {
    suggestions.push('İçeriği daha doğal ve özgün hale getirin');
    suggestions.push('Generic ifadeleri kaldırın');
    suggestions.push('Cümle yapılarını çeşitlendirin');
  }
  
  return {
    humanLikeScore,
    aiProbability,
    issues,
    strengths,
    suggestions,
  };
}

/**
 * Improve content based on analysis
 */
export async function improveContentWithAI(
  content: string,
  title: string,
  analysis: ContentAnalysis
): Promise<ImprovedContent> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (openaiKey) {
    return improveWithOpenAI(content, title, analysis);
  } else if (geminiKey) {
    return improveWithGemini(content, title, analysis);
  } else {
    return improveLocally(content, title, analysis);
  }
}

/**
 * Improve content using OpenAI
 */
async function improveWithOpenAI(
  content: string,
  title: string,
  analysis: ContentAnalysis
): Promise<ImprovedContent> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Convert ContentAnalysis to QualityAnalysis format for prompt
  const qualityAnalysis = {
    score: analysis.humanLikeScore,
    issues: analysis.issues.map(issue => ({
      message: typeof issue === 'string' ? issue : issue.message,
      suggestion: typeof issue === 'string' ? '' : issue.suggestion || '',
    })),
    suggestions: analysis.suggestions,
  };

  // Import standardized prompt
  const { CONTENT_IMPROVEMENT_PROMPT, CONTENT_IMPROVEMENT_SYSTEM_PROMPT } = await import('@/lib/admin/prompts/content-improvement');
  
  const prompt = CONTENT_IMPROVEMENT_PROMPT(content, title, qualityAnalysis);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: CONTENT_IMPROVEMENT_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const improved = response.choices[0].message.content || content;
    
    return {
      original: content,
      improved,
      changes: analysis.issues.map(issue => ({
        type: 'replaced' as const,
        improved: issue.suggestion,
        reason: issue.message,
      })),
      score: {
        before: analysis.humanLikeScore,
        after: Math.min(100, analysis.humanLikeScore + 20),
        improvement: 20,
      },
    };
  } catch (error) {
    console.error('OpenAI improvement error:', error);
    return improveLocally(content, title, analysis);
  }
}

/**
 * Improve content using Gemini
 */
async function improveWithGemini(
  content: string,
  title: string,
  analysis: ContentAnalysis
): Promise<ImprovedContent> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  // Convert ContentAnalysis to QualityAnalysis format for prompt
  const qualityAnalysis = {
    score: analysis.humanLikeScore,
    issues: analysis.issues.map(issue => ({
      message: typeof issue === 'string' ? issue : issue.message,
      suggestion: typeof issue === 'string' ? '' : issue.suggestion || '',
    })),
    suggestions: analysis.suggestions,
  };

  // Import standardized prompt
  const { CONTENT_IMPROVEMENT_PROMPT } = await import('@/lib/admin/prompts/content-improvement');
  
  const prompt = CONTENT_IMPROVEMENT_PROMPT(content, title, qualityAnalysis);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const improved = result.response.text();
    
    return {
      original: content,
      improved,
      changes: analysis.issues.map(issue => ({
        type: 'replaced' as const,
        improved: issue.suggestion,
        reason: issue.message,
      })),
      score: {
        before: analysis.humanLikeScore,
        after: Math.min(100, analysis.humanLikeScore + 20),
        improvement: 20,
      },
    };
  } catch (error) {
    console.error('Gemini improvement error:', error);
    return improveLocally(content, title, analysis);
  }
}

/**
 * Local fallback improvement
 */
function improveLocally(
  content: string,
  title: string,
  analysis: ContentAnalysis
): ImprovedContent {
  let improved = content;
  const changes: ImprovedContent['changes'] = [];
  
  // Remove generic phrases
  const genericPhrases = [
    { from: /bu makalede/gi, to: '' },
    { from: /bu yazıda/gi, to: '' },
    { from: /özetlemek gerekirse/gi, to: '' },
    { from: /sonuç olarak/gi, to: 'Sonuçta' },
    { from: /kısacası/gi, to: '' },
  ];
  
  genericPhrases.forEach(({ from, to }) => {
    if (from.test(improved)) {
      improved = improved.replace(from, to);
      changes.push({
        type: 'removed',
        improved: to || '(kaldırıldı)',
        reason: 'Generic ifade kaldırıldı',
      });
    }
  });
  
  return {
    original: content,
    improved,
    changes,
    score: {
      before: analysis.humanLikeScore,
      after: Math.min(100, analysis.humanLikeScore + 10),
      improvement: 10,
    },
  };
}
