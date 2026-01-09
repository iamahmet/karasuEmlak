"use client";

import Link from 'next/link';

/**
 * Skip to Content Link
 * Allows keyboard users to skip navigation
 */
export function SkipToContent() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#006AFF] focus:text-white focus:rounded-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[#006AFF] focus:ring-offset-2"
    >
      Ana içeriğe geç
    </Link>
  );
}
