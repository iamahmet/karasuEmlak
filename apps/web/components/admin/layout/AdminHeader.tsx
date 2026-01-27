"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, User, LogOut } from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { GlobalSearch } from "../search/GlobalSearch";
import { NotificationCenter } from "../notifications/NotificationCenter";
import {
  Input,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { createClient } from "@karasu/lib/supabase/client";
import { useRouter } from "@/i18n/routing";

export function AdminHeader() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    // Use singleton client to prevent NavigatorLockAcquireTimeoutError
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }: any) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    // Use singleton client to prevent NavigatorLockAcquireTimeoutError
    const supabase = createClient();
    
    await supabase.auth.signOut();
    const locale = window.location.pathname.split("/")[1] || "tr";
    router.push(`/${locale}/login`);
  };

  return (
    <header role="banner" className="sticky top-0 z-30 w-full border-b border-white/20 dark:border-[#0a3d35]/50 bg-white/80 dark:bg-[#062F28]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#062F28]/70 shadow-xl shadow-black/5 dark:shadow-black/30">
      <div className="absolute inset-0 bg-gradient-to-r from-design-light/10 via-transparent to-design-light/10 opacity-50"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-[#062F28]/50 pointer-events-none"></div>
      <div className="container flex h-14 items-center gap-3 px-4 md:px-6 relative">
        {/* Search - Enhanced Modern */}
        <div className="flex-1 max-w-sm">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-design-light/10 to-transparent rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-xl"></div>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-design-gray dark:text-gray-400 group-focus-within:text-design-light dark:group-focus-within:text-design-light transition-all duration-300 group-focus-within:scale-110 z-10" />
            <Input
              type="search"
              placeholder={t("header.search")}
              onClick={() => setSearchOpen(true)}
              aria-label="Site genelinde ara"
              aria-describedby="search-hint"
              className="pl-10 pr-16 h-10 text-sm border border-white/30 dark:border-[#0a3d35]/50 focus:border-design-light dark:focus:border-design-light bg-white/60 dark:bg-[#0a3d35]/60 backdrop-blur-md text-design-dark dark:text-white transition-all duration-300 rounded-xl font-ui placeholder:text-design-gray dark:placeholder:text-gray-400 cursor-pointer hover:border-design-light/60 dark:hover:border-design-light/60 hover:shadow-lg hover:bg-white/80 dark:hover:bg-[#0a3d35]/80 input-professional focus-professional relative z-10"
            />
            <span id="search-hint" className="sr-only">Aramak için ⌘K tuşlarına basın</span>
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-mono bg-gradient-to-br from-[#E7E7E7] to-[#E7E7E7]/80 dark:from-[#062F28] dark:to-[#062F28]/80 border border-[#E7E7E7]/50 dark:border-[#062F28]/50 rounded-lg text-design-gray dark:text-gray-400 shadow-sm z-10">
              ⌘K
            </kbd>
          </div>
        </div>
        <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Right side - Compact */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <NotificationCenter />

          {/* User menu - Enhanced Modern */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Kullanıcı menüsü"
                aria-haspopup="true"
                className="h-9 w-9 rounded-xl hover:bg-[#E7E7E7]/50 dark:hover:bg-[#0a3d35]/50 transition-all duration-300 hover:scale-110 hover:shadow-lg micro-bounce relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-design-light/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-design-light dark:via-design-light/90 dark:to-design-light/80 flex items-center justify-center border border-white/50 dark:border-[#062F28]/50 shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <User className="h-3.5 w-3.5 text-white dark:text-design-dark transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border border-[#E7E7E7]/50 dark:border-[#0a3d35]/50 shadow-2xl bg-white/95 dark:bg-[#0a3d35]/95 backdrop-blur-xl p-2 animate-fade-in">
              <DropdownMenuLabel className="pb-3 px-3 pt-2">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-design-dark via-design-dark/90 to-design-dark/80 dark:from-design-light dark:via-design-light/90 dark:to-design-light/80 flex items-center justify-center shadow-lg">
                      <User className="h-4 w-4 text-white dark:text-design-dark" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-ui font-bold leading-none text-design-dark dark:text-white truncate">
                        {user?.email || "User"}
                      </p>
                      <p className="text-[10px] leading-none text-design-gray dark:text-gray-400 mt-1.5 font-ui font-medium">
                        Admin
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-[#E7E7E7] dark:via-[#0a3d35] to-transparent my-2 h-px" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 cursor-pointer font-ui text-sm px-3 py-2.5 hover:shadow-md hover-lift group"
              >
                <LogOut className="mr-2.5 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-semibold">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

