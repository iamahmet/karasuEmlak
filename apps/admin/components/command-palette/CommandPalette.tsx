"use client";

import * as React from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@karasu/ui";
import {
  LayoutDashboard,
  FileText,
  Search,
  Bot,
  BarChart3,
  Shield,
  Settings,
  Plus,
  Eye,
  Settings2,
  LogOut,
  User,
} from "lucide-react";
import { createClient } from "@karasu/lib/supabase/client";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [recentItems, setRecentItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Load recent items from localStorage
    const stored = localStorage.getItem("admin-recent-items");
    if (stored) {
      setRecentItems(JSON.parse(stored));
    }
  }, []);

  const saveRecentItem = (path: string) => {
    const updated = [path, ...recentItems.filter((p) => p !== path)].slice(0, 5);
    setRecentItems(updated);
    localStorage.setItem("admin-recent-items", JSON.stringify(updated));
  };

  const handleSelect = (path: string) => {
    saveRecentItem(path);
    router.push(path);
    onOpenChange(false);
  };

  const navigationItems = [
    {
      title: "Navigation",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/dashboard",
          keywords: ["dashboard", "home", "ana sayfa"],
        },
        {
          icon: FileText,
          label: "Content Studio",
          path: "/seo/content-studio",
          keywords: ["content", "studio", "articles", "içerik"],
        },
        {
          icon: Search,
          label: "SEO Tools",
          path: "/seo",
          keywords: ["seo", "tools", "araçlar"],
        },
        {
          icon: Bot,
          label: "Project Bot",
          path: "/project-bot",
          keywords: ["bot", "project", "scan"],
        },
        {
          icon: BarChart3,
          label: "Analytics",
          path: "/analytics/dashboard",
          keywords: ["analytics", "stats", "metrics", "analitik"],
        },
        {
          icon: Shield,
          label: "Compliance",
          path: "/compliance/consent",
          keywords: ["compliance", "consent", "uyumluluk"],
        },
        {
          icon: Settings,
          label: "Integrations",
          path: "/integrations/google",
          keywords: ["integrations", "google", "entegrasyonlar"],
        },
      ],
    },
    {
      title: "Quick Actions",
      items: [
        {
          icon: Plus,
          label: "Create Content",
          path: "/seo/content-studio?tab=create",
          keywords: ["create", "new", "yeni", "oluştur"],
        },
        {
          icon: Bot,
          label: "Run Bot Scan",
          path: "/project-bot",
          keywords: ["scan", "bot", "run"],
        },
        {
          icon: Eye,
          label: "View Analytics",
          path: "/analytics/dashboard",
          keywords: ["analytics", "view", "görüntüle"],
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          path: "/profile",
          keywords: ["profile", "user", "kullanıcı"],
        },
        {
          icon: Settings2,
          label: "Settings",
          path: "/settings",
          keywords: ["settings", "ayarlar"],
        },
        {
          icon: LogOut,
          label: "Logout",
          path: "/login",
          keywords: ["logout", "signout", "çıkış"],
          action: async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
          },
        },
      ],
    },
  ];

  if (recentItems.length > 0) {
    navigationItems.unshift({
      title: "Recent",
      items: recentItems
        .map((path) => {
          const item = navigationItems
            .flatMap((group) => group.items)
            .find((i) => i.path === path);
          return item;
        })
        .filter(Boolean) as any[],
    });
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." className="h-12 text-sm font-ui" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {navigationItems.map((group, groupIndex) => (
          <React.Fragment key={group.title}>
            <CommandGroup heading={group.title}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.path}
                    onSelect={() => {
                      if (item.action) {
                        item.action();
                        onOpenChange(false);
                      } else {
                        handleSelect(item.path);
                      }
                    }}
                    keywords={item.keywords}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-design-light/10 dark:hover:bg-design-light/5 rounded-lg transition-colors"
                  >
                    <Icon className="h-4 w-4 text-design-gray dark:text-gray-400" />
                    <span className="font-ui text-sm">{item.label}</span>
                    {item.path && (
                      <span className="ml-auto text-xs text-design-gray dark:text-gray-400 font-mono">
                        {item.path}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {groupIndex < navigationItems.length - 1 && <CommandSeparator />}
          </React.Fragment>
        ))}
      </CommandList>
      <div className="border-t border-border px-3 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-[#E7E7E7] dark:bg-[#062F28] rounded text-xs font-mono">
              Enter
            </kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-4">
            <kbd className="px-2 py-1 bg-[#E7E7E7] dark:bg-[#062F28] rounded text-xs font-mono">
              Esc
            </kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </CommandDialog>
  );
}

