/**
 * Legacy indexed URL: /satilik-villa (rewritten to /tr/satilik-villa by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/satilik-villa/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function SatilikVillaTrPage() {
  const Page = (await import('@/app/[locale]/satilik-villa/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
