/**
 * Redirect /tip/[slug]/ilan/[listingSlug] to /ilan/[listingSlug]
 * Legacy route support
 */

import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

export default async function LegacyListingRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string; listingSlug: string }>;
}) {
  const { locale, listingSlug } = await params;
  const basePath = locale === routing.defaultLocale ? '' : `/${locale}`;
  
  // Redirect to correct route
  redirect(`${basePath}/ilan/${listingSlug}`);
}
