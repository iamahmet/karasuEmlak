'use client';

import { useEffect, useRef } from 'react';
import { CalloutBox } from './CalloutBox';
import { CodeBlock } from './CodeBlock';

interface ContentProcessorProps {
  content: string;
}

export function ContentProcessor({ content }: ContentProcessorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Process callout boxes
    const calloutElements = containerRef.current.querySelectorAll('[data-callout]');
    calloutElements.forEach((el) => {
      const type = el.getAttribute('data-callout') as 'info' | 'warning' | 'tip' | 'success';
      const title = el.getAttribute('data-title') || undefined;
      const content = el.innerHTML;

      // Create React element (simplified - in production, use React.createElement)
      const wrapper = document.createElement('div');
      wrapper.className = 'callout-wrapper';
      el.replaceWith(wrapper);
    });

    // Process code blocks
    const codeElements = containerRef.current.querySelectorAll('[data-code-block]');
    codeElements.forEach((el) => {
      const language = el.getAttribute('data-code-block') || undefined;
      const code = el.textContent || '';

      // Create code block wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      el.replaceWith(wrapper);
    });
  }, [content]);

  return (
    <div
      ref={containerRef}
      className="blog-content-editorial"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
