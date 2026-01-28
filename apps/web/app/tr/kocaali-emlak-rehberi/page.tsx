/**
 * Legacy indexed URL: /kocaali-emlak-rehberi. DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/kocaali-emlak-rehberi/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function Page() {
  const PageComponent = (await import('@/app/[locale]/kocaali-emlak-rehberi/page')).default;
  return <PageComponent params={Promise.resolve({ locale: 'tr' })} />;
}
