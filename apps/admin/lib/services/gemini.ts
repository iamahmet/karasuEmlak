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
    const { CONTENT_ANALYSIS_PROMPT, CONTENT_ANALYSIS_SYSTEM_PROMPT } = await import('@/lib/prompts/content-analysis');
    
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    const prompt = CONTENT_ANALYSIS_PROMPT(cleanContent, title, context);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheapest OpenAI model
      messages: [
        { role: 'system', content: CONTENT_ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3, // Lower temperature for consistent analysis
      max_tokens: 1500, // Reduced from 2000 for token savings
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
    const { CONTENT_IMPROVEMENT_PROMPT, CONTENT_IMPROVEMENT_SYSTEM_PROMPT } = await import('@/lib/prompts/content-improvement');
    
    const prompt = CONTENT_IMPROVEMENT_PROMPT(content, title, qualityAnalysis);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CONTENT_IMPROVEMENT_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 3500, // Reduced from 4000 for token savings
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
    const { CONTENT_ANALYSIS_PROMPT } = await import('@/lib/prompts/content-analysis');
    
    // Clean content but keep structure for better analysis
    const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
    
    const prompt = CONTENT_ANALYSIS_PROMPT(cleanContent, title, context);

    // Token optimization: Use cheaper models first, fallback to better ones
    // Start with flash (cheapest), then pro (better quality)
    let model;
    let result;
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of modelsToTry) {
      try {
        model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.3, // Lower temperature for consistent analysis
            maxOutputTokens: 1500, // Reduced from 2000 for token savings
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
    const { CONTENT_IMPROVEMENT_PROMPT } = await import('@/lib/prompts/content-improvement');
    
    const prompt = CONTENT_IMPROVEMENT_PROMPT(content, title, qualityAnalysis);

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
            maxOutputTokens: 3500, // Reduced from 4000 for token savings
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
