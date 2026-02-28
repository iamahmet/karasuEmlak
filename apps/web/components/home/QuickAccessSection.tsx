import Link from "next/link";
import { Home, Building2, TreePine, Key, ArrowRight } from "lucide-react";

import { cn } from "@karasu/lib";

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

    <section className="py-12 lg:py-16 bg-gray-50/50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-[-0.03em] leading-tight">
              Gayrimenkul Kategorileri
            </h2>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Karasu'nun her bölgesinde, ihtiyacınıza uygun satılık ve kiralık seçeneklerle dolu en geniş portföyü keşfedin.
            </p>
          </div>

          {/* Quick Access Grid - Bento Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
            {quickAccessItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="group relative"
                >
                  <div className="relative h-full bg-white rounded-[40px] p-6 border border-gray-100 hover:shadow-[0_40px_100px_rgba(0,106,255,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col items-center text-center">
                    {/* Abstract Background Glow */}
                    <div className={cn(
                      "absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                      item.color.includes('blue') ? 'bg-blue-600' :
                        item.color.includes('green') ? 'bg-emerald-600' :
                          item.color.includes('purple') ? 'bg-purple-600' : 'bg-orange-600'
                    )}></div>

                    {/* Icon Container */}
                    <div className="relative mb-8">
                      <div className={cn(
                        "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                        item.bgColor
                      )}>
                        <Icon className={cn("h-10 w-10 stroke-[1.5]", item.textColor)} />
                      </div>

                      {/* Secondary Floating Icon */}
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-50 flex items-center justify-center scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                        <ArrowRight className={cn("h-4 w-4", item.textColor)} />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-blue-600 transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 font-medium leading-relaxed mb-8">
                      {item.description}
                    </p>

                    <span className="mt-auto px-6 py-2 rounded-full bg-gray-50 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      İlanları Gör
                    </span>

                    {/* Badge */}
                    {item.badge && (
                      <div className="absolute top-6 right-6">
                        <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20">
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
