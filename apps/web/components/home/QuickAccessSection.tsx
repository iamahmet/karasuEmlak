import Link from "next/link";
import { Home, Building2, TreePine, Key, ArrowRight } from "lucide-react";

interface QuickAccessSectionProps {
  basePath?: string;
}

export function QuickAccessSection({ basePath = "" }: QuickAccessSectionProps) {
  const quickAccessItems = [
    {
      icon: Building2,
      title: "Satılık Daire",
      description: "Geniş seçenek",
      href: `${basePath}/satilik?tip=daire`,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      badge: "Popüler",
    },
    {
      icon: Home,
      title: "Satılık Villa",
      description: "Lüks seçenekler",
      href: `${basePath}/satilik?tip=villa`,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      icon: Key,
      title: "Kiralık Daire",
      description: "Hemen taşın",
      href: `${basePath}/kiralik?tip=daire`,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      icon: TreePine,
      title: "Yazlık",
      description: "Denize yakın",
      href: `${basePath}/satilik?tip=yazlik`,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 text-gray-900 tracking-tight">
              Karasu'da Satılık ve Kiralık Gayrimenkul Türleri
            </h2>
            <p className="text-[16px] md:text-[18px] text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Karasu'da satılık daire, kiralık daire, satılık villa, kiralık villa, yazlık ve arsa gibi her türlü gayrimenkul seçeneğini bulabilirsiniz. Denize sıfır konumlar, modern yaşam alanları ve yatırım fırsatları.
            </p>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {quickAccessItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group block"
                >
                  <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300 hover:-translate-y-2 h-full">
                    {/* Icon */}
                    <div className="mb-4">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${item.bgColor} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-7 w-7 ${item.textColor} stroke-[1.5]`} />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-tight group-hover:text-[#006AFF] transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-[15px] text-gray-600 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    {/* CTA */}
                    <div className="pt-4 border-t border-gray-200">
                      <span className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#006AFF] group-hover:gap-3 transition-all duration-200">
                        Keşfet
                        <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                      </span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-4 right-4">
                        <span className="px-2.5 py-1 bg-[#006AFF] text-white text-[11px] font-bold rounded-lg uppercase tracking-wider">
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
