"use client";

import { Star, Quote, Home, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@karasu/ui";
import Link from "next/link";

export function SuccessStoriesSection() {
  const stories = [
    {
      id: 1,
      name: "Ahmet Yılmaz",
      role: "Yatırımcı",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      property: "Denize Sıfır Villa",
      location: "Sahil Mahallesi",
      price: 1200000,
      roi: 12.5,
      testimonial: "Karasu Emlak sayesinde hayalimdeki denize sıfır villayı buldum. Profesyonel ekibin desteğiyle hem satın alma hem de yatırım sürecinde her adımda yanımdaydılar. 1 yılda %12.5 değer artışı gerçekleşti.",
      rating: 5,
      date: "2024",
    },
    {
      id: 2,
      name: "Ayşe Demir",
      role: "İlk Ev Alıcısı",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      property: "3+1 Daire",
      location: "Merkez Mahallesi",
      price: 450000,
      roi: null,
      testimonial: "İlk evimizi alırken çok endişeliydik. Karasu Emlak ekibi bize sabırla rehberlik etti, tüm süreçleri açıkladı ve en uygun seçeneği bulmamıza yardımcı oldu. Şimdi mutlu bir şekilde yeni evimizde yaşıyoruz.",
      rating: 5,
      date: "2024",
    },
    {
      id: 3,
      name: "Mehmet Kaya",
      role: "Emlak Satıcısı",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
      property: "Yazlık Ev",
      location: "Çamlık Mahallesi",
      price: 680000,
      roi: null,
      testimonial: "Yazlık evimi satmak istiyordum. Karasu Emlak ekibi profesyonel fotoğraf çekimi, pazarlama ve müşteri bulma konusunda mükemmel bir hizmet sundu. 2 hafta içinde satış gerçekleşti.",
      rating: 5,
      date: "2024",
    },
  ];

  const stats = [
    { value: "500+", label: "Mutlu Müşteri" },
    { value: "%98", label: "Memnuniyet Oranı" },
    { value: "15", label: "Yıllık Deneyim" },
    { value: "7/24", label: "WhatsApp Destek" },
  ];

  return (
    <section className="py-10 lg:py-14 bg-gray-50 relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Başarı Hikayeleri</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Müşterilerimizin Hikayeleri
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              Gerçek müşterilerimizin deneyimleri. Hayallerini gerçekleştiren insanların hikayeleri.
            </p>
          </div>

          {/* Success Stories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2"
              >
                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote className="h-6 w-6 text-[#006AFF]/30 stroke-[1.5]" />
                </div>

                {/* Testimonial */}
                <p className="text-[15px] text-gray-700 mb-6 leading-[1.7] line-clamp-5">
                  "{story.testimonial}"
                </p>

                {/* Property Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Home className="h-4 w-4 text-[#006AFF] stroke-[1.5]" />
                    <span className="text-sm font-bold text-gray-900">{story.property}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{story.location}</div>
                  <div className="text-lg font-bold text-[#006AFF]">
                    ₺{new Intl.NumberFormat('tr-TR').format(story.price)}
                  </div>
                  {story.roi && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600 stroke-[1.5]" />
                      <span className="text-green-600 font-semibold">%{story.roi} ROI</span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="relative">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
                      <CheckCircle2 className="h-3 w-3 text-white stroke-[1.5]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-[15px]">{story.name}</div>
                    <div className="text-xs text-gray-500">{story.role}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400 stroke-[1.5]" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-[17px] text-gray-600 mb-6">
              Siz de başarı hikayelerimizden biri olmak ister misiniz?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/ilan-ekle">
                <Button
                  size="lg"
                  className="bg-[#006AFF] hover:bg-[#0052CC] text-white text-[15px] font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Ücretsiz İlan Verin
                </Button>
              </Link>
              <Link href="/iletisim">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-[15px] font-semibold px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Uzman Danışmanlık Alın
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
