'use client';

import { AlertCircle, Phone, Clock, FileText, Shield, Heart } from 'lucide-react';
import { Card, CardContent } from '@karasu/ui';

interface HealthInfoSectionProps {
  city?: 'karasu' | 'kocaali';
  className?: string;
}

export function HealthInfoSection({ city = 'karasu', className = '' }: HealthInfoSectionProps) {
  const cityName = city === 'karasu' ? 'Karasu' : 'Kocaali';

  const healthServices = [
    {
      icon: Heart,
      title: 'Acil Servis Hizmetleri',
      description: `${cityName} Devlet Hastanesi 24 saat acil servis hizmeti vermektedir. Acil durumlarda 112 numarasını arayabilirsiniz.`,
      color: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      icon: FileText,
      title: 'Aile Hekimi Hizmetleri',
      description: 'Aile sağlığı merkezlerinde aile hekimi hizmetleri, aşı, muayene ve genel sağlık hizmetleri sunulmaktadır.',
      color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Shield,
      title: 'Özel Sağlık Hizmetleri',
      description: 'Özel sağlık merkezlerinde check-up, özel muayene ve ileri tetkik hizmetleri bulunmaktadır.',
      color: 'from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: Clock,
      title: 'Çalışma Saatleri',
      description: 'Devlet hastaneleri 24 saat hizmet verirken, sağlık merkezleri genellikle hafta içi 08:00-17:00 saatleri arasında hizmet vermektedir.',
      color: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ];

  const importantInfo = [
    {
      title: 'Acil Durum Numaraları',
      items: [
        { label: 'Acil Sağlık', value: '112', link: 'tel:112' },
        { label: 'Acil Ambulans', value: '112', link: 'tel:112' },
        { label: 'İtfaiye', value: '110', link: 'tel:110' },
        { label: 'Polis', value: '155', link: 'tel:155' },
      ],
    },
    {
      title: 'Önemli Bilgiler',
      items: [
        { label: 'Hastane Randevu', value: 'Alo 182', link: 'tel:182' },
        { label: 'Eczane Bilgi', value: '444 0 332', link: 'tel:4440332' },
        { label: 'Sağlık Danışma', value: '184', link: 'tel:184' },
      ],
    },
  ];

  return (
    <section className={className}>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-gray-900 dark:text-white">
          Sağlık Hizmetleri Hakkında
        </h2>
        <p className="text-muted-foreground">
          {cityName} bölgesinde sunulan sağlık hizmetleri ve önemli bilgiler
        </p>
      </div>

      {/* Health Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {healthServices.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow border-2 hover:border-primary/50">
              <CardContent className="pt-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                  <Icon className={`w-8 h-8 ${service.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Important Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {importantInfo.map((info, index) => (
          <Card key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                {info.title}
              </h3>
              <div className="space-y-3">
                {info.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    {item.link ? (
                      <a
                        href={item.link}
                        className="flex items-center gap-2 text-primary hover:text-primary-dark font-semibold transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {item.value}
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
