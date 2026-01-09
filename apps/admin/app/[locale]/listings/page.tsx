"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const ListingsManagement = dynamic(
  () => import("@/components/listings/ListingsManagement").then((mod) => mod.ListingsManagement),
  { ssr: false }
);

export default function ListingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  return (
    <div className="admin-container responsive-padding space-section animate-fade-in">
      <div className="admin-page-header">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full opacity-50"></div>
          <h1 className="admin-page-title">
            İlan Yönetimi
          </h1>
          <p className="admin-page-description">
            Emlak ilanlarını görüntüleyin, düzenleyin ve yönetin
          </p>
        </div>
      </div>

      <ListingsManagement locale={locale} />
    </div>
  );
}
