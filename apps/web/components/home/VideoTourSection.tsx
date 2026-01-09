"use client";

import { useState } from "react";
import { Play, X, Video, Camera } from "lucide-react";
import { Button } from "@karasu/ui";
import { cn } from "@karasu/lib";

export function VideoTourSection() {
  const [isPlaying, setIsPlaying] = useState(false);

  const videos = [
    {
      id: '1',
      title: 'Karasu Tanıtım Videosu',
      description: 'Karasu\'nun denize sıfır konumları, modern yaşam alanları ve yatırım fırsatlarını keşfedin',
      thumbnail: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '3:45',
    },
    {
      id: '2',
      title: 'Sahibinden Denize Sıfır Villa',
      description: 'Özel havuzlu, deniz manzaralı lüks villa turumuz',
      thumbnail: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '5:20',
    },
    {
      id: '3',
      title: 'Merkez\'de Modern Daireler',
      description: 'Şehir merkezinde yeni yapı daire projemiz',
      thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      duration: '4:15',
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
            <Video className="h-4 w-4 text-white stroke-[2]" />
            <span className="text-[13px] font-bold text-white uppercase tracking-wider">
              Video Turlar
            </span>
          </div>
          <h2 className="text-[36px] lg:text-[48px] font-display font-bold mb-4 text-white leading-[1.1] tracking-[-0.025em]">
            360° Sanal Turlarla Keşfedin
          </h2>
          <p className="text-[18px] lg:text-[20px] text-white/80 leading-[1.6] tracking-[-0.014em]">
            Evinizden çıkmadan Karasu'daki gayrimenkulleri video turlarla inceleyin
          </p>
        </div>

        {/* Featured Video */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative aspect-video rounded-2xl overflow-hidden group">
            {!isPlaying ? (
              <>
                <img
                  src={videos[0].thumbnail}
                  alt={videos[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                
                {/* Play Button */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group"
                >
                  <div className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white shadow-2xl">
                    <Play className="h-10 w-10 text-[#006AFF] ml-1 stroke-[2] fill-current" />
                  </div>
                </button>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-[24px] font-display font-bold text-white mb-2 tracking-[-0.022em]">
                    {videos[0].title}
                  </h3>
                  <p className="text-[15px] text-white/90 tracking-[-0.011em]">
                    {videos[0].description}
                  </p>
                </div>
              </>
            ) : (
              <div className="relative w-full h-full">
                <iframe
                  src={videos[0].videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {videos.slice(1).map((video, index) => (
            <div
              key={video.id}
              className={cn(
                "group relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden",
                "border border-white/10",
                "transition-all duration-300",
                "hover:border-white/30 hover:bg-white/10 hover:-translate-y-1",
                "cursor-pointer",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                
                {/* Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 text-[#006AFF] ml-0.5 stroke-[2]" />
                  </div>
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded text-xs font-bold text-white">
                  {video.duration}
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-display font-bold text-white mb-2 text-[16px] tracking-[-0.022em] group-hover:text-blue-300 transition-colors">
                  {video.title}
                </h4>
                <p className="text-[13px] text-white/70 line-clamp-2 tracking-[-0.01em]">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button 
            size="lg"
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white hover:bg-white/20 hover:scale-105 active:scale-95"
          >
            <Video className="h-5 w-5 mr-2 stroke-[2]" />
            Tüm Video Turları Görüntüle
          </Button>
        </div>
      </div>
    </section>
  );
}

