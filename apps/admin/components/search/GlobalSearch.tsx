"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Search, Home, FileText, Newspaper, Settings, Users, Image, TrendingUp, Command } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { cn } from "@karasu/lib";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
}

interface SearchCategory {
  id: string;
  label: string;
  results: SearchResult[];
}

interface GlobalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalSearch({ open: controlledOpen, onOpenChange }: GlobalSearchProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Search results based on query
  const searchResults: SearchCategory[] = [
    {
      id: "pages",
      label: "Sayfalar",
      results: [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "Ana kontrol paneli",
          href: "/dashboard",
          category: "Sayfalar",
          icon: TrendingUp,
          shortcut: "D",
        },
        {
          id: "listings",
          title: "İlanlar",
          description: "İlan yönetimi",
          href: "/listings",
          category: "Sayfalar",
          icon: Home,
          shortcut: "L",
        },
        {
          id: "articles",
          title: "Blog Yazıları",
          description: "Blog içerik yönetimi",
          href: "/articles",
          category: "Sayfalar",
          icon: FileText,
          shortcut: "A",
        },
        {
          id: "news",
          title: "Haberler",
          description: "Haber yönetimi",
          href: "/news",
          category: "Sayfalar",
          icon: Newspaper,
          shortcut: "N",
        },
        {
          id: "users",
          title: "Kullanıcılar",
          description: "Kullanıcı yönetimi",
          href: "/users",
          category: "Sayfalar",
          icon: Users,
          shortcut: "U",
        },
        {
          id: "media",
          title: "Medya Kütüphanesi",
          description: "Görsel ve dosya yönetimi",
          href: "/media",
          category: "Sayfalar",
          icon: Image,
          shortcut: "M",
        },
        {
          id: "settings",
          title: "Ayarlar",
          description: "Sistem ayarları",
          href: "/settings",
          category: "Sayfalar",
          icon: Settings,
          shortcut: "S",
        },
      ],
    },
    {
      id: "actions",
      label: "Hızlı İşlemler",
      results: [
        {
          id: "new-listing",
          title: "Yeni İlan Ekle",
          description: "Yeni emlak ilanı oluştur",
          href: "/listings/new",
          category: "İşlemler",
          icon: Home,
        },
        {
          id: "new-article",
          title: "Yeni Blog Yazısı",
          description: "Yeni blog yazısı oluştur",
          href: "/articles/new",
          category: "İşlemler",
          icon: FileText,
        },
        {
          id: "new-news",
          title: "Yeni Haber",
          description: "Yeni haber oluştur",
          href: "/news/new",
          category: "İşlemler",
          icon: Newspaper,
        },
      ],
    },
  ];

  // Filter results based on query
  const filteredResults = searchResults.map((category) => ({
    ...category,
    results: category.results.filter(
      (result) =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter((category) => category.results.length > 0);

  const allResults = filteredResults.flatMap((cat) => cat.results);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }

      // Escape to close
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
        setSelectedIndex(0);
      }

      // Arrow keys navigation
      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
        }
        if (e.key === "Enter" && allResults[selectedIndex]) {
          e.preventDefault();
          handleSelect(allResults[selectedIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedIndex, allResults]);

  const handleSelect = useCallback((result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, [router]);

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground"
      >
        <Search className="h-4 w-4" />
        <span className="hidden lg:inline">Ara...</span>
        <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={(newOpen) => {
        if (onOpenChange) {
          onOpenChange(newOpen);
        } else {
          setInternalOpen(newOpen);
        }
      }}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-5 w-5 text-muted-foreground mr-3" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Sayfalar, işlemler veya komutlar ara..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-14 text-base"
              autoFocus
            />
            <kbd className="hidden md:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground">
              ESC
            </kbd>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {allResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-sm font-medium text-foreground mb-1">Sonuç bulunamadı</p>
                <p className="text-xs text-muted-foreground">
                  "{query}" için arama sonucu yok
                </p>
              </div>
            ) : (
              filteredResults.map((category) => (
                <div key={category.id} className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {category.label}
                  </div>
                  <div className="space-y-1">
                    {category.results.map((result, index) => {
                      const globalIndex = allResults.indexOf(result);
                      const isSelected = globalIndex === selectedIndex;
                      const Icon = result.icon;

                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                            isSelected
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg",
                            isSelected ? "bg-primary/20" : "bg-muted"
                          )}>
                            <Icon className={cn(
                              "h-4 w-4",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{result.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {result.description}
                            </div>
                          </div>
                          {result.shortcut && (
                            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                              {result.shortcut}
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="h-5 px-1.5 rounded border bg-muted font-mono">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="h-5 px-1.5 rounded border bg-muted font-mono">↵</kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="text-muted-foreground">
              {allResults.length} sonuç
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
