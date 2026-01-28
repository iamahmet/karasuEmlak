/**
 * Legacy indexed URL: /kocaali-yatirimlik-gayrimenkul. DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/kocaali-yatirimlik-gayrimenkul/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function Page() {
  const PageComponent = (await import('@/app/[locale]/kocaali-yatirimlik-gayrimenkul/page')).default;
  return <PageComponent params={Promise.resolve({ locale: 'tr' })} />;
}
