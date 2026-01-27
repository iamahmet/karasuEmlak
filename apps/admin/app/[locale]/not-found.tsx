import Link from 'next/link';
import { Button } from '@karasu/ui';
import { Home, Search, FileText, Settings, LayoutDashboard, Users, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@karasu/ui';

export default function NotFound() {
  const locale = 'tr'; // Default locale for now
  const basePath = locale === 'tr' ? '' : `/${locale}`;

  const adminPages = [
    { href: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard, description: 'Ana kontrol paneli ve istatistikler' },
    { href: `${basePath}/listings`, label: 'İlanlar', icon: Home, description: 'Emlak ilanlarını yönetin' },
    { href: `${basePath}/articles`, label: 'Blog Yazıları', icon: FileText, description: 'Blog içeriklerini düzenleyin' },
    { href: `${basePath}/users`, label: 'Kullanıcılar', icon: Users, description: 'Kullanıcı yönetimi' },
    { href: `${basePath}/media`, label: 'Medya Kütüphanesi', icon: ImageIcon, description: 'Görseller ve dosyalar' },
    { href: `${basePath}/settings`, label: 'Ayarlar', icon: Settings, description: 'Sistem ayarları' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="text-9xl font-bold text-primary/20 mb-4">404</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Sayfa Bulunamadı
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Aradığınız sayfa mevcut değil veya taşınmış olabilir. Aşağıdaki admin panel sayfalarından birini ziyaret edebilirsiniz.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={`${basePath}/dashboard`}>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Home className="mr-2 h-5 w-5" />
                  Dashboard'a Dön
                </Button>
              </Link>
              <Link href={`${basePath}/listings`}>
                <Button size="lg" variant="outline">
                  <Search className="mr-2 h-5 w-5" />
                  İlanları Görüntüle
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Pages Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Admin Panel Sayfaları
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminPages.map((page) => {
                const Icon = page.icon;
                return (
                  <Link key={page.href} href={page.href}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                              {page.label}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {page.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Hızlı Erişim
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href={`${basePath}/seo`} className="text-center p-4 rounded-lg hover:bg-muted transition-colors">
                <div className="text-sm font-medium text-foreground">SEO Araçları</div>
              </Link>
              <Link href={`${basePath}/analytics`} className="text-center p-4 rounded-lg hover:bg-muted transition-colors">
                <div className="text-sm font-medium text-foreground">Analitik</div>
              </Link>
              <Link href={`${basePath}/content-quality`} className="text-center p-4 rounded-lg hover:bg-muted transition-colors">
                <div className="text-sm font-medium text-foreground">İçerik Kalitesi</div>
              </Link>
              <Link href={`${basePath}/settings`} className="text-center p-4 rounded-lg hover:bg-muted transition-colors">
                <div className="text-sm font-medium text-foreground">Ayarlar</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
