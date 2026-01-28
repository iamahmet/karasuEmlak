/**
 * Legacy indexed URL: /kiralik-villa (rewritten to /tr/kiralik-villa by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/kiralik-villa/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function KiralikVillaTrPage() {
  const Page = (await import('@/app/[locale]/kiralik-villa/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
