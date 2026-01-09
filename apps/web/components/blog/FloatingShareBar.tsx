'use client';

import { useState, useEffect, useCallback } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Link2, MessageCircle, Check, Mail } from 'lucide-react';
import { cn } from '@karasu/lib';

interface FloatingShareBarProps {
  url: string;
  title: string;
  description?: string;
  articleId: string;
  articleSlug?: string;
}

export function FloatingShareBar({ url, title, description, articleId, articleSlug }: FloatingShareBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const heroHeight = 500;
    const footerOffset = document.body.scrollHeight - window.innerHeight - 600;
    setIsVisible(scrollY > heroHeight && scrollY < footerOffset);
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  const shareLinks = [
    {
      name: 'Twitter',
      label: 'X (Twitter)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      bgColor: 'bg-black',
      hoverBg: 'hover:bg-black',
    },
    {
      name: 'Facebook',
      label: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      bgColor: 'bg-[#1877F2]',
      hoverBg: 'hover:bg-[#1877F2]',
    },
    {
      name: 'LinkedIn',
      label: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      bgColor: 'bg-[#0A66C2]',
      hoverBg: 'hover:bg-[#0A66C2]',
    },
    {
      name: 'WhatsApp',
      label: 'WhatsApp',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      bgColor: 'bg-[#25D366]',
      hoverBg: 'hover:bg-[#25D366]',
    },
    {
      name: 'Email',
      label: 'E-posta',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || title}\n\n${url}`)}`,
      bgColor: 'bg-gray-700',
      hoverBg: 'hover:bg-gray-700',
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share', {
          method: 'copy_link',
          content_type: 'article',
          item_id: articleId,
        });
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareClick = (platform: string, href: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share', {
        method: platform.toLowerCase(),
        content_type: 'article',
        item_id: articleId,
      });
    }

    if (platform === 'Email') {
      window.location.href = href;
    } else {
      window.open(href, '_blank', 'width=600,height=500,scrollbars=yes');
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-4 xl:left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 transition-all duration-500 ease-out',
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'
      )}
      aria-label="Paylaşım butonları"
    >
      {/* Share Label with icon */}
      <div className="flex flex-col items-center gap-1.5 mb-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Share2 className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">
          Paylaş
        </span>
      </div>

      {/* Share Buttons Container */}
      <div className="relative flex flex-col gap-2 p-3 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent rounded-2xl pointer-events-none" />

        {shareLinks.map((link, index) => (
          <div key={link.name} className="relative group">
            <button
              type="button"
              onClick={() => handleShareClick(link.name, link.href)}
              onMouseEnter={() => setHoveredButton(link.name)}
              onMouseLeave={() => setHoveredButton(null)}
              className={cn(
                'relative w-11 h-11 flex items-center justify-center rounded-xl text-gray-600 transition-all duration-300 transform hover:scale-110 active:scale-95',
                'bg-gray-50 hover:text-white',
                link.hoverBg
              )}
              aria-label={`${link.label}'da paylaş`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <link.icon className="h-[18px] w-[18px]" />
            </button>

            {/* Tooltip */}
            <div
              className={cn(
                'absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-200 pointer-events-none',
                hoveredButton === link.name ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              )}
            >
              {link.label}
              {/* Arrow */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className="relative w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto my-1" />

        {/* Copy Link Button */}
        <div className="relative group">
          <button
            type="button"
            onClick={copyToClipboard}
            onMouseEnter={() => setHoveredButton('copy')}
            onMouseLeave={() => setHoveredButton(null)}
            className={cn(
              'relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95',
              copied
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-gray-50 text-gray-600 hover:bg-primary hover:text-white'
            )}
            aria-label="Linki kopyala"
          >
            {copied ? (
              <Check className="h-[18px] w-[18px] animate-bounce" />
            ) : (
              <Link2 className="h-[18px] w-[18px]" />
            )}
          </button>

          {/* Tooltip for copy */}
          <div
            className={cn(
              'absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-white text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-200 pointer-events-none',
              copied ? 'bg-green-500' : 'bg-gray-900',
              hoveredButton === 'copy' || copied ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            )}
          >
            {copied ? 'Kopyalandı!' : 'Linki kopyala'}
            <div className={cn(
              'absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent',
              copied ? 'border-r-green-500' : 'border-r-gray-900'
            )} />
          </div>
        </div>
      </div>
    </aside>
  );
}
