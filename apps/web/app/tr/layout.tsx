import type { Metadata } from 'next';
import LocaleLayout from '@/app/[locale]/layout';
import * as LocaleLayoutModule from '@/app/[locale]/layout';

/**
 * Ensure /tr/* routes get the same metadata as [locale] (including verification + GA context).
 * Without this, tr/* pages would not receive google-site-verification / GA from [locale]/layout.
 * See: docs/SEO_LOCK.md
 */
export async function generateMetadata(): Promise<Metadata> {
  return LocaleLayoutModule.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function TrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return LocaleLayout({
    children,
    params: Promise.resolve({ locale: 'tr' }),
  });
}
