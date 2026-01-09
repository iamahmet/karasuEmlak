'use client';

import { useState, useEffect } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Facebook, 
  Twitter, 
  MessageCircle, 
  Linkedin,
  Mail,
  QrCode,
  Link as LinkIcon,
  Send,
  X,
} from 'lucide-react';
import { Button } from '@karasu/ui';
import { cn } from '@karasu/lib';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Lazy load QR code component
const QRCode = dynamic(() => import('react-qr-code'), { ssr: false });

interface EnhancedShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
  listingId?: string;
  listingSlug?: string;
  onShare?: (platform: string) => void;
}

const SHARE_PLATFORMS = {
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-[#1877F2] hover:bg-[#166FE5]',
    getUrl: (url: string, title: string) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
  },
  twitter: {
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'bg-black hover:bg-gray-900 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black',
    getUrl: (url: string, title: string) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-[#25D366] hover:bg-[#20BA5A]',
    getUrl: (url: string, title: string) => 
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-[#0077B5] hover:bg-[#006399]',
    getUrl: (url: string, title: string) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  email: {
    name: 'E-posta',
    icon: Mail,
    color: 'bg-slate-600 hover:bg-slate-700',
    getUrl: (url: string, title: string, desc?: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}${desc ? `\n\n${desc}` : ''}`)}`,
  },
  telegram: {
    name: 'Telegram',
    icon: Send,
    color: 'bg-[#0088CC] hover:bg-[#0077B3]',
    getUrl: (url: string, title: string) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
};

export function EnhancedShareButtons({
  url,
  title,
  description = '',
  image,
  className,
  variant = 'default',
  listingId,
  listingSlug,
  onShare,
}: EnhancedShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const shareData = {
    title,
    text: description,
    url,
    ...(image && { files: [] }), // Files not supported in Web Share API v1
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        onShare?.('native');
        toast.success('Paylaşıldı!');
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err);
          toast.error('Paylaşım başarısız oldu');
        }
      }
    }
  };

  const handleCopy = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        onShare?.('copy');
        toast.success('Link kopyalandı!', {
          description: 'Link panoya kopyalandı',
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy to clipboard failed:', err);
        toast.error('Kopyalama başarısız oldu');
      }
    }
  };

  const handlePlatformShare = (platform: keyof typeof SHARE_PLATFORMS) => {
    const platformData = SHARE_PLATFORMS[platform];
    const shareUrl = platformData.getUrl(url, title);
    
    // Open in new window
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    onShare?.(platform);
    toast.success(`${platformData.name}'ta paylaşılıyor...`);
  };

  const handleEmailShare = () => {
    const emailUrl = SHARE_PLATFORMS.email.getUrl(url, title, description);
    window.location.href = emailUrl;
    onShare?.('email');
  };

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Native Share */}
        {typeof window !== 'undefined' && 'share' in navigator && (
          <Button
            onClick={handleNativeShare}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Paylaş
          </Button>
        )}
        
        {/* Copy Link */}
        <Button
          onClick={handleCopy}
          size="sm"
          variant={copied ? "default" : "outline"}
          className={cn("gap-2", copied && "bg-green-600 hover:bg-green-700 text-white")}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Kopyalandı
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Kopyala
            </>
          )}
        </Button>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={cn("fixed bottom-20 right-4 z-50", className)}>
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Paylaş</h3>
            <button
              onClick={() => setShowMore(false)}
              className="p-1 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(SHARE_PLATFORMS).slice(0, 6).map(([key, platform]) => {
              const Icon = platform.icon;
              return (
                <button
                  key={key}
                  onClick={() => {
                    if (key === 'email') {
                      handleEmailShare();
                    } else {
                      handlePlatformShare(key as keyof typeof SHARE_PLATFORMS);
                    }
                  }}
                  className={cn(
                    "p-3 rounded-xl text-white flex flex-col items-center gap-2 transition-all hover:scale-105",
                    platform.color
                  )}
                  aria-label={`${platform.name}'ta paylaş`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Share Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Native Share */}
        {typeof window !== 'undefined' && 'share' in navigator && (
          <Button
            onClick={handleNativeShare}
            size="icon"
            variant="outline"
            className="w-12 h-12 rounded-xl hover:bg-blue-50 hover:border-blue-300"
            aria-label="Paylaş"
            title="Paylaş"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        )}
        
        {/* Facebook */}
        <button
          onClick={() => handlePlatformShare('facebook')}
          className="w-12 h-12 rounded-xl bg-[#1877F2] hover:bg-[#166FE5] text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
          aria-label="Facebook'ta paylaş"
          title="Facebook"
        >
          <Facebook className="w-5 h-5" />
        </button>
        
        {/* Twitter/X */}
        <button
          onClick={() => handlePlatformShare('twitter')}
          className="w-12 h-12 rounded-xl bg-black hover:bg-gray-900 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-black flex items-center justify-center transition-all hover:scale-105 shadow-sm"
          aria-label="X (Twitter)'da paylaş"
          title="X (Twitter)"
        >
          <Twitter className="w-5 h-5" />
        </button>
        
        {/* WhatsApp */}
        <button
          onClick={() => handlePlatformShare('whatsapp')}
          className="w-12 h-12 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
          aria-label="WhatsApp'ta paylaş"
          title="WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
        
        {/* LinkedIn */}
        <button
          onClick={() => handlePlatformShare('linkedin')}
          className="w-12 h-12 rounded-xl bg-[#0077B5] hover:bg-[#006399] text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
          aria-label="LinkedIn'de paylaş"
          title="LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </button>
        
        {/* Email */}
        <button
          onClick={handleEmailShare}
          className="w-12 h-12 rounded-xl bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
          aria-label="E-posta ile paylaş"
          title="E-posta"
        >
          <Mail className="w-5 h-5" />
        </button>
        
        {/* Copy Link */}
        <Button
          onClick={handleCopy}
          size="icon"
          variant={copied ? "default" : "outline"}
          className={cn(
            "w-12 h-12 rounded-xl transition-all hover:scale-105",
            copied && "bg-green-600 hover:bg-green-700 text-white"
          )}
          aria-label="Linki kopyala"
          title={copied ? 'Kopyalandı!' : 'Linki kopyala'}
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </Button>
        
        {/* QR Code */}
        <Button
          onClick={() => setShowQR(!showQR)}
          size="icon"
          variant="outline"
          className="w-12 h-12 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-all hover:scale-105"
          aria-label="QR kod göster"
          title="QR Kod"
        >
          <QrCode className="w-5 h-5" />
        </Button>
      </div>

      {/* More Platforms Toggle */}
      <Button
        onClick={() => setShowMore(!showMore)}
        variant="ghost"
        size="sm"
        className="text-xs text-slate-600 hover:text-slate-900"
      >
        {showMore ? 'Daha Az Göster' : 'Daha Fazla Platform'}
      </Button>

      {/* More Platforms */}
      {showMore && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
          {/* Telegram */}
          <button
            onClick={() => handlePlatformShare('telegram')}
            className="w-12 h-12 rounded-xl bg-[#0088CC] hover:bg-[#0077B3] text-white flex items-center justify-center transition-all hover:scale-105 shadow-sm"
            aria-label="Telegram'da paylaş"
            title="Telegram"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">QR Kod</h3>
              <button
                onClick={() => setShowQR(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Kapat"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-lg border-2 border-slate-200">
                {typeof window !== 'undefined' && (
                  <QRCode
                    value={url}
                    size={200}
                    level="H"
                  />
                )}
              </div>
              <p className="text-sm text-slate-600 text-center">
                QR kodu tarayarak bu sayfaya mobil cihazınızdan erişebilirsiniz
              </p>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LinkIcon className="h-4 w-4" />
                Linki Kopyala
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Share Stats (if listing) */}
      {listingId && (
        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
          Bu ilanı paylaşarak daha fazla kişiye ulaşmasına yardımcı olun
        </div>
      )}
    </div>
  );
}
