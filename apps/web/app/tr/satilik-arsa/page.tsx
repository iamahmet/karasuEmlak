/**
 * Legacy indexed URL: /satilik-arsa (rewritten to /tr/satilik-arsa by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/satilik-arsa/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function SatilikArsaTrPage() {
  const Page = (await import('@/app/[locale]/satilik-arsa/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
