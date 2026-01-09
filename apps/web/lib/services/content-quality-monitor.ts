/**
 * Content Quality Monitoring Service
 * 
 * Daily quality checks, alerts, and trend tracking for content quality.
 */

import { createServiceClient } from '@karasu/lib/supabase/service';
import { detectLowQualityContent } from '@/lib/utils/content-quality-checker';

export interface QualityAlert {
  type: 'low_quality' | 'ai_detected' | 'html_error' | 'seo_issue';
  severity: 'low' | 'medium' | 'high';
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleType: 'article' | 'news';
  message: string;
  score?: number;
  timestamp: string;
}

export interface QualityTrend {
  date: string;
  averageScore: number;
  totalArticles: number;
  lowQualityCount: number;
  highQualityCount: number;
}

/**
 * Check content quality for all published articles
 */
export async function checkAllContentQuality(): Promise<QualityAlert[]> {
  const supabase = createServiceClient();
  const alerts: QualityAlert[] = [];

  try {
    // Check articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, slug, content, quality_score')
      .eq('status', 'published')
      .limit(100); // Check first 100 for performance

    if (!articlesError && articles) {
      for (const article of articles) {
        if (!article.content) continue;

        const qualityScore = detectLowQualityContent(article.content, article.title);

        // Low quality alert
        if (qualityScore.overall < 50) {
          alerts.push({
            type: 'low_quality',
            severity: 'high',
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleType: 'article',
            message: `Düşük kalite skoru: ${qualityScore.overall}/100`,
            score: qualityScore.overall,
            timestamp: new Date().toISOString(),
          });
        }

        // AI detected alert
        if (qualityScore.aiProbability > 0.7) {
          alerts.push({
            type: 'ai_detected',
            severity: 'medium',
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleType: 'article',
            message: `Yüksek AI olasılığı: ${Math.round(qualityScore.aiProbability * 100)}%`,
            score: qualityScore.overall,
            timestamp: new Date().toISOString(),
          });
        }

        // HTML errors
        if (qualityScore.issues.some(issue => issue.type === 'html-structure')) {
          alerts.push({
            type: 'html_error',
            severity: 'medium',
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleType: 'article',
            message: 'HTML yapı sorunları tespit edildi',
            score: qualityScore.overall,
            timestamp: new Date().toISOString(),
          });
        }

        // SEO issues
        if (qualityScore.seo < 50) {
          alerts.push({
            type: 'seo_issue',
            severity: 'low',
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleType: 'article',
            message: `Düşük SEO skoru: ${qualityScore.seo}/100`,
            score: qualityScore.overall,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Check news articles
    const { data: newsArticles, error: newsError } = await supabase
      .from('news_articles')
      .select('id, title, slug, original_summary, emlak_analysis, quality_score')
      .eq('status', 'published')
      .limit(100);

    if (!newsError && newsArticles) {
      for (const article of newsArticles) {
        const content = `${article.original_summary || ''} ${article.emlak_analysis || ''}`.trim();
        if (!content) continue;

        const qualityScore = detectLowQualityContent(content, article.title);

        if (qualityScore.overall < 50) {
          alerts.push({
            type: 'low_quality',
            severity: 'high',
            articleId: article.id,
            articleTitle: article.title,
            articleSlug: article.slug,
            articleType: 'news',
            message: `Düşük kalite skoru: ${qualityScore.overall}/100`,
            score: qualityScore.overall,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    console.error('[Content Quality Monitor] Error checking quality:', error);
  }

  return alerts;
}

/**
 * Get quality trends (last 30 days)
 */
export async function getQualityTrends(): Promise<QualityTrend[]> {
  const supabase = createServiceClient();
  const trends: QualityTrend[] = [];

  try {
    // Get articles from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, quality_score, published_at')
      .eq('status', 'published')
      .gte('published_at', thirtyDaysAgo.toISOString());

    if (error || !articles) {
      return trends;
    }

    // Group by date
    const byDate = new Map<string, number[]>();

    articles.forEach(article => {
      if (!article.published_at || !article.quality_score) return;
      
      const date = new Date(article.published_at).toISOString().split('T')[0];
      if (!byDate.has(date)) {
        byDate.set(date, []);
      }
      byDate.get(date)!.push(article.quality_score);
    });

    // Calculate trends
    byDate.forEach((scores, date) => {
      const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const lowQualityCount = scores.filter(s => s < 50).length;
      const highQualityCount = scores.filter(s => s >= 70).length;

      trends.push({
        date,
        averageScore,
        totalArticles: scores.length,
        lowQualityCount,
        highQualityCount,
      });
    });

    // Sort by date
    trends.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('[Content Quality Monitor] Error getting trends:', error);
  }

  return trends;
}

/**
 * Send quality alerts (to be implemented with notification system)
 */
export async function sendQualityAlerts(alerts: QualityAlert[]): Promise<void> {
  // TODO: Implement notification system
  // This could send emails, Slack messages, or create admin notifications
  console.log(`[Content Quality Monitor] ${alerts.length} alerts generated`);
  
  // Group by severity
  const highSeverity = alerts.filter(a => a.severity === 'high');
  const mediumSeverity = alerts.filter(a => a.severity === 'medium');
  const lowSeverity = alerts.filter(a => a.severity === 'low');

  if (highSeverity.length > 0) {
    console.warn(`[Content Quality Monitor] ${highSeverity.length} high severity alerts`);
  }
  if (mediumSeverity.length > 0) {
    console.info(`[Content Quality Monitor] ${mediumSeverity.length} medium severity alerts`);
  }
  if (lowSeverity.length > 0) {
    console.info(`[Content Quality Monitor] ${lowSeverity.length} low severity alerts`);
  }
}
