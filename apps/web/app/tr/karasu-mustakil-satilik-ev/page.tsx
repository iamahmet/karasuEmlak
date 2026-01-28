/**
 * Legacy indexed URL: /karasu-mustakil-satilik-ev. DO NOT REMOVE. See: docs/SEO_LOCK.md
 */
import type { Metadata } from 'next';
import * as LocalePage from '@/app/[locale]/karasu-mustakil-satilik-ev/page';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return LocalePage.generateMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default async function Page() {
  const PageComponent = (await import('@/app/[locale]/karasu-mustakil-satilik-ev/page')).default;
  return <PageComponent params={Promise.resolve({ locale: 'tr' })} />;
}
