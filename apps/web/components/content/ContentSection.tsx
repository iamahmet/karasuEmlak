/**
 * Content Section Component
 * Reusable sectioned content with H2/H3 hierarchy
 */

import { ReactNode } from 'react';
import { Card, CardContent } from '@karasu/ui';

interface ContentSectionProps {
  title: string;
  level?: 2 | 3;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'card' | 'gradient';
}

export function ContentSection({
  title,
  level = 2,
  description,
  children,
  className = '',
  variant = 'default',
}: ContentSectionProps) {
  const HeadingTag = level === 2 ? 'h2' : 'h3';
  const headingClasses = level === 2
    ? 'text-2xl md:text-3xl font-semibold mb-4 text-gray-900'
    : 'text-xl md:text-2xl font-semibold mb-3 text-gray-900';

  const content = (
    <>
      <HeadingTag className={headingClasses}>
        {title}
      </HeadingTag>
      {description && (
        <p className="text-gray-600 max-w-3xl mb-6 leading-relaxed">
          {description}
        </p>
      )}
      <div className="prose prose-gray max-w-none">
        {children}
      </div>
    </>
  );

  if (variant === 'card') {
    return (
      <section className={`mb-8 md:mb-12 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            {content}
          </CardContent>
        </Card>
      </section>
    );
  }

  if (variant === 'gradient') {
    return (
      <section className={`mb-8 md:mb-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 md:p-8 border border-gray-100 ${className}`}>
        {content}
      </section>
    );
  }

  return (
    <section className={`mb-8 md:mb-12 ${className}`}>
      {content}
    </section>
  );
}
