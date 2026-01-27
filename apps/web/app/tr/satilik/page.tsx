import SatilikPage, { generateMetadata as generateSatilikMetadata } from '@/app/[locale]/satilik/page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateSatilikMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default function SatilikTrPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return SatilikPage({
    params: Promise.resolve({ locale: 'tr' }),
    searchParams: Promise.resolve(searchParams as any),
  });
}
