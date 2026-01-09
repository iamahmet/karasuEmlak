"use client";

import { Phone, Mail, MessageCircle, Award, Users } from "lucide-react";

export function AgentTeamSection() {
  const team = [
    {
      name: "Ahmet Karasu",
      role: "Kurucu & Yönetici",
      experience: "15 Yıl",
      speciality: "Lüks Villalar & Yatırım Danışmanlığı",
      phone: "+90 (546) 639 54 61",
      email: "info@karasuemlak.net",
      stats: {
        sales: "200+",
        rating: "4.9/5.0",
        response: "< 1 saat",
      },
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-block mb-4">
              <span className="text-[#006AFF] text-sm font-bold uppercase tracking-wider">Uzman Ekibimiz</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-gray-900 tracking-tight">
              Deneyimli Emlak Danışmanlarımız
            </h2>
            <p className="text-[17px] md:text-[19px] text-gray-600 max-w-3xl mx-auto leading-[1.7]">
              15 yıllık tecrübe ve yerel uzmanlık ile hayalinizdeki evi bulmanıza yardımcı oluyoruz
            </p>
          </div>

          {/* Team Members */}
          <div className="grid grid-cols-1 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#006AFF]/40 transition-all duration-300"
              >
                <div className="grid md:grid-cols-5 gap-6 p-8 lg:p-10">
                  {/* Agent Image */}
                  <div className="md:col-span-2">
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden border border-gray-200">
                      {/* Placeholder for agent photo */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="h-24 w-24 text-blue-300 stroke-[1.5]" />
                      </div>
                      
                      {/* Verified Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-green-500 text-white px-3 py-2 rounded-lg text-[12px] font-bold shadow-lg flex items-center gap-1.5">
                          <Award className="h-4 w-4 stroke-[1.5]" />
                          Doğrulanmış
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-4 space-y-2">
                      <a
                        href={`tel:${member.phone.replace(/\s/g, '').replace(/[()]/g, '')}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#006AFF] hover:bg-[#0052CC] text-white rounded-xl font-semibold text-[15px] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <Phone className="h-4 w-4 stroke-[1.5]" />
                        Hemen Ara
                      </a>
                      <a
                        href={`https://wa.me/905466395461`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-xl font-semibold text-[15px] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle className="h-4 w-4 stroke-[1.5]" />
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Agent Info */}
                  <div className="md:col-span-3">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-lg text-[#006AFF] font-semibold mb-1">
                        {member.role}
                      </p>
                      <p className="text-[15px] text-gray-600">
                        {member.experience} Deneyim
                      </p>
                    </div>

                    {/* Speciality */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-[15px] text-gray-700 font-medium">
                        <span className="font-bold">Uzmanlık:</span> {member.speciality}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {member.stats.sales}
                        </div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Satış
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {member.stats.rating}
                        </div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Puan
                        </div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {member.stats.response}
                        </div>
                        <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Yanıt
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <a
                        href={`tel:${member.phone.replace(/\s/g, '').replace(/[()]/g, '')}`}
                        className="flex items-center gap-3 text-[15px] text-gray-700 hover:text-[#006AFF] transition-colors duration-200"
                      >
                        <Phone className="h-4 w-4 stroke-[1.5]" />
                        {member.phone}
                      </a>
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-3 text-[15px] text-gray-700 hover:text-[#006AFF] transition-colors duration-200"
                      >
                        <Mail className="h-4 w-4 stroke-[1.5]" />
                        {member.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
