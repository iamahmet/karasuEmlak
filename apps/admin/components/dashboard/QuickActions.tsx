"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@karasu/ui";
import { Button } from "@karasu/ui";
import {
  Plus,
  Search,
  ImageIcon,
  Settings,
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
      label: "Yeni İlan Ekle",
      icon: Plus,
      href: "/listings/new",
      color: "from-green-500 to-green-600",
      description: "Yeni emlak ilanı oluştur",
    },
    {
      label: "İlanları Görüntüle",
      icon: Search,
      href: "/listings",
      color: "from-blue-500 to-blue-600",
      description: "Tüm ilanları listele",
    },
    {
      label: "Medya Kütüphanesi",
      icon: ImageIcon,
      href: "/media",
      color: "from-purple-500 to-purple-600",
      description: "Görselleri yönet",
    },
    {
      label: "İlan Ayarları",
      icon: Settings,
      href: "/settings",
      color: "from-gray-500 to-gray-600",
      description: "İlan ayarlarını düzenle",
    },
  ];

  return (
    <Card className="card-professional bg-gradient-to-br from-card to-card/80 relative overflow-hidden border-2 shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 via-blue-500/5 to-transparent rounded-full blur-3xl"></div>
      <CardHeader className="pb-4 px-6 pt-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-green-500 via-green-400 to-blue-500 rounded-full shadow-lg"></div>
          <CardTitle className="text-xl font-bold text-foreground font-['Urbanist']">
            Hızlı İşlemler
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-2 ml-4">
          İlan yönetimi için hızlı erişim
        </p>
      </CardHeader>
      <CardContent className="px-6 pb-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={action.label} href={action.href}>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-5 px-4 flex flex-col items-center gap-3 group transition-all duration-300 hover:shadow-xl rounded-xl font-ui relative overflow-hidden border-2 bg-gradient-to-br from-card to-card/50",
                    "hover:scale-105 hover:-translate-y-1"
                  )}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    borderColor: 'hsl(var(--border))'
                  }}
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  {/* Icon Container */}
                  <div className="relative p-3 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-md bg-gradient-to-br from-muted/50 to-muted/30 group-hover:bg-white/20 border border-border/50">
                    <Icon className="h-5 w-5 text-foreground group-hover:text-white transition-colors duration-300 relative z-10" />
                  </div>
                  
                  {/* Text Content */}
                  <div className="relative z-10 text-center">
                    <span className="font-bold text-sm text-foreground group-hover:text-white transition-colors duration-300 block mb-1">
                      {action.label}
                    </span>
                    {action.description && (
                      <span className="text-[11px] text-muted-foreground group-hover:text-white/80 transition-colors duration-300 block">
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

