import { PharmaciesManagement } from "@/components/pharmacies/PharmaciesManagement";

export default async function PharmaciesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PharmaciesManagement locale={locale} />;
}
