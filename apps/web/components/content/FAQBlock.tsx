/**
 * FAQ Block Component
 * Reusable FAQ section with schema support - modern accordion (tek açık)
 * Server component - uses StructuredData (server-only) + FAQAccordion (client)
 */

import { StructuredData } from '@/components/seo/StructuredData';
import { generateFAQSchema } from '@/lib/seo/structured-data';
import { FAQAccordion } from './FAQAccordion';

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
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-gray-900 dark:text-white">
          {title}
        </h2>
        <FAQAccordion faqs={faqs} />
      </section>
    </>
  );
}
