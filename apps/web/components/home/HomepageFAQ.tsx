"use client";

import { useState } from "react";
import { ChevronDown, Phone, MessageCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function HomepageFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Karasu'da ev almanın avantajları nelerdir?",
      answer: "Karasu, denize sıfır konumu, gelişen altyapısı ve İstanbul'a yakınlığıyla ideal bir yatırım noktasıdır. Hem yazlık hem de sürekli yaşam için mükemmel seçenekler sunar. Yüksek kira getirisi ve değer artış potansiyeli ile yatırımcılar için cazip fırsatlar barındırır."
    },
    {
      question: "İlan verme ücreti var mı?",
      answer: "Hayır, ilanlarınızı tamamen ücretsiz verebilirsiniz. Karasu Emlak olarak, gayrimenkul sahiplerine maksimum görünürlük sağlamak için ücretsiz ilan hizmeti sunuyoruz. Profesyonel fotoğraf çekimi ve ilan düzenleme desteği de ücretsizdir."
    },
    {
      question: "Satış süreci ne kadar sürer?",
      answer: "Ortalama satış süresi 30-45 gün arasındadır. Ancak bu süre, gayrimenkulün konumu, fiyatı ve piyasa koşullarına göre değişiklik gösterebilir. Profesyonel ekibimiz, süreci hızlandırmak için aktif pazarlama stratejileri uygular."
    },
    {
      question: "Kredi ile ev alabilir miyim?",
      answer: "Evet, bankalarla çalışan ekibimiz kredi sürecinizde size yardımcı olur. Kredi hesaplayıcımızla aylık ödeme planınızı önceden görebilir, en uygun kredi seçeneklerini karşılaştırabilirsiniz. Kredi başvuru sürecinizde de yanınızdayız."
    },
    {
      question: "Yabancılara satış yapıyor musunuz?",
      answer: "Evet, yabancı uyruklu vatandaşlara da hizmet veriyoruz. Tapu işlemleri, askeri bölge kontrolü ve yasal süreçlerde profesyonel destek sağlıyoruz. İngilizce, Rusça ve Arapça dil desteğimiz mevcuttur."
    },
    {
      question: "Konut kredisi faiz oranları nedir?",
      answer: "Konut kredisi faiz oranları bankalara ve kampanyalara göre değişiklik gösterir. Güncel faiz oranları için kredi hesaplayıcımızı kullanabilir veya bizi arayarak detaylı bilgi alabilirsiniz. Bankalarla özel anlaşmalarımız sayesinde avantajlı oranlar sunabiliyoruz."
    },
  ];

  return (
    <section className="py-10 lg:py-14 bg-gray-50 relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Sıkça Sorulan Sorular</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Merak Edilenler
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-2xl mx-auto leading-[1.7]">
              Emlak alım-satım sürecinde en çok sorulan sorular
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4 mb-12">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    isOpen ? "border-[#006AFF]" : "border-gray-200"
                  } hover:border-[#006AFF]/50`}
                >
                  {/* Question Button */}
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left transition-colors duration-200 hover:bg-gray-50"
                  >
                    <span className={`text-lg font-bold tracking-tight ${
                      isOpen ? "text-[#006AFF]" : "text-gray-900"
                    }`}>
                      {faq.question}
                    </span>
                    <ChevronDown className={`h-5 w-5 flex-shrink-0 ml-4 transition-all duration-300 ${
                      isOpen ? "rotate-180 text-[#006AFF]" : "text-gray-400"
                    }`} strokeWidth={1.5} />
                  </button>

                  {/* Answer */}
                  <div className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    <div className="px-6 pb-6 pt-2">
                      <p className="text-[15px] text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
              Sorunuz mu var?
            </h3>
            <p className="text-[15px] text-gray-600 mb-6">
              Uzman ekibimiz size yardımcı olmaktan mutluluk duyar
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:+905325933854"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#006AFF] hover:bg-[#0052CC] text-white rounded-xl font-semibold text-[15px] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Phone className="h-5 w-5 stroke-[1.5]" />
                Hemen Ara
              </a>
              <a
                href="https://wa.me/905325933854"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl font-semibold text-[15px] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5 stroke-[1.5]" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Schema.org FAQ Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          }),
        }}
      />
    </section>
  );
}
