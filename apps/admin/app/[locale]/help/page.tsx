'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@karasu/ui';
import { Button } from '@karasu/ui';
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  ExternalLink,
  FileText,
  Video,
  Mail,
} from 'lucide-react';
import { useRouter } from '@/i18n/routing';

export default function HelpPage() {
  const router = useRouter();

  const helpSections = [
    {
      title: 'Başlangıç Rehberi',
      description: 'Admin panelini kullanmaya başlamak için temel bilgiler',
      icon: BookOpen,
      href: '/help/getting-started',
    },
    {
      title: 'İçerik Yönetimi',
      description: 'Blog yazıları, haberler ve sayfaları nasıl yönetirsiniz',
      icon: FileText,
      href: '/help/content-management',
    },
    {
      title: 'SEO Araçları',
      description: 'SEO Booster, Content Studio ve diğer SEO araçlarını kullanma',
      icon: ExternalLink,
      href: '/help/seo-tools',
    },
    {
      title: 'Video Eğitimler',
      description: 'Adım adım video eğitimler ve öğreticiler',
      icon: Video,
      href: '/help/videos',
    },
  ];

  return (
    <div className="admin-container responsive-padding">
      {/* Header */}
      <div className="admin-page-header">
        <h1 className="admin-page-title flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-design-light" />
          Yardım & Destek
        </h1>
        <p className="admin-page-description">
          Admin paneli kullanımı, özellikler ve sık sorulan sorular
        </p>
      </div>

      {/* Help Sections */}
      <div className="admin-grid-2 mb-6">
        {helpSections.map((section) => (
          <Card key={section.href} className="card-professional hover-lift cursor-pointer" onClick={() => router.push(section.href)}>
            <CardHeader className="card-professional-header">
              <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-3">
                <section.icon className="h-5 w-5 text-design-light" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-design-gray dark:text-gray-400">
                {section.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Support */}
      <Card className="card-professional">
        <CardHeader className="card-professional-header">
          <CardTitle className="text-base font-display font-bold text-design-dark dark:text-white flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-design-light" />
            Destek İletişim
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-design-light" />
            <div>
              <p className="text-sm font-semibold text-design-dark dark:text-white">E-posta</p>
              <p className="text-sm text-design-gray dark:text-gray-400">destek@karasuemlak.net</p>
            </div>
          </div>
          <div className="pt-4 border-t border-[#E7E7E7] dark:border-[#0a3d35]">
            <p className="text-sm text-design-gray dark:text-gray-400 mb-3">
              Sorularınız için bize ulaşabilirsiniz. Genellikle 24 saat içinde yanıt veriyoruz.
            </p>
            <Button
              onClick={() => window.location.href = 'mailto:destek@karasuemlak.net'}
              className="btn-primary-professional"
            >
              <Mail className="h-4 w-4 mr-2" />
              E-posta Gönder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
