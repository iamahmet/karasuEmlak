"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@karasu/ui";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    // Simulate API call
    setTimeout(() => {
      if (email.includes("@")) {
        setStatus("success");
        setMessage("Başarıyla kayıt oldunuz! Teşekkürler.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage("Lütfen geçerli bir e-posta adresi girin.");
      }
    }, 1000);
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-r from-[#006AFF] to-[#0052CC] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-block mb-4">
              <span className="text-white text-sm font-bold uppercase tracking-wider">E-Bülten</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-white tracking-tight">
              Güncel Fırsatları Kaçırmayın
            </h2>
            <p className="text-[17px] md:text-[19px] text-white/90 max-w-2xl mx-auto leading-[1.7]">
              Yeni ilanlar, özel fırsatlar, piyasa analizleri ve emlak haberlerinden haberdar olmak için e-bültenimize kaydolun.
            </p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresinizi girin"
                  className="w-full px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:border-white focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200 text-[15px] font-medium"
                  required
                  disabled={status === "loading"}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={status === "loading"}
                className="bg-white text-[#006AFF] hover:bg-gray-100 text-[15px] font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 whitespace-nowrap"
              >
                {status === "loading" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#006AFF] border-t-transparent rounded-full animate-spin" />
                    Gönderiliyor...
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 stroke-[1.5]" />
                    Kayıt Oldunuz!
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 stroke-[1.5]" />
                    Kayıt Ol
                  </>
                )}
              </Button>
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`mt-4 p-4 rounded-xl flex items-start gap-3 ${
                  status === "success"
                    ? "bg-green-500/20 backdrop-blur-sm border border-green-400/30"
                    : "bg-red-500/20 backdrop-blur-sm border border-red-400/30"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-300 stroke-[1.5] flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-300 stroke-[1.5] flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm font-medium ${
                    status === "success" ? "text-green-100" : "text-red-100"
                  }`}
                >
                  {message}
                </p>
              </div>
            )}
          </form>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
              <div className="text-2xl mb-2">📧</div>
              <div className="text-sm font-semibold text-white mb-1">Haftalık Güncellemeler</div>
              <div className="text-xs text-white/80">Yeni ilanlar ve fırsatlar</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-semibold text-white mb-1">Piyasa Analizleri</div>
              <div className="text-xs text-white/80">Uzman görüşleri ve trendler</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center border border-white/20">
              <div className="text-2xl mb-2">🎁</div>
              <div className="text-sm font-semibold text-white mb-1">Özel Fırsatlar</div>
              <div className="text-xs text-white/80">Sadece abonelere özel</div>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="mt-8 text-center text-xs text-white/70">
            E-posta adresiniz güvende. KVKK uyumlu gizlilik politikamızı{" "}
            <a href="/gizlilik" className="underline hover:text-white transition-colors">
              buradan
            </a>{" "}
            okuyabilirsiniz. İstediğiniz zaman abonelikten çıkabilirsiniz.
          </p>
        </div>
      </div>
    </section>
  );
}
