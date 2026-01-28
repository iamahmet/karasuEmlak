/**
 * Legacy indexed URL: /karasu-satilik-daire (rewritten to /tr/karasu-satilik-daire by middleware).
 * This page exists under app/tr/ so that the static "tr" segment resolves;
 * without it, /tr/karasu-satilik-daire would 404. DO NOT REMOVE.
 * See: docs/SEO_LOCK.md, LEGACY_LANDING_PATHS in lib/seo/constants.ts
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/karasu-satilik-daire/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function KarasuSatilikDaireTrPage() {
  const Page = (await import('@/app/[locale]/karasu-satilik-daire/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
