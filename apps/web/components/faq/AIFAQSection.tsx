/**
 * AI FAQ Section Component
 * 
 * Renders FAQ sections using ai_questions from database.
 * Falls back to provided static FAQs if no database Q&As found.
 */

import { AIQuestion } from '@/lib/supabase/queries/ai-questions';
import dynamic from 'next/dynamic';

const ScrollReveal = dynamic(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  ssr: false,
});

interface FAQItem {
  question: string;
  answer: string;
}

interface AIFAQSectionProps {
  questions: AIQuestion[] | FAQItem[];
  title?: string;
  description?: string;
  className?: string;
  maxQuestions?: number;
}

export function AIFAQSection({
  questions,
  title = 'Sık Sorulan Sorular',
  description,
  className = '',
  maxQuestions = 10,
}: AIFAQSectionProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  const displayQuestions = questions.slice(0, maxQuestions);

  return (
    <section className={`py-16 bg-white border-t border-gray-200 ${className}`}>
      <div className="container mx-auto px-4 max-w-4xl">
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-base text-gray-600">
                {description}
              </p>
            )}
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {displayQuestions.map((faq, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 50}>
              <details className="group bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-primary transition-all duration-200 hover:shadow-md">
                <summary className="cursor-pointer flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4 group-hover:text-primary transition-colors">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-gray-500 flex-shrink-0 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
