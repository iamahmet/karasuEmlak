"use client";

import { trackExternalLink } from '@/lib/analytics/link-tracking';
import type { ComponentProps } from 'react';

interface ExternalLinkProps extends Omit<ComponentProps<'a'>, 'target' | 'rel'> {
  children: React.ReactNode;
  category?: string;
  trackClick?: boolean;
  noReferrer?: boolean;
}

/**
 * ExternalLink Component
 * 
 * Secure external link component with:
 * - Automatic security attributes (noopener, noreferrer)
 * - Click tracking
 * - Accessibility improvements
 * - Visual indicator for external links
 */
export function ExternalLink({
  href,
  children,
  category,
  trackClick = true,
  noReferrer = true,
  className = '',
  ...props
}: ExternalLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (trackClick && href) {
      trackExternalLink(href, getLinkText(children), category);
    }

    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <a
      href={href}
      target="_blank"
      rel={noReferrer ? 'noopener noreferrer' : 'noopener'}
      className={`inline-flex items-center gap-1 ${className}`}
      onClick={handleClick}
      aria-label={props['aria-label'] || (typeof children === 'string' ? `${children} (Yeni sekmede açılır)` : undefined)}
      {...props}
    >
      {children}
      <span className="inline-block ml-0.5 text-xs opacity-60" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}

/**
 * Extract text content from React children
 */
function getLinkText(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  if (typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(getLinkText).join(' ');
  }
  if (children && typeof children === 'object' && 'props' in children) {
    return getLinkText(children.props?.children || '');
  }
  return '';
}
