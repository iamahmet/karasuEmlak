import KiralikPage, { generateMetadata as generateKiralikMetadata } from '@/app/[locale]/kiralik/page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateKiralikMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default function KiralikTrPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return KiralikPage({
    params: Promise.resolve({ locale: 'tr' }),
    searchParams: Promise.resolve(searchParams as any),
  });
}
