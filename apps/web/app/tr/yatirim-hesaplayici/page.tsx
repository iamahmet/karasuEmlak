import YatirimHesaplayiciPage, { generateMetadata as generateYatirimMetadata } from '@/app/[locale]/yatirim-hesaplayici/page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateYatirimMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default function YatirimHesaplayiciTrPage() {
  return YatirimHesaplayiciPage({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

