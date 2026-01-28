/**
 * Legacy indexed URL: /karasu-ucuz-satilik-daire. DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/karasu-ucuz-satilik-daire/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function Page() {
  const PageComponent = (await import('@/app/[locale]/karasu-ucuz-satilik-daire/page')).default;
  return <PageComponent params={Promise.resolve({ locale: 'tr' })} />;
}
