"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import {
  Plus,
  Search,
  Bot,
  TrendingUp,
  Settings,
  Users,
  MessageSquare,
  ImageIcon,
  Bell,
  FileDown,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@karasu/lib";

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  description?: string;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      label: "Yeni İçerik Oluştur",
      icon: Plus,
      href: "/seo/content-studio?tab=create",
      color: "bg-blue-500 hover:bg-blue-600",
      description: "AI destekli içerik oluştur",
    },
    {
      label: "SEO Analizi",
      icon: Search,
      href: "/seo",
      color: "bg-green-500 hover:bg-green-600",
      description: "SEO performansını kontrol et",
    },
    {
      label: "Project Bot Çalıştır",
      icon: Bot,
      href: "/project-bot",
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Kod kalitesi kontrolü",
    },
    {
      label: "Analytics",
      icon: TrendingUp,
      href: "/analytics/dashboard",
      color: "bg-orange-500 hover:bg-orange-600",
      description: "Site analitikleri",
    },
    {
      label: "Kullanıcı Yönetimi",
      icon: Users,
      href: "/users",
      color: "bg-indigo-500 hover:bg-indigo-600",
      description: "Kullanıcıları yönet",
    },
    {
      label: "Yorumlar",
      icon: MessageSquare,
      href: "/comments",
      color: "bg-pink-500 hover:bg-pink-600",
      description: "Yorumları moderasyon et",
    },
    {
      label: "Medya Kütüphanesi",
      icon: ImageIcon,
      href: "/media",
      color: "bg-cyan-500 hover:bg-cyan-600",
      description: "Görselleri yönet",
    },
    {
      label: "Bildirimler",
      icon: Bell,
      href: "/notifications",
      color: "bg-yellow-500 hover:bg-yellow-600",
      description: "Bildirimleri görüntüle",
    },
    {
      label: "Raporlar",
      icon: FileDown,
      href: "/reports",
      color: "bg-teal-500 hover:bg-teal-600",
      description: "Raporları oluştur",
    },
    {
      label: "Ayarlar",
      icon: Settings,
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600",
      description: "Site ayarlarını düzenle",
    },
  ];

  return (
    <Card className="card-professional bg-white dark:bg-[#0a3d35] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-design-light/5 to-transparent rounded-full blur-3xl"></div>
      <CardHeader className="pb-4 px-5 pt-5 relative z-10">
        <CardTitle className="text-lg md:text-xl font-display font-bold text-design-dark dark:text-white flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full shadow-lg"></span>
          Hızlı İşlemler
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-4 px-3 flex flex-col items-center gap-2 group hover:bg-gradient-to-r hover:from-design-dark hover:to-design-dark/90 hover:text-white dark:hover:from-design-light dark:hover:to-design-light/90 dark:hover:text-design-dark transition-all duration-300 hover:shadow-lg border border-[#E7E7E7]/50 dark:border-[#062F28]/50 rounded-xl font-ui hover-lift relative overflow-hidden",
                    action.color
                  )}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-design-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative p-2 rounded-lg bg-gradient-to-br from-design-light/20 to-design-light/10 group-hover:from-white/20 group-hover:to-white/10 group-hover:scale-110 transition-all duration-300 micro-bounce shadow-sm">
                    <Icon className="h-5 w-5 text-design-dark dark:text-design-light group-hover:text-white dark:group-hover:text-design-dark transition-all duration-300 group-hover:rotate-6 relative z-10" />
                  </div>
                  <div className="relative z-10 text-center">
                    <span className="font-semibold text-design-dark dark:text-white group-hover:text-white dark:group-hover:text-design-dark transition-colors text-xs leading-tight block">
                      {action.label}
                    </span>
                    {action.description && (
                      <span className="text-[10px] text-design-gray dark:text-gray-400 group-hover:text-white/80 dark:group-hover:text-design-dark/80 mt-0.5 block">
                        {action.description}
                      </span>
                    )}
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

