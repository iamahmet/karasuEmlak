import LocaleLayout from '@/app/[locale]/layout';

export default async function TrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return LocaleLayout({
    children,
    params: Promise.resolve({ locale: 'tr' }),
  });
}
