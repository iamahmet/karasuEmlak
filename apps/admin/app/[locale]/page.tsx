import { redirect } from "next/navigation";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  try {
    const { locale } = await params;
    redirect(locale === "tr" ? "/dashboard" : `/${locale}/dashboard`);
  } catch (error: any) {
    console.error("Error in AdminPage:", error);
    redirect("/dashboard");
  }
}
