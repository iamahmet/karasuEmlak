import { Search, FileCheck, Key, CheckCircle2, ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      number: "01",
      title: "İlanları Keşfedin",
      description: "Gelişmiş filtreleme ile size en uygun gayrimenkulleri bulun. Fiyat, konum, özellikler ve daha fazlasına göre arayın.",
    },
    {
      icon: FileCheck,
      number: "02",
      title: "Detayları İnceleyin",
      description: "360° tur, video ve fotoğraflarla her detayı görün. Mahalle bilgileri ve yatırım analizleriyle bilinçli karar verin.",
    },
    {
      icon: Key,
      number: "03",
      title: "Randevu Alın",
      description: "İletişim formu, WhatsApp veya telefon ile hemen iletişime geçin. Profesyonel ekibimiz size yardımcı olacak.",
    },
    {
      icon: CheckCircle2,
      number: "04",
      title: "Anlaşmayı Tamamlayın",
      description: "Yasal süreçlerde yanınızdayız. Sözleşmeden teslimata kadar her adımda profesyonel destek.",
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-50">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100/50 rounded-full">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">SÜREÇ</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-tight">
                Hayalinizdeki Eve <span className="text-blue-600">4 Kolay</span> Adım
              </h2>
            </div>
            <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
              Emlak alım-satım ve kiralama süreçlerini sizin için şeffaf, hızlı ve keyifli bir yolculuğa dönüştürüyoruz.
            </p>
          </div>

          {/* Steps Grid */}
          <div className="relative">
            {/* Visual connector line (hidden on mobile) */}
            <div className="hidden lg:block absolute top-[100px] left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-blue-100 to-transparent -z-10"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={index}
                    className="group relative flex flex-col items-center lg:items-start text-center lg:text-left"
                  >
                    {/* Circle Indicator */}
                    <div className="mb-12 relative flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-white shadow-[0_20px_50px_rgba(0,106,255,0.08)] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 relative z-10">
                        <Icon className="h-10 w-10 stroke-[1.5]" />
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 -z-0"></div>

                      {/* Step Number Badge */}
                      <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-black shadow-xl z-20">
                        {step.number}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
