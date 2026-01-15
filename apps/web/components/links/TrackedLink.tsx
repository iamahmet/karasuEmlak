"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { trackInternalLink, trackExternalLink, trackLinkClick } from '@/lib/analytics/link-tracking';
import { siteConfig } from '@karasu-emlak/config';
import type { ComponentProps } from 'react';

interface TrackedLinkProps extends Omit<ComponentProps<typeof Link>, 'onClick'> {
  children: React.ReactNode;
  category?: string;
  position?: number;
  trackClick?: boolean;
  prefetch?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * TrackedLink Component
 * 
 * Enhanced Next.js Link with automatic click tracking and optimizations:
 * - Automatic click tracking for analytics
 * - Smart prefetching for internal links
 * - External link handling with security
 * - Accessibility improvements
 */
export function TrackedLink({
  href,
  children,
  category,
  position,
  trackClick = true,
  prefetch,
  className,
  ...props
}: TrackedLinkProps) {
  const pathname = usePathname();
  const hrefString = typeof href === 'string' ? href : href.pathname || '';
  
  // Determine if link is external
  const isExternal = hrefString.startsWith('http') && !hrefString.includes(siteConfig.url);
  const isInternal = !isExternal && hrefString.startsWith('/');
  
  // Determine prefetch strategy
  const shouldPrefetch = prefetch !== undefined 
    ? prefetch 
    : isInternal && !hrefString.includes('#') && !hrefString.includes('?');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (trackClick) {
      if (isExternal) {
        trackExternalLink(hrefString, getLinkText(children), category);
      } else if (isInternal) {
        trackInternalLink(hrefString, getLinkText(children), category, position);
      } else {
        // Handle special links (tel:, mailto:, etc.)
        const linkType = hrefString.startsWith('tel:') ? 'phone' 
          : hrefString.startsWith('mailto:') ? 'email'
          : hrefString.startsWith('#') ? 'internal'
          : 'internal';
        trackLinkClick(hrefString, getLinkText(children), linkType, category, position);
      }
    }

    // Call original onClick if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  // For external links, use regular <a> tag with security attributes
  if (isExternal) {
    return (
      <a
        href={hrefString}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={handleClick}
        aria-label={props['aria-label'] || (typeof children === 'string' ? children : undefined)}
      >
        {children}
      </a>
    );
  }

  // For internal links, use Next.js Link
  const { onClick: _onClick, ...linkProps } = props;
  return (
    <Link
      href={href}
      prefetch={shouldPrefetch}
      className={className}
      onClick={handleClick}
      {...linkProps}
    >
      {children}
    </Link>
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
