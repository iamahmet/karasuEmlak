/**
 * Page Intro Component
 * Reusable intro section with H1, description, and optional stats
 */

import { ReactNode } from 'react';

interface PageIntroProps {
  title: string;
  description: string;
  stats?: Array<{ label: string; value: string | number }>;
  children?: ReactNode;
  className?: string;
}

export function PageIntro({
  title,
  description,
  stats,
  children,
  className = '',
}: PageIntroProps) {
  return (
    <section className={`mb-8 md:mb-12 ${className}`}>
      <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl p-6 md:p-8 lg:p-12 border border-blue-100">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-4xl mb-6 leading-relaxed">
          {description}
        </p>
        
        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-4 md:gap-6 mt-6 pt-6 border-t border-blue-200">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                <span className="font-semibold text-gray-900">{stat.value}</span>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
