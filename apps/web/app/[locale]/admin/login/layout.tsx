import { ReactNode } from "react";
import type { Metadata } from "next";

// Force dynamic rendering for login page
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Giriş | Karasu Emlak Yönetim Paneli",
  description: "Karasu Emlak yönetim paneli giriş ekranı.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
