'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, FileText, Phone, Menu, Filter } from 'lucide-react';
import { cn } from '@karasu/lib';
import { siteConfig } from '@karasu-emlak/config';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Ana Sayfa', href: '/', icon: Home, exact: true },
  { label: 'Satılık', href: '/satilik', icon: Search },
  { label: 'Kiralık', href: '/kiralik', icon: Search },
  { label: 'Blog', href: '/blog', icon: FileText },
  { label: 'İletişim', href: '/iletisim', icon: Phone },
];

interface MobileBottomNavProps {
  onFilterClick?: () => void;
  showFilterButton?: boolean;
}

export function MobileBottomNav({ onFilterClick, showFilterButton = false }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide/show on scroll (hide when scrolling down, show when scrolling up)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at top
      if (currentScrollY < 100) {
        setIsVisible(true);
      } else {
        // Hide when scrolling down, show when scrolling up
        setIsVisible(currentScrollY < lastScrollY || currentScrollY < 200);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href || pathname === `/${pathname.split('/')[1]}`;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 md:hidden',
        'bg-white border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]',
        'safe-area-inset-bottom',
        'transition-transform duration-300 ease-out',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1',
                'min-w-[60px] px-2 py-2 rounded-xl',
                'transition-all duration-200',
                'active:scale-95',
                active
                  ? 'text-[#006AFF] bg-[#006AFF]/10'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
              aria-label={item.label}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-all duration-200',
                  active && 'scale-110'
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold leading-tight tracking-tight',
                  active ? 'text-[#006AFF]' : 'text-slate-600'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
        
        {/* Filter Button (only on listings pages) */}
        {showFilterButton && onFilterClick && (
          <button
            onClick={onFilterClick}
            className={cn(
              'flex flex-col items-center justify-center gap-1',
              'min-w-[60px] px-2 py-2 rounded-xl',
              'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
              'transition-all duration-200 active:scale-95'
            )}
            aria-label="Filtreler"
          >
            <Filter className="h-5 w-5" strokeWidth={2} />
            <span className="text-[10px] font-semibold leading-tight tracking-tight text-slate-600">
              Filtre
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
