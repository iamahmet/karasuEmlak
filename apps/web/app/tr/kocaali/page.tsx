import KocaaliPage, { generateMetadata as generateKocaaliMetadata } from '@/app/[locale]/kocaali/page';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return generateKocaaliMetadata({
    params: Promise.resolve({ locale: 'tr' }),
  });
}

export default function KocaaliTrPage() {
  return KocaaliPage({
    params: Promise.resolve({ locale: 'tr' }),
  });
}
