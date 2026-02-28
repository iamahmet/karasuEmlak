"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Home, Building2, TrendingUp } from "lucide-react";
import { Button } from "@karasu/ui";

interface SEOContentSectionProps {
  basePath?: string;
}

export function SEOContentSection({ basePath = "" }: SEOContentSectionProps) {
  return (
    <section className="py-10 lg:py-14 bg-white">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Main SEO Content */}
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Karasu Emlak: Sakarya'nın Gözde Sahil İlçesinde Güvenilir Gayrimenkul Rehberi
            </h2>
            
            <p className="text-[17px] text-gray-700 leading-relaxed mb-6">
              Karasu emlak, Sakarya'nın en değerli sahil ilçelerinden birinde gayrimenkul arayanlar için kapsamlı bir rehber ve güvenilir bir kaynaktır. Denize sıfır konumları, modern yaşam alanları ve yatırım potansiyeli yüksek gayrimenkul seçenekleri ile Karasu, emlak piyasasında öne çıkan bir bölgedir.
            </p>

            <h3 className="text-2xl font-display font-bold mt-8 mb-4 text-gray-900">
              Karasu'da Emlak Nedir?
            </h3>
            <p className="text-[17px] text-gray-700 leading-relaxed mb-4">
              Karasu'da emlak, Sakarya ilinin sahil şeridinde yer alan bu güzel ilçede satılık ve kiralık gayrimenkul seçeneklerini ifade eder. Karasu emlak piyasası, denize yakın konumu, yazlık evleri, modern konut projeleri ve yatırım fırsatları ile zengin bir yelpazeye sahiptir.
            </p>
            <p className="text-[17px] text-gray-700 leading-relaxed mb-6">
              Karasu'da emlak arayanlar için başlıca seçenekler arasında satılık daireler, kiralık daireler, satılık villalar, kiralık villalar, yazlık evler, arsalar ve işyerleri bulunmaktadır. Her bir gayrimenkul türü, farklı ihtiyaçlara ve bütçelere uygun çözümler sunar.
            </p>

            <h3 className="text-2xl font-display font-bold mt-8 mb-4 text-gray-900">
              Karasu Emlak Piyasası Genel Bakış
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h4 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  Satılık Emlak Piyasası
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu'da satılık emlak piyasası, özellikle denize yakın konumlarda güçlü bir talep görmektedir. <Link href={`${basePath}/satilik?tip=daire`} className="text-blue-600 hover:underline font-medium">Satılık daireler</Link>, <Link href={`${basePath}/satilik?tip=villa`} className="text-blue-600 hover:underline font-medium">satılık villalar</Link> ve <Link href={`${basePath}/satilik?tip=yazlik`} className="text-blue-600 hover:underline font-medium">satılık yazlık evler</Link>, yatırımcılar ve yaşam kalitesi arayanlar için cazip seçenekler sunmaktadır.
                </p>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu satılık ev fiyatları, konum, metrekare, oda sayısı ve özelliklere göre değişkenlik göstermektedir. Denize sıfır konumlar ve merkez mahallelerdeki gayrimenkuller genellikle daha yüksek fiyat aralıklarında yer alırken, ilçe merkezine biraz daha uzak bölgelerde daha uygun fiyatlı seçenekler bulunabilir.
                </p>
                <Link href={`${basePath}/satilik`} className="inline-flex items-center gap-2 text-blue-600 font-semibold mt-4 hover:gap-3 transition-all">
                  Satılık İlanları Görüntüle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  Kiralık Emlak Piyasası
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu'da <Link href={`${basePath}/kiralik?tip=daire`} className="text-green-600 hover:underline font-medium">kiralık emlak piyasası</Link>, özellikle yaz aylarında artan talep ile dinamik bir yapıya sahiptir. <Link href={`${basePath}/kiralik?tip=daire`} className="text-green-600 hover:underline font-medium">Kiralık daireler</Link> ve <Link href={`${basePath}/kiralik?tip=villa`} className="text-green-600 hover:underline font-medium">kiralık villalar</Link>, hem yerleşik nüfus hem de yazlıkçılar için popüler seçeneklerdir.
                </p>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Kiralık emlak fiyatları, mevsimsel değişiklikler gösterebilir. Yaz aylarında denize yakın konumlardaki kiralık evlerin fiyatları artarken, kış aylarında daha uygun fiyatlı seçenekler bulunabilir. Karasu emlak danışmanları, kiralık ev arayanlara en uygun seçenekleri bulmalarında yardımcı olmaktadır.
                </p>
                <Link href={`${basePath}/kiralik`} className="inline-flex items-center gap-2 text-green-600 font-semibold mt-4 hover:gap-3 transition-all">
                  Kiralık İlanları Görüntüle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                <h4 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Yazlık Emlak Piyasası
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu yazlık emlak piyasası, İstanbul'a yakınlığı ve 20 kilometrelik kumsalı ile öne çıkmaktadır. <Link href={`${basePath}/satilik?tip=yazlik`} className="text-orange-600 hover:underline font-medium">Yazlık evler</Link>, denize sıfır villalar ve yazlık daireler, özellikle İstanbul'dan gelen yatırımcılar ve tatilciler için cazip seçenekler sunmaktadır.
                </p>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Yazlık emlak yatırımı yapmak isteyenler için Karasu, hem kullanım hem de kira geliri açısından değerli fırsatlar sunmaktadır. Yaz aylarında yüksek kira geliri potansiyeli, yazlık emlak yatırımlarını cazip kılmaktadır.
                </p>
                <Link href={`${basePath}/satilik?tip=yazlik`} className="inline-flex items-center gap-2 text-orange-600 font-semibold mt-4 hover:gap-3 transition-all">
                  Yazlık İlanları Görüntüle
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
                <h4 className="text-xl font-bold mb-3 text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Yatırımlık Gayrimenkul
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu yatırımlık gayrimenkul seçenekleri, hem kısa vadeli hem de uzun vadeli yatırımcılar için fırsatlar sunmaktadır. Denize yakın konumlar, merkez mahalleler ve gelişmekte olan bölgeler, farklı yatırım stratejilerine uygun seçenekler içermektedir.
                </p>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu emlak yatırım danışmanlığı hizmetimiz ile, yatırımcılara piyasa analizi, değerleme ve en uygun yatırım fırsatlarını sunuyoruz. Karasu gayrimenkul piyasası, sağlam bir yatırım alanı olarak öne çıkmaktadır.
                </p>
                <Link href={`${basePath}/karasu-yatirimlik-gayrimenkul`} className="inline-flex items-center gap-2 text-purple-600 font-semibold mt-4 hover:gap-3 transition-all">
                  Yatırım Fırsatlarını İncele
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <h3 className="text-2xl font-display font-bold mt-8 mb-4 text-gray-900">
              Karasu Mahalleleri ve Emlak Piyasası
            </h3>
            <p className="text-[17px] text-gray-700 leading-relaxed mb-6">
              Karasu'nun her mahallesi, kendine özgü emlak karakteristikleri ve yatırım potansiyeli sunmaktadır. İşte Karasu'da emlak arayanlar için öne çıkan mahalleler:
            </p>

            {/* Neighborhoods Grid */}
            <div className="space-y-6 my-8">
              {/* Merkez Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/merkez`} className="hover:text-[#006AFF] transition-colors">
                    Merkez Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Merkez Mahallesi, ilçenin en merkezi ve canlı bölgesidir. Tüm ihtiyaçlara yakın konumu ile ideal bir yaşam alanı sunar.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Merkez`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Merkez`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Sahil Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/sahil`} className="hover:text-[#006AFF] transition-colors">
                    Sahil Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Sahil Mahallesi, denize sıfır konumu ile yazlık ve kalıcı yaşam için ideal bir bölgedir.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Sahil`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Sahil`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Yalı Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/yali-mahallesi`} className="hover:text-[#006AFF] transition-colors">
                    Yalı Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Yalı Mahallesi, denize yakın konumu ve sakin atmosferi ile tercih edilen bir bölgedir.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Yalı`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Yalı`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Aziziye Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/aziziye`} className="hover:text-[#006AFF] transition-colors">
                    Aziziye Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Aziziye Mahallesi, merkeze yakın konumu ve sakin yapısı ile dikkat çeker. Aileler için ideal bir yaşam alanı sunar.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Aziziye`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Aziziye`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Cumhuriyet Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/cumhuriyet`} className="hover:text-[#006AFF] transition-colors">
                    Cumhuriyet Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Cumhuriyet Mahallesi, geniş caddeleri ve modern yapıları ile öne çıkar. Şehir merkezine yakın konumu ile tercih edilen bir bölgedir.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Cumhuriyet`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Cumhuriyet`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Atatürk Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/ataturk`} className="hover:text-[#006AFF] transition-colors">
                    Atatürk Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Atatürk Mahallesi, tarihi dokusu ve merkezi konumu ile dikkat çeker. Tüm hizmetlere yakın konumu ile ideal bir yaşam alanı sunar.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Atatürk`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Atatürk`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Bota Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/bota`} className="hover:text-[#006AFF] transition-colors">
                    Bota Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Bota Mahallesi, denize yakın konumu ve doğal güzellikleri ile öne çıkar. Yazlık ve kalıcı yaşam için ideal bir bölgedir.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Bota`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Bota`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Liman Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/liman-mahallesi`} className="hover:text-[#006AFF] transition-colors">
                    Liman Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Liman Mahallesi, liman bölgesine yakın konumu ile ticari faaliyetler için idealdir. Denize yakın konumu ile de dikkat çeker.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Liman`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Liman`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Çamlık Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/camlica`} className="hover:text-[#006AFF] transition-colors">
                    Çamlık Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Çamlık Mahallesi, yeşil alanları ve sakin yapısı ile dikkat çeker. Aileler için ideal bir yaşam alanı sunar.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Çamlık`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Çamlık`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>

              {/* Kurtuluş Mahallesi */}
              <div className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-all">
                <h4 className="text-xl font-bold mb-3 text-gray-900">
                  <Link href={`${basePath}/mahalle/kurtulus`} className="hover:text-[#006AFF] transition-colors">
                    Kurtuluş Mahallesi Emlak
                  </Link>
                </h4>
                <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
                  Karasu Kurtuluş Mahallesi, geniş alanları ve modern yapıları ile öne çıkar. Şehir merkezine yakın konumu ile tercih edilen bir bölgedir.
                </p>
                <div className="flex gap-4">
                  <Link href={`${basePath}/satilik?neighborhood=Kurtuluş`} className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all">
                    Satılık İlanlar →
                  </Link>
                  <Link href={`${basePath}/kiralik?neighborhood=Kurtuluş`} className="inline-flex items-center gap-2 text-green-600 font-semibold hover:gap-3 transition-all">
                    Kiralık İlanlar →
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-[17px] text-gray-700 leading-relaxed mb-6 mt-6">
              Karasu'nun tüm mahallelerinde emlak seçeneklerini keşfetmek için <Link href={`${basePath}/karasu-mahalleler`} className="text-[#006AFF] hover:underline font-semibold">Karasu mahalle rehberimizi</Link> ziyaret edebilirsiniz. Her mahalle için detaylı emlak piyasası analizi, fiyat aralıkları ve yatırım potansiyeli bilgileri bulunmaktadır.
            </p>

            <h3 className="text-2xl font-display font-bold mt-8 mb-4 text-gray-900">
              Karasu'da Emlak Arayanlar İçin Rehber
            </h3>
            <p className="text-[17px] text-gray-700 leading-relaxed mb-4">
              Karasu'da satılık veya kiralık emlak arayanlar için kapsamlı ilan seçenekleri, uzman danışmanlık ve güvenilir hizmet sunuyoruz. Karasu emlak ofisi olarak, müşterilerimizin hayallerindeki evi bulmalarına yardımcı olmaktan mutluluk duyuyoruz.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-[#006AFF] hover:bg-[#0052CC] text-white">
                <Link href={`${basePath}/satilik`}>
                  Satılık İlanları Görüntüle
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 hover:border-[#006AFF]">
                <Link href={`${basePath}/kiralik`}>
                  Kiralık İlanları Görüntüle
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-gray-300 hover:border-[#006AFF]">
                <Link href={`${basePath}/iletisim`}>
                  İletişime Geç
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
