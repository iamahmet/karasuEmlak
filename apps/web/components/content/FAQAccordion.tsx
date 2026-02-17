'use client';

/**
 * FAQ Accordion - Client component for interactive accordion UI
 * Used by FAQBlock (server component)
 */

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@karasu/ui';
import { cn } from '@karasu/lib';
import { ContentRenderer } from './ContentRenderer';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  className?: string;
}

export function FAQAccordion({ faqs, className = '' }: FAQAccordionProps) {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible className={cn('space-y-3', className)}>
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`faq-${index}`}
          className="border-b-0 border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 data-[state=open]:border-primary dark:data-[state=open]:border-primary/50 data-[state=open]:shadow-lg transition-all duration-300"
        >
          <AccordionTrigger className="px-6 py-5 hover:no-underline [&[data-state=open]]:text-primary">
            <span className="text-base md:text-lg font-bold leading-snug text-left pr-4 text-gray-900 dark:text-white">
              {faq.question}
            </span>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="p-5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <ContentRenderer
                content={faq.answer}
                format="auto"
                sanitize={true}
                prose={false}
                className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
