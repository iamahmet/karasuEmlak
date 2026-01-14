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
        <CardTitle className="text-lg md:text-xl font-bold text-design-dark dark:text-white flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
          <span className="w-1 h-6 bg-gradient-to-b from-design-light via-design-light/80 to-design-dark rounded-full shadow-lg"></span>
          Hızlı İşlemler
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 md:px-5 pb-3 md:pb-5 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-3 md:py-4 px-2 md:px-3 flex flex-col items-center gap-1.5 md:gap-2 group transition-all duration-300 hover:shadow-lg rounded-lg md:rounded-xl font-ui hover-lift relative overflow-hidden border",
                    action.color
                  )}
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    borderColor: 'rgba(231, 231, 231, 0.5)'
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to right, hsl(var(--design-light-green) / 0.1), transparent)' }}></div>
                  <div className="relative p-1.5 md:p-2 rounded-lg group-hover:scale-110 transition-all duration-300 shadow-sm" style={{ 
                    background: 'linear-gradient(to bottom right, hsl(var(--design-light-green) / 0.2), hsl(var(--design-light-green) / 0.1))'
                  }}>
                    <Icon className="h-4 w-4 md:h-5 md:w-5 text-design-dark dark:text-design-light group-hover:text-white dark:group-hover:text-design-dark transition-all duration-300 group-hover:rotate-6 relative z-10" />
                  </div>
                  <div className="relative z-10 text-center">
                    <span className="font-semibold text-design-dark dark:text-white group-hover:text-white dark:group-hover:text-design-dark transition-colors text-[10px] md:text-xs leading-tight block">
                      {action.label}
                    </span>
                    {action.description && (
                      <span className="text-[9px] md:text-[10px] mt-0.5 block hidden sm:block" style={{ color: 'hsl(var(--design-medium-gray))' }}>
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

