/**
 * Legacy indexed URL: /kocaali-satilik-ev (rewritten to /tr/kocaali-satilik-ev by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/kocaali-satilik-ev/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function KocaaliSatilikEvTrPage() {
  const Page = (await import('@/app/[locale]/kocaali-satilik-ev/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
