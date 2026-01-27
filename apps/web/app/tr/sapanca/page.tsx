import SapancaPage, { generateMetadata as generateSapancaMetadata } from '@/app/[locale]/sapanca/page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateSapancaMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default function SapancaTrPage() {
  return SapancaPage({
    params: Promise.resolve({ locale: 'tr' }),
  });
}
