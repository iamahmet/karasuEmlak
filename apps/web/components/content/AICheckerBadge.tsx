'use client';

import { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { cn } from '@karasu/lib';

interface AICheckerBadgeProps {
  content: string;
  title: string;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClose?: () => void;
}

interface QuickCheck {
  humanLikeScore: number;
  aiProbability: number;
}

function quickAICheck(content: string): QuickCheck {
  const cleanContent = content.replace(/<[^>]*>/g, ' ').trim();
  
  // Quick pattern detection
  const genericPhrases = [
    'bu makalede', 'bu yazıda', 'özetlemek gerekirse', 'sonuç olarak',
    'kısacası', 'birçok kişi', 'çoğu insan', 'genellikle', 'tipik olarak',
  ];
  
  let genericCount = 0;
  genericPhrases.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    const matches = cleanContent.match(regex);
    if (matches) genericCount += matches.length;
  });
  
  const aiProbability = Math.min(1, genericCount / 10);
  const humanLikeScore = Math.max(0, (1 - aiProbability) * 100);
  
  return { humanLikeScore, aiProbability };
}

export function AICheckerBadge({
  content,
  title,
  className,
  position = 'top-right',
  onClose,
}: AICheckerBadgeProps) {
  const [result, setResult] = useState<QuickCheck | null>(null);
  const [dismissed, setDismissed] = useState(false);
  
  useEffect(() => {
    if (!content || content.length < 50) {
      setResult(null);
      return;
    }
    
    const checkResult = quickAICheck(content);
    setResult(checkResult);
  }, [content]);
  
  if (!result || dismissed || result.humanLikeScore >= 70) {
    return null;
  }
  
  const isWarning = result.humanLikeScore >= 50;
  const isBad = result.humanLikeScore < 50;
  
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };
  
  const handleClose = () => {
    setDismissed(true);
    onClose?.();
  };
  
  return (
    <div
      className={cn(
        'fixed z-50 max-w-sm animate-in slide-in-from-top-5 duration-300',
        positionClasses[position],
        className
      )}
    >
      <div
        className={cn(
          'bg-white border-2 rounded-lg shadow-xl p-4',
          {
            'border-yellow-300 bg-yellow-50': isWarning,
            'border-red-300 bg-red-50': isBad,
          }
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', {
              'bg-yellow-100': isWarning,
              'bg-red-100': isBad,
            })}
          >
            {isWarning ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <Sparkles className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm text-gray-900">AI Checker</h4>
              <span
                className={cn('text-xs px-2 py-0.5 rounded font-semibold', {
                  'bg-yellow-100 text-yellow-700': isWarning,
                  'bg-red-100 text-red-700': isBad,
                })}
              >
                {Math.round(result.humanLikeScore)}%
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {isWarning
                ? 'İçerik iyileştirilebilir. Daha doğal bir dil kullanın.'
                : 'İçerik AI yazısı gibi görünüyor. İyileştirme önerilir.'}
            </p>
            <a
              href="#ai-checker"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Detaylı analiz →
            </a>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
            aria-label="Kapat"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
