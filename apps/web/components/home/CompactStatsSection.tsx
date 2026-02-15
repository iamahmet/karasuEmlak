import { Building2, Home, Heart, Users } from "lucide-react";

export function CompactStatsSection({ total }: { total?: number }) {
  const safeTotal = typeof total === "number" && total > 0 ? total : 500;

  const statItems = [
    {
      icon: Building2,
      value: `${safeTotal}+`,
      label: "Aktif İlan",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Home,
      value: "10+",
      label: "Yıllık Deneyim",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Heart,
      value: "%98",
      label: "Müşteri Memnuniyeti",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Users,
      value: "1000+",
      label: "Mutlu Müşteri",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white via-blue-50/30 to-white border-b border-gray-200 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#006AFF] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00A862] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-3 text-gray-900 tracking-tight">
              Karasu Emlak İstatistikleri
            </h2>
            <p className="text-[16px] text-gray-600 max-w-2xl mx-auto">
              Güvenilir emlak danışmanlığı hizmeti ile yıllardır müşterilerimize hizmet veriyoruz
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {statItems.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-xl p-6 lg:p-8 text-center border-2 border-gray-200 hover:border-[#006AFF]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color.replace('text-', 'from-')} to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`h-8 w-8 ${stat.color} stroke-[1.5]`} />
                    </div>
                    <div className={`text-3xl lg:text-4xl font-bold ${stat.color} mb-2 tracking-tight`}>
                      {stat.value}
                    </div>
                    <div className="text-sm lg:text-base font-semibold text-gray-700 tracking-tight">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
