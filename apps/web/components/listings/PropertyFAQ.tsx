"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@karasu/lib";

interface PropertyFAQProps {
  propertyType: string;
  status: 'satilik' | 'kiralik';
  neighborhood: string;
  price?: number;
  sizeM2?: number;
  className?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

export function PropertyFAQ({ propertyType, status, neighborhood, price, sizeM2, className }: PropertyFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const getFAQs = (): FAQItem[] => {
    const propertyTypeLabel = propertyType === 'daire' ? 'daire' 
      : propertyType === 'villa' ? 'villa'
      : propertyType === 'yazlik' ? 'yazlık'
      : propertyType === 'arsa' ? 'arsa'
      : 'gayrimenkul';

    const statusLabel = status === 'satilik' ? 'satılık' : 'kiralık';

    const faqs: FAQItem[] = [
      {
        question: `Bu ${propertyTypeLabel} hangi tarihte müsait?`,
        answer: `${propertyTypeLabel.charAt(0).toUpperCase() + propertyTypeLabel.slice(1)} şu anda müsait durumda. Görüntüleme randevusu için bizimle iletişime geçebilirsiniz. Anlaşma sonrası ${status === 'satilik' ? 'tapu devri' : 'kiralama'} işlemleri hızlıca tamamlanabilir.`,
      },
      {
        question: `${neighborhood} bölgesi hakkında bilgi alabilir miyim?`,
        answer: `${neighborhood} Mahallesi, Karasu'nun en gözde bölgelerinden biridir. ${
          neighborhood === 'Sahil' 
            ? 'Denize yakın konumu, sosyal aktivite alanları ve yüksek yatırım değeri ile öne çıkar. Sahil yürüyüş yolu, plajlar ve deniz manzarası için idealdir.'
            : neighborhood === 'Merkez'
            ? 'Merkezi konumu sayesinde tüm ihtiyaçlarınıza yürüme mesafesindedir. Okul, hastane, market ve kamu hizmetlerine kolay erişim sağlar.'
            : neighborhood === 'Çamlık'
            ? 'Sakin ve huzurlu yaşam için ideal bir bölgedir. Doğa içinde, ağaçlık alanlara yakın ve aile yaşamı için mükemmeldir.'
            : 'Karasu\'nun gelişen bölgelerinden biridir ve yatırım potansiyeli yüksektir.'
        }`,
      },
      {
        question: status === 'satilik' ? 'Kredi çekebilir miyim?' : 'Depozito ne kadar?',
        answer: status === 'satilik' 
          ? 'Evet, bu gayrimenkul için bankalardan konut kredisi çekebilirsiniz. Krediye uygunluk durumunuz için bankanızla görüşebilir, gerekli belgeler konusunda size yardımcı olabiliriz. Peşinat oranı genellikle %20 civarındadır.'
          : `Depozito tutarı genellikle 1-2 aylık kira bedeli kadardır. ${price ? `Bu ilan için yaklaşık ₺${new Intl.NumberFormat('tr-TR').format(price * 1.5)} - ₺${new Intl.NumberFormat('tr-TR').format(price * 2)} arasında olabilir.` : ''} Detaylı bilgi için görüşme sırasında netleştirilebilir.`,
      },
      {
        question: 'Aidat ve ortak giderler ne kadar?',
        answer: propertyType === 'daire' 
          ? `Site içi ${propertyType} için aylık aidat bulunmaktadır. ${sizeM2 ? `${sizeM2} m² için tahmini aidat ₺${Math.round(sizeM2 * 3)}-₺${Math.round(sizeM2 * 5)} arasındadır.` : 'Aidat miktarı için lütfen bizimle iletişime geçin.'} Aidat elektrik, su, güvenlik ve site bakım giderlerini kapsar.`
          : 'Müstakil yapı olduğu için aidat bulunmamaktadır. Sadece elektrik, su ve doğalgaz gibi bireysel tüketim giderleri vardır.',
      },
      {
        question: 'Tapu durumu nasıl?',
        answer: status === 'satilik'
          ? 'Tapu devri için gerekli tüm belgeler hazır durumdadır. Kat mülkiyeti veya kat irtifakı durumu, tapu tipi ve varsa takyidat bilgileri görüşme sırasında detaylı olarak paylaşılacaktır. Satış işlemi noter huzurunda gerçekleştirilir.'
          : 'Kira sözleşmesi noter onaylı olarak düzenlenir. Mülk sahibinin tapu bilgileri ve sizden istenecek belgeler görüşme sırasında netleştirilir.',
      },
      {
        question: 'Yakın çevrede neler var?',
        answer: `${neighborhood} bölgesinde market, okul, sağlık merkezi, park gibi tüm ihtiyaçlarınız yürüme mesafesindedir. ${
          neighborhood === 'Sahil' 
            ? 'Deniz, sahil yürüyüş yolu, kafeler ve restoranlar çok yakında.'
            : neighborhood === 'Merkez'
            ? 'Alışveriş merkezleri, bankalar, kamu kurumları ve toplu taşıma araçlarına kolay erişim.'
            : 'Doğa yürüyüş alanları, parklar ve sakin sokaklar aileniz için güvenli bir çevre sunuyor.'
        }`,
      },
    ];

    if (status === 'satilik') {
      faqs.push({
        question: 'Emlak vergisi ne kadar?',
        answer: `Yıllık emlak vergisi, gayrimenkulün değerine göre belirlenir. ${sizeM2 && price ? `Tahmini olarak yılda ₺${Math.round(price * 0.002)} civarında olabilir.` : ''} Detaylı bilgi için belediye kayıtlarına bakılabilir.`,
      });
    }

    return faqs;
  };

  const faqs = getFAQs();

  // Generate FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  return (
    <>
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className={cn("bg-white rounded-xl border-2 border-gray-200 p-6", className)}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl">
            <HelpCircle className="h-6 w-6 text-[#006AFF]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Sık Sorulan Sorular</h3>
            <p className="text-sm text-gray-600">Merak edilenler</p>
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-colors duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-200",
                    openIndex === index && "transform rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openIndex === index ? "max-h-96" : "max-h-0"
                )}
              >
                <div className="p-4 pt-0 text-sm text-gray-700 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <p className="text-sm text-gray-900 text-center font-medium">
            💬 Başka sorularınız mı var? Bizimle iletişime geçmekten çekinmeyin!
          </p>
        </div>
      </div>
    </>
  );
}

