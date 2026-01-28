/**
 * Legacy indexed URL: /kiralik-daire (rewritten to /tr/kiralik-daire by middleware).
 * This page exists under app/tr/ so that the static "tr" segment resolves;
 * without it, /tr/kiralik-daire would 404. DO NOT REMOVE.
 * See: docs/SEO_LOCK.md, LEGACY_LANDING_PATHS in lib/seo/constants.ts
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/kiralik-daire/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function KiralikDaireTrPage() {
  const Page = (await import('@/app/[locale]/kiralik-daire/page')).default;
  return <Page params={Promise.resolve({ locale: 'tr' })} />;
}
