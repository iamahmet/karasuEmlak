"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@karasu/ui";
import { 
  Menu, 
  X, 
  Search, 
  Phone, 
  Home, 
  Building2, 
  Key,
  MapPin,
  BookOpen,
  Newspaper,
  FileText,
  Heart,
  Calculator,
  TrendingUp,
  Plus,
  ChevronDown
} from "lucide-react";
import { siteConfig } from "@karasu-emlak/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@karasu/ui";
import { Logo } from "@/components/branding/Logo";

export function Header() {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ana navigasyon menüsü - kategorize edilmiş
  const mainNavItems = [
    { href: "/satilik", label: t("forSale"), icon: Home },
    { href: "/kiralik", label: t("forRent"), icon: Key },
    { href: "/ilan-ekle", label: "İlan Ekle", icon: Plus },
  ];

  // Bölgeler menüsü
  const locationItems = [
    { href: "/karasu", label: t("karasu") },
    { href: "/kocaali", label: t("kocaali") },
    { href: "/sapanca", label: "Sapanca" },
    { href: "/karasu/gezilecek-yerler", label: "Gezilecek Yerler" },
    { href: "/karasu/hastaneler", label: "Hastaneler" },
    { href: "/karasu/nobetci-eczaneler", label: "Nöbetçi Eczaneler" },
    { href: "/karasu/restoranlar", label: "Restoranlar" },
    { href: "/karasu/ulasim", label: "Ulaşım" },
    { href: "/karasu/onemli-telefonlar", label: "Önemli Telefonlar" },
  ];

  // İçerik menüsü
  const contentItems = [
    { href: "/blog", label: t("blog"), icon: FileText },
    { href: "/haberler", label: t("news"), icon: Newspaper },
    { href: "/rehber", label: t("guide"), icon: BookOpen },
  ];

  // Araçlar menüsü
  const toolItems = [
    { href: "/kredi-hesaplayici", label: "Kredi Hesaplayıcı", icon: Calculator },
    { href: "/yatirim-hesaplayici", label: "Yatırım Hesaplayıcı", icon: TrendingUp },
    { href: "/karsilastir", label: "İlan Karşılaştır", icon: Building2 },
    { href: "/favorilerim", label: t("favorites"), icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4 lg:gap-6">
          {/* Logo - Professional Component with proper spacing */}
          <div className="flex-shrink-0">
            <Logo variant="full" size="md" />
          </div>

          {/* Desktop Navigation - Apple Quality */}
          <nav className="hidden lg:flex items-center space-x-0.5">
            {/* Ana Menü */}
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5"
              >
                {item.icon && <item.icon className="h-4 w-4 stroke-[1.5]" />}
                {item.label}
              </Link>
            ))}

            {/* Bölgeler Dropdown - Apple Quality */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                <MapPin className="h-4 w-4 stroke-[1.5]" />
                Bölgeler
                <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                {locationItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="text-[15px] font-normal tracking-[-0.011em] py-2">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* İçerik Dropdown - Apple Quality */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                İçerik
                <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                {contentItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                      {item.icon && <item.icon className="h-4 w-4 stroke-[1.5]" />}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Araçlar Dropdown - Apple Quality */}
            <DropdownMenu>
              <DropdownMenuTrigger className="px-3.5 py-2 text-[15px] font-medium text-gray-700 tracking-[-0.011em] transition-all duration-200 hover:text-[#006AFF] hover:bg-blue-50/50 rounded-lg flex items-center gap-1.5">
                Araçlar
                <ChevronDown className="h-3.5 w-3.5 stroke-[1.5] ml-0.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-lg border border-gray-200 shadow-lg">
                {toolItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="flex items-center gap-2 text-[15px] font-normal tracking-[-0.011em] py-2">
                      {item.icon && <item.icon className="h-4 w-4 stroke-[1.5]" />}
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Side Actions - Apple Quality */}
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 rounded-lg transition-all duration-200" asChild>
              <Link href="/arama" aria-label="Ara">
                <Search className="h-5 w-5 stroke-[1.5]" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9 rounded-lg transition-all duration-200" asChild>
              <Link href="/iletisim" aria-label="İletişim">
                <Phone className="h-5 w-5 stroke-[1.5]" />
              </Link>
            </Button>
            <Button variant="default" size="default" className="hidden md:flex bg-[#006AFF] hover:bg-[#0052CC] text-white px-4 py-2 text-[15px] font-semibold tracking-[-0.011em] rounded-lg transition-all duration-200 shadow-sm hover:shadow-md" asChild>
              <Link href="/iletisim">{t("contact")}</Link>
            </Button>

            {/* Mobile Menu Button - Apple Quality */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 rounded-lg transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 stroke-[1.5]" /> : <Menu className="h-5 w-5 stroke-[1.5]" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <nav className="flex flex-col space-y-1">
              {/* Ana Menü */}
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary-subtle hover:text-primary rounded-md flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ))}

              {/* Bölgeler */}
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Bölgeler
              </div>
              {locationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-8 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-primary rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* İçerik */}
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                İçerik
              </div>
              {contentItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-8 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-primary rounded-md flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ))}

              {/* Araçlar */}
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Araçlar
              </div>
              {toolItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-8 py-2 text-sm text-muted-foreground transition-colors hover:bg-primary-subtle hover:text-primary rounded-md flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </Link>
              ))}

              <div className="pt-4 mt-4 border-t">
                <Button className="w-full" asChild>
                  <Link href="/iletisim" onClick={() => setMobileMenuOpen(false)}>
                    {t("contact")}
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
