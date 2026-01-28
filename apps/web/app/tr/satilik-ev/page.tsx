/**
 * Legacy indexed URL: /satilik-ev (rewritten to /tr/satilik-ev by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/satilik-ev/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function SatilikEvTrPage() {
  const Page = (await import('@/app/[locale]/satilik-ev/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
