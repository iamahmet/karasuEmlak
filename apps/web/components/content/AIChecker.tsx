'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Sparkles, TrendingUp, Eye, FileText, Lightbulb, AlertCircle, Zap, Shield } from 'lucide-react';
import { cn } from '@karasu/lib';
import { Button } from '@karasu/ui';

interface AICheckerProps {
  content: string;
  title: string;
  contentType?: 'blog' | 'article' | 'guide' | 'news';
  className?: string;
  showDetails?: boolean;
  onImprove?: () => void;
}

interface AICheckResult {
  humanLikeScore: number; // 0-100, yüksek = daha insan yazısı gibi
  aiProbability: number; // 0-1, yüksek = AI yazısı gibi
  issues: Array<{
    type: 'generic-phrase' | 'repetition' | 'structure' | 'tone' | 'uniqueness';
    severity: 'low' | 'medium' | 'high';
    message: string;
    suggestion: string;
  }>;
  strengths: string[];
  suggestions: string[];
  overallScore: number;
}

// AI pattern detection (client-side)
function detectAIPatterns(content: string): AICheckResult {
  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const issues: AICheckResult['issues'] = [];
  const strengths: string[] = [];
  const suggestions: string[] = [];
  
  // Generic AI phrases
  const genericPhrases = [
    'bu makalede',
    'bu yazıda',
    'özetlemek gerekirse',
    'sonuç olarak',
    'kısacası',
    'birçok kişi',
    'çoğu insan',
    'genellikle',
    'tipik olarak',
    'özellikle önemli',
    'dikkat edilmesi gereken',
    'mutlaka',
    'kesinlikle',
    'şüphesiz',
    'elbette',
  ];
  
  let genericCount = 0;
  genericPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = cleanContent.match(regex);
    if (matches) {
      genericCount += matches.length;
    }
  });
  
  if (genericCount > 5) {
    issues.push({
      type: 'generic-phrase',
      severity: genericCount > 10 ? 'high' : 'medium',
      message: `${genericCount} generic ifade tespit edildi`,
      suggestion: 'Daha özgün ve kişisel ifadeler kullanın',
    });
    suggestions.push('Generic ifadeleri kaldırın ve daha doğal dil kullanın');
  } else if (genericCount === 0) {
    strengths.push('Generic ifadeler kullanılmamış');
  }
  
  // Repetition check
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    const lower = word.toLowerCase();
    wordFreq[lower] = (wordFreq[lower] || 0) + 1;
  });
  
  const repeatedWords = Object.entries(wordFreq)
    .filter(([_, count]) => count > 10)
    .map(([word]) => word);
  
  if (repeatedWords.length > 0) {
    issues.push({
      type: 'repetition',
      severity: repeatedWords.length > 3 ? 'high' : 'medium',
      message: `${repeatedWords.length} kelime çok fazla tekrarlanmış`,
      suggestion: 'Eş anlamlı kelimeler kullanarak tekrarları azaltın',
    });
    suggestions.push('Tekrar eden kelimeleri eş anlamlılarıyla değiştirin');
  }
  
  // Sentence structure (too uniform = AI-like)
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance = sentenceLengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
  
  if (variance < 10 && sentenceLengths.length > 5) {
    issues.push({
      type: 'structure',
      severity: 'medium',
      message: 'Cümle yapıları çok benzer',
      suggestion: 'Cümle uzunluklarını ve yapılarını çeşitlendirin',
    });
    suggestions.push('Kısa ve uzun cümleleri karıştırarak daha doğal bir akış oluşturun');
  } else if (variance > 50) {
    strengths.push('Cümle yapıları çeşitli');
  }
  
  // Tone check (too formal = AI-like)
  const formalWords = ['olmak', 'bulunmak', 'gerçekleştirmek', 'yapılmak', 'edilmek'];
  const formalCount = formalWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\w*`, 'gi');
    return count + (cleanContent.match(regex) || []).length;
  }, 0);
  
  if (formalCount > words.length * 0.05) {
    issues.push({
      type: 'tone',
      severity: 'low',
      message: 'Çok resmi bir dil kullanılmış',
      suggestion: 'Daha samimi ve doğal bir ton kullanın',
    });
    suggestions.push('Resmi ifadeleri daha samimi alternatiflerle değiştirin');
  } else {
    strengths.push('Dil tonu uygun');
  }
  
  // Calculate scores
  const issueScore = issues.reduce((acc, issue) => {
    const weight = issue.severity === 'high' ? 0.3 : issue.severity === 'medium' ? 0.2 : 0.1;
    return acc + weight;
  }, 0);
  
  const aiProbability = Math.min(1, issueScore);
  const humanLikeScore = Math.max(0, Math.min(100, (1 - aiProbability) * 100));
  
  // Overall score (weighted)
  const overallScore = Math.round(
    humanLikeScore * 0.6 +
    (strengths.length > 0 ? 20 : 0) +
    (issues.length === 0 ? 20 : 0)
  );
  
  return {
    humanLikeScore,
    aiProbability,
    issues,
    strengths,
    suggestions,
    overallScore,
  };
}

export function AIChecker({
  content,
  title,
  contentType = 'blog',
  className,
  showDetails = true,
  onImprove,
}: AICheckerProps) {
  const [result, setResult] = useState<AICheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  
  useEffect(() => {
    if (!content || content.length < 50) {
      setResult(null);
      setLoading(false);
      return;
    }
    
    // Simulate async check (can be replaced with API call)
    const timer = setTimeout(() => {
      const checkResult = detectAIPatterns(content);
      setResult(checkResult);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [content, title]);
  
  if (loading) {
    return (
      <div className={cn('bg-white border-2 border-gray-200 rounded-xl p-6', className)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!result) {
    return null;
  }
  
  const isGood = result.humanLikeScore >= 70;
  const isWarning = result.humanLikeScore >= 50 && result.humanLikeScore < 70;
  const isBad = result.humanLikeScore < 50;
  
  const statusColor = isGood ? 'green' : isWarning ? 'yellow' : 'red';
  const statusIcon = isGood ? CheckCircle : isWarning ? AlertTriangle : AlertCircle;
  const StatusIcon = statusIcon;
  
  return (
    <div className={cn('bg-white border-2 rounded-xl overflow-hidden', className, {
      'border-green-200': isGood,
      'border-yellow-200': isWarning,
      'border-red-200': isBad,
    })}>
      {/* Header */}
      <div
        className={cn('p-4 cursor-pointer hover:bg-gray-50 transition-colors', {
          'bg-green-50': isGood,
          'bg-yellow-50': isWarning,
          'bg-red-50': isBad,
        })}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', {
              'bg-green-100': isGood,
              'bg-yellow-100': isWarning,
              'bg-red-100': isBad,
            })}>
              <StatusIcon className={cn('h-5 w-5', {
                'text-green-600': isGood,
                'text-yellow-600': isWarning,
                'text-red-600': isBad,
              })} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Checker
              </h3>
              <p className="text-sm text-gray-600">
                {isGood ? 'İçerik insan yazısı gibi görünüyor' : 
                 isWarning ? 'İçerik iyileştirilebilir' : 
                 'İçerik AI yazısı gibi görünüyor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Score Badge */}
            <div className={cn('px-3 py-1.5 rounded-lg font-bold text-sm', {
              'bg-green-100 text-green-700': isGood,
              'bg-yellow-100 text-yellow-700': isWarning,
              'bg-red-100 text-red-700': isBad,
            })}>
              {result.overallScore}/100
            </div>
            <svg
              className={cn('w-5 h-5 text-gray-400 transition-transform', {
                'rotate-180': expanded,
              })}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="mt-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-600">
              İnsan Yazısı: <span className="font-semibold">{Math.round(result.humanLikeScore)}%</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-600">
              Sorun: <span className="font-semibold">{result.issues.length}</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Expanded Content */}
      {expanded && showDetails && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-600">Genel Skor</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{result.overallScore}</div>
              <div className="text-xs text-gray-500">/ 100</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-xs font-semibold text-gray-600">İnsan Yazısı</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(result.humanLikeScore)}</div>
              <div className="text-xs text-gray-500">%</div>
            </div>
          </div>
          
          {/* Issues */}
          {result.issues.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Tespit Edilen Sorunlar
              </h4>
              <div className="space-y-2">
                {result.issues.map((issue, index) => (
                  <div
                    key={index}
                    className={cn('p-3 rounded-lg border-l-4', {
                      'bg-red-50 border-red-400': issue.severity === 'high',
                      'bg-yellow-50 border-yellow-400': issue.severity === 'medium',
                      'bg-blue-50 border-blue-400': issue.severity === 'low',
                    })}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900">{issue.message}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded', {
                        'bg-red-100 text-red-700': issue.severity === 'high',
                        'bg-yellow-100 text-yellow-700': issue.severity === 'medium',
                        'bg-blue-100 text-blue-700': issue.severity === 'low',
                      })}>
                        {issue.severity === 'high' ? 'Yüksek' : issue.severity === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      <Lightbulb className="h-3 w-3 inline mr-1" />
                      {issue.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Güçlü Yönler
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.strengths.map((strength, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium"
                  >
                    {strength}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-600" />
                İyileştirme Önerileri
              </h4>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Action Button */}
          {onImprove && result.issues.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <Button
                onClick={onImprove}
                className="w-full bg-primary text-white hover:bg-primary-dark"
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                İçeriği İyileştir
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
