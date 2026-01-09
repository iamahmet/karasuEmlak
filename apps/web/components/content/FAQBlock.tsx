/**
 * FAQ Block Component
 * Reusable FAQ section with schema support
 */

import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { ContentRenderer } from './ContentRenderer';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQBlockProps {
  faqs: FAQ[];
  title?: string;
  className?: string;
}

export function FAQBlock({
  faqs,
  title = 'Sık Sorulan Sorular',
  className = '',
}: FAQBlockProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  const faqSchema = generateFAQSchema(faqs);

  return (
    <>
      {faqSchema && <StructuredData data={faqSchema} />}
      
      <section className={`mb-8 md:mb-12 ${className}`}>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-gray-900">
          {title}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group bg-muted/50 rounded-xl p-4 md:p-6 border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <summary className="cursor-pointer flex items-center justify-between list-none">
                <h3 className="text-base md:text-lg font-semibold pr-4 text-gray-900">
                  {faq.question}
                </h3>
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <ContentRenderer
                  content={faq.answer}
                  format="auto"
                  sanitize={true}
                  prose={false}
                  className="text-sm md:text-base text-gray-700 leading-relaxed"
                />
              </div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
