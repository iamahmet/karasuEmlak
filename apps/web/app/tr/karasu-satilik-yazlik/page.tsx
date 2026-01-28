/**
 * Legacy indexed URL: /karasu-satilik-yazlik (rewritten to /tr/karasu-satilik-yazlik by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/karasu-satilik-yazlik/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function KarasuSatilikYazlikTrPage() {
  const Page = (await import('@/app/[locale]/karasu-satilik-yazlik/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
