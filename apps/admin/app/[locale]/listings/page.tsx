"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Plus, TrendingUp, Eye, EyeOff, Star, Home } from "lucide-react";
import { Button } from "@karasu/ui";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@karasu/ui";

const ListingsManagement = dynamic(
  () => import("@/components/listings/ListingsManagement").then((mod) => mod.ListingsManagement),
  { ssr: false }
);

export default function ListingsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || "tr";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="admin-container responsive-padding py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  İlan Yönetimi
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Emlak ilanlarını görüntüleyin, düzenleyin ve yönetin
                </p>
              </div>
            </div>
            
            <Link href="/listings/new">
              <Button size="lg" className="gap-2 shadow-lg">
                <Plus className="h-5 w-5" />
                Yeni İlan Ekle
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-container responsive-padding py-8">
        <ListingsManagement locale={locale} />
      </div>
    </div>
  );
}
