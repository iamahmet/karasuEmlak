import { redirect } from "next/navigation";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Simple redirect - no data fetching to avoid errors
  let locale = 'tr';
  try {
    const paramsResult = await params;
    locale = paramsResult.locale || 'tr';
  } catch (error: any) {
    console.error('Error getting locale in AdminPage:', error);
    locale = 'tr';
  }
  
  // Redirect to admin dashboard
  redirect(`/${locale}/admin/dashboard`);
}
