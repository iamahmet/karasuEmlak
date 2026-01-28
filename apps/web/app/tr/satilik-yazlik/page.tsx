/**
 * Legacy indexed URL: /satilik-yazlik (rewritten to /tr/satilik-yazlik by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/satilik-yazlik/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function SatilikYazlikTrPage() {
  const Page = (await import('@/app/[locale]/satilik-yazlik/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
