import KrediHesaplayiciPage, { generateMetadata as generateKrediMetadata } from '@/app/[locale]/kredi-hesaplayici/page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateKrediMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default function KrediHesaplayiciTrPage() {
  return KrediHesaplayiciPage({
    params: Promise.resolve({ locale: 'tr' }),
  });
}
