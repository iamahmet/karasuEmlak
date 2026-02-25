'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Building2, Phone, MessageCircle } from 'lucide-react';
import { cn } from '@karasu/lib';
import { hapticButtonPress } from '@/lib/mobile/haptics';

interface NavLinkItem {
  label: string;
  href: string;
  icon: typeof Home;
  exact?: boolean;
  action?: never;
  color?: never;
}

interface NavActionItem {
  label: string;
  href?: never;
  icon: typeof Home;
  exact?: never;
  action: 'whatsapp' | 'call';
  color: string;
}

type NavItem = NavLinkItem | NavActionItem;

const navItems: NavItem[] = [
  { label: 'Ana Sayfa', href: '/', icon: Home, exact: true },
  { label: 'Satılık', href: '/satilik', icon: Building2 },
  { label: 'Kiralık', href: '/kiralik', icon: Search },
  { label: 'Ara', action: 'call', icon: Phone, color: 'blue' },
  { label: 'WhatsApp', action: 'whatsapp', icon: MessageCircle, color: 'green' },
];

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isActionItem = (item: NavItem): item is NavActionItem => 'action' in item;

  // Check if we're on a listing detail page (has StickyMobileCTAs)
  const isListingPage = pathname.includes('/ilan/') && !pathname.endsWith('/ilan');

  // Don't show on listing detail pages (StickyMobileCTAs handles CTAs there)
  if (isListingPage) return null;

  const isActive = (item: NavLinkItem) => {
    if (item.exact) {
      // Check if pathname is exactly "/" or starts with locale prefix only
      const cleanPath = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';
      return cleanPath === item.href;
    }
    return pathname.includes(item.href);
  };

  const handleAction = (action: NavActionItem['action']) => {
    hapticButtonPress();
    if (action === 'call') {
      window.location.href = 'tel:+905325933854';
    } else if (action === 'whatsapp') {
      window.open('https://wa.me/905325933854', '_blank');
    }
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 md:hidden print:hidden',
        'bg-white/95 backdrop-blur-lg border-t border-slate-200/60',
        'shadow-[0_-2px_20px_rgba(0,0,0,0.08)]',
        className
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      <div className="flex items-stretch h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isAction = isActionItem(item);
          const active = !isAction && isActive(item);

          // Action buttons (Call & WhatsApp)
          if (isAction) {
            return (
              <button
                key={item.label}
                onClick={() => handleAction(item.action)}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5',
                  'transition-all duration-150 active:scale-95 active:opacity-80',
                  'min-h-[44px] min-w-[44px] touch-manipulation',
                  item.color === 'green'
                    ? 'bg-[#25D366] text-white'
                    : 'bg-[#006AFF] text-white'
                )}
                aria-label={item.label}
                style={{ touchAction: 'manipulation' }}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          }

          // Navigation links
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5',
                'transition-all duration-150 active:scale-95',
                'min-h-[44px] min-w-[44px] touch-manipulation',
                active
                  ? 'text-[#006AFF]'
                  : 'text-slate-500'
              )}
              aria-label={item.label}
              style={{ touchAction: 'manipulation' }}
            >
              <div className={cn(
                'relative p-1 rounded-lg transition-colors',
                active && 'bg-[#006AFF]/10'
              )}>
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.5 : 1.5}
                />
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#006AFF] rounded-full" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                active ? 'text-[#006AFF] font-semibold' : 'text-slate-500'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
