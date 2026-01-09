/**
 * AI Response Optimization (SGE - Search Generative Experience)
 * 
 * Optimizes content for AI-powered search results including:
 * - Google SGE (Search Generative Experience)
 * - ChatGPT-style responses
 * - AI Overviews
 * 
 * Best Practices:
 * - Clear, concise answers to common questions
 * - Structured data (FAQ, HowTo, QAPage)
 * - Natural language content
 * - Authoritative sources
 * - Up-to-date information
 */

import { siteConfig } from '@karasu-emlak/config';

export interface AIOptimizedContent {
  question: string;
  answer: string;
  source?: string;
  lastUpdated?: string;
  relatedQuestions?: string[];
}

/**
 * Generate HowTo schema for step-by-step guides
 * Useful for AI responses about processes
 */
export function generateHowToSchema({
  name,
  description,
  steps,
  totalTime,
  image,
  url,
}: {
  name: string;
  description?: string;
  steps: Array<{
    name: string;
    text: string;
    image?: string;
    url?: string;
  }>;
  totalTime?: string;
  image?: string;
  url?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    ...(description && { description }),
    ...(image && { image }),
    ...(url && { url }),
    ...(totalTime && { totalTime }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
      ...(step.url && { url: step.url }),
    })),
  };
}

/**
 * Generate QAPage schema for question-answer pages
 * Better for AI extraction than FAQPage in some cases
 */
export function generateQAPageSchema(questions: Array<{
  question: string;
  answer: string;
  author?: string;
  datePublished?: string;
  upvoteCount?: number;
}>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    mainEntity: {
      '@type': 'Question',
      name: questions[0]?.question || '',
      acceptedAnswer: questions.map(qa => ({
        '@type': 'Answer',
        text: qa.answer,
        ...(qa.author && { author: { '@type': 'Person', name: qa.author } }),
        ...(qa.datePublished && { datePublished: qa.datePublished }),
        ...(qa.upvoteCount && { upvoteCount: qa.upvoteCount }),
      })),
    },
  };
}

/**
 * Generate Speakable schema for voice search and AI
 * Helps AI understand which parts of content to read aloud
 */
export function generateSpeakableSchema({
  cssSelector,
  xpath,
}: {
  cssSelector?: string[];
  xpath?: string[];
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SpeakableSpecification',
    ...(cssSelector && { cssSelector }),
    ...(xpath && { xpath }),
  };
}

/**
 * Generate Article schema optimized for AI
 * Includes more metadata for better AI understanding
 */
export function generateAIOptimizedArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  publisher,
  articleSection,
  keywords,
  wordCount,
  inLanguage = 'tr',
}: {
  headline: string;
  description?: string;
  image?: string[];
  datePublished: string;
  dateModified?: string;
  author?: string;
  publisher?: string;
  articleSection?: string;
  keywords?: string[];
  wordCount?: number;
  inLanguage?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description && { description }),
    ...(image && { image }),
    datePublished,
    ...(dateModified && { dateModified }),
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
      },
    }),
    publisher: {
      '@type': 'Organization',
      name: publisher || siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    ...(articleSection && { articleSection }),
    ...(keywords && keywords.length > 0 && { keywords: keywords.join(', ') }),
    ...(wordCount && { wordCount }),
    inLanguage,
  };
}

/**
 * Generate FAQ schema optimized for AI responses
 * Enhanced version with more context
 */
export function generateAIOptimizedFAQSchema(questions: Array<{
  question: string;
  answer: string;
  category?: string;
  lastUpdated?: string;
}>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(qa => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
        ...(qa.lastUpdated && { dateModified: qa.lastUpdated }),
      },
      ...(qa.category && { category: qa.category }),
    })),
  };
}

/**
 * Generate Review schema for AI to understand ratings
 */
export function generateReviewSchema({
  itemName,
  ratingValue,
  bestRating = 5,
  worstRating = 1,
  reviewCount,
  author,
}: {
  itemName: string;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  reviewCount?: number;
  author?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: {
      '@type': 'Thing',
      name: itemName,
    },
    ratingValue,
    bestRating,
    worstRating,
    ...(reviewCount && { reviewCount }),
    ...(author && { author: { '@type': 'Person', name: author } }),
  };
}

/**
 * Generate VideoObject schema for video content
 * Helps AI understand video content
 */
export function generateVideoObjectSchema({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
}: {
  name: string;
  description?: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  contentUrl?: string;
  embedUrl?: string;
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    ...(description && { description }),
    thumbnailUrl,
    uploadDate,
    ...(duration && { duration }),
    ...(contentUrl && { contentUrl }),
    ...(embedUrl && { embedUrl }),
  };
}

/**
 * Extract key information for AI responses
 * Creates a summary that AI can easily parse
 */
export function extractAIKeyInfo(content: {
  title: string;
  description: string;
  content: string;
  faqs?: Array<{ question: string; answer: string }>;
}): AIOptimizedContent[] {
  const keyInfo: AIOptimizedContent[] = [];

  // Main question-answer pair
  keyInfo.push({
    question: content.title,
    answer: content.description,
    source: siteConfig.url,
    lastUpdated: new Date().toISOString(),
  });

  // FAQ pairs
  if (content.faqs) {
    content.faqs.forEach(faq => {
      keyInfo.push({
        question: faq.question,
        answer: faq.answer,
        source: siteConfig.url,
        lastUpdated: new Date().toISOString(),
      });
    });
  }

  return keyInfo;
}
