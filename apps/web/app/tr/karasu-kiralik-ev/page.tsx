/**
 * Legacy indexed URL: /karasu-kiralik-ev (rewritten to /tr/karasu-kiralik-ev by middleware).
 * DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/karasu-kiralik-ev/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function KarasuKiralikEvTrPage() {
  const Page = (await import('@/app/[locale]/karasu-kiralik-ev/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
