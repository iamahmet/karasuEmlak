/**
 * Legacy indexed URL: /karasu (rewritten to /tr/karasu by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/karasu/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function KarasuTrPage() {
  const Page = (await import('@/app/[locale]/karasu/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
