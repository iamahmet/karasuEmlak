/**
 * Quality gate checks for content
 */

export interface QualityCheckResult {
  passed: boolean;
  score: number;
  issues: QualityIssue[];
  suggestions: string[];
}

export interface QualityIssue {
  type: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  severity: number; // 0-100
}

/**
 * Minimum quality score threshold
 */
const MIN_QUALITY_SCORE = 60;

/**
 * Check content quality
 * 
 * @param content - Content data
 * @returns QualityCheckResult
 */
export function checkContentQuality(content: {
  title?: string;
  content?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  slug?: string;
  tags?: string[];
  images?: string[];
}): QualityCheckResult {
  const issues: QualityIssue[] = [];
  let score = 100;

  // Title checks
  if (!content.title || content.title.trim().length === 0) {
    issues.push({
      type: 'error',
      field: 'title',
      message: 'Title is required',
      severity: 20,
    });
    score -= 20;
  } else if (content.title.length < 10) {
    issues.push({
      type: 'warning',
      field: 'title',
      message: 'Title is too short (minimum 10 characters)',
      severity: 10,
    });
    score -= 10;
  } else if (content.title.length > 60) {
    issues.push({
      type: 'warning',
      field: 'title',
      message: 'Title is too long (maximum 60 characters recommended)',
      severity: 5,
    });
    score -= 5;
  }

  // Content checks
  if (!content.content || content.content.trim().length === 0) {
    issues.push({
      type: 'error',
      field: 'content',
      message: 'Content is required',
      severity: 30,
    });
    score -= 30;
  } else if (content.content.length < 300) {
    issues.push({
      type: 'warning',
      field: 'content',
      message: 'Content is too short (minimum 300 characters recommended)',
      severity: 15,
    });
    score -= 15;
  }

  // Excerpt checks
  if (!content.excerpt || content.excerpt.trim().length === 0) {
    issues.push({
      type: 'warning',
      field: 'excerpt',
      message: 'Excerpt is recommended for better SEO',
      severity: 5,
    });
    score -= 5;
  } else if (content.excerpt.length > 160) {
    issues.push({
      type: 'warning',
      field: 'excerpt',
      message: 'Excerpt is too long (maximum 160 characters recommended)',
      severity: 5,
    });
    score -= 5;
  }

  // Meta title checks
  if (!content.meta_title || content.meta_title.trim().length === 0) {
    issues.push({
      type: 'warning',
      field: 'meta_title',
      message: 'Meta title is recommended for SEO',
      severity: 10,
    });
    score -= 10;
  } else if (content.meta_title.length > 60) {
    issues.push({
      type: 'warning',
      field: 'meta_title',
      message: 'Meta title is too long (maximum 60 characters)',
      severity: 5,
    });
    score -= 5;
  }

  // Meta description checks
  if (!content.meta_description || content.meta_description.trim().length === 0) {
    issues.push({
      type: 'warning',
      field: 'meta_description',
      message: 'Meta description is recommended for SEO',
      severity: 10,
    });
    score -= 10;
  } else if (content.meta_description.length > 160) {
    issues.push({
      type: 'warning',
      field: 'meta_description',
      message: 'Meta description is too long (maximum 160 characters)',
      severity: 5,
    });
    score -= 5;
  }

  // Slug checks
  if (!content.slug || content.slug.trim().length === 0) {
    issues.push({
      type: 'error',
      field: 'slug',
      message: 'Slug is required',
      severity: 15,
    });
    score -= 15;
  }

  // Tags checks
  if (!content.tags || content.tags.length === 0) {
    issues.push({
      type: 'info',
      field: 'tags',
      message: 'Tags are recommended for better categorization',
      severity: 5,
    });
    score -= 5;
  }

  // Images checks
  if (!content.images || content.images.length === 0) {
    issues.push({
      type: 'info',
      field: 'images',
      message: 'Images are recommended for better engagement',
      severity: 5,
    });
    score -= 5;
  }

  // Generate suggestions
  const suggestions: string[] = [];
  if (score < MIN_QUALITY_SCORE) {
    suggestions.push('Content quality is below recommended threshold. Please address the issues above.');
  }
  if (!content.meta_title) {
    suggestions.push('Add a meta title for better SEO performance.');
  }
  if (!content.meta_description) {
    suggestions.push('Add a meta description for better search engine visibility.');
  }
  if (content.content && content.content.length < 500) {
    suggestions.push('Consider expanding your content to at least 500 characters for better SEO.');
  }

  return {
    passed: score >= MIN_QUALITY_SCORE,
    score: Math.max(0, score),
    issues,
    suggestions,
  };
}

/**
 * Check if content can be published
 * 
 * @param content - Content data
 * @returns boolean
 */
export function canPublishContent(content: {
  title?: string;
  content?: string;
  slug?: string;
}): boolean {
  const qualityCheck = checkContentQuality(content);
  return qualityCheck.passed && qualityCheck.issues.filter(i => i.type === 'error').length === 0;
}

