import Link from 'next/link';
import { Button } from '@karasu/ui';
import { Home, Search, FileText, MapPin, TrendingUp, BookOpen, Calculator, HelpCircle } from 'lucide-react';
import { routing } from '@/i18n/routing';
import { Card, CardContent } from '@karasu/ui';

export default function NotFound() {
  const locale = 'tr'; // Default locale for now
  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;

  const popularPages = [
    { href: `${basePath}/satilik`, label: 'Satılık İlanlar', icon: Home, description: 'Karasu ve Kocaali\'de satılık emlak ilanları' },
    { href: `${basePath}/kiralik`, label: 'Kiralık İlanlar', icon: Home, description: 'Kiralık emlak seçenekleri' },
    { href: `${basePath}/karasu-satilik-ev`, label: 'Karasu Satılık Ev', icon: MapPin, description: 'Karasu\'da satılık ev ilanları' },
    { href: `${basePath}/kocaali-satilik-ev`, label: 'Kocaali Satılık Ev', icon: MapPin, description: 'Kocaali\'de satılık ev ilanları' },
    { href: `${basePath}/blog`, label: 'Blog', icon: FileText, description: 'Emlak rehberleri ve haberler' },
    { href: `${basePath}/rehber`, label: 'Rehberler', icon: BookOpen, description: 'Emlak alım-satım rehberleri' },
    { href: `${basePath}/kredi-hesaplayici`, label: 'Kredi Hesaplayıcı', icon: Calculator, description: 'Konut kredisi hesaplama' },
    { href: `${basePath}/yatirim-hesaplayici`, label: 'Yatırım Hesaplayıcı', icon: TrendingUp, description: 'Yatırım analizi ve ROI hesaplama' },
    { href: `${basePath}/sss`, label: 'Sık Sorulan Sorular', icon: HelpCircle, description: 'Emlak ile ilgili SSS' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <div className="text-9xl font-bold text-primary/20 mb-4">404</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sayfa Bulunamadı
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Aradığınız sayfa mevcut değil veya taşınmış olabilir. Aşağıdaki popüler sayfalardan birini ziyaret edebilirsiniz.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={basePath || "/"}>
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Home className="mr-2 h-5 w-5" />
                  Ana Sayfaya Dön
                </Button>
              </Link>
              <Link href={`${basePath}/satilik`}>
                <Button size="lg" variant="outline">
                  <Search className="mr-2 h-5 w-5" />
                  İlan Ara
                </Button>
              </Link>
            </div>
          </div>

          {/* Popular Pages Grid */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Popüler Sayfalar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularPages.map((page) => {
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
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                              {page.label}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
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
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Hızlı Erişim
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href={`${basePath}/karasu`} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">Karasu</div>
              </Link>
              <Link href={`${basePath}/kocaali`} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">Kocaali</div>
              </Link>
              <Link href={`${basePath}/haberler`} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">Haberler</div>
              </Link>
              <Link href={`${basePath}/iletisim`} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900">İletişim</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

