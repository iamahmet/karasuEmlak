'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@karasu/ui';
import { OptimizedImage } from '@/components/images';

interface VirtualTourProps {
  virtualTourUrl?: string;
  videoTourUrl?: string;
  floorPlanUrl?: string;
  propertyTitle: string;
  className?: string;
}

/**
 * Virtual Tour Component
 * Supports 360° tours, video tours, and floor plans
 */
export default function VirtualTour({ 
  virtualTourUrl,
  videoTourUrl,
  floorPlanUrl,
  propertyTitle,
  className = '' 
}: VirtualTourProps) {
  // If no virtual tour data, don't render
  if (!virtualTourUrl && !videoTourUrl && !floorPlanUrl) {
    return null;
  }

  const hasMultipleTabs = (virtualTourUrl ? 1 : 0) + (videoTourUrl ? 1 : 0) + (floorPlanUrl ? 1 : 0) > 1;

  return (
    <div className={`virtual-tour-container ${className}`}>
      {hasMultipleTabs ? (
        <Tabs defaultValue={virtualTourUrl ? 'tour' : videoTourUrl ? 'video' : 'floorplan'} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {virtualTourUrl && (
              <TabsTrigger value="tour">360° Tur</TabsTrigger>
            )}
            {videoTourUrl && (
              <TabsTrigger value="video">Video Tur</TabsTrigger>
            )}
            {floorPlanUrl && (
              <TabsTrigger value="floorplan">Kat Planı</TabsTrigger>
            )}
          </TabsList>

          {virtualTourUrl && (
            <TabsContent value="tour" className="mt-4">
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <iframe
                  src={virtualTourUrl}
                  className="w-full h-full border-0"
                  allow="fullscreen; vr"
                  allowFullScreen
                  title={`${propertyTitle} - 360° Sanal Tur`}
                  loading="lazy"
                  aria-label="360° Sanal Tur"
                />
              </div>
            </TabsContent>
          )}

          {videoTourUrl && (
            <TabsContent value="video" className="mt-4">
              <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {videoTourUrl.includes('youtube.com') || videoTourUrl.includes('youtu.be') ? (
                  <iframe
                    src={videoTourUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${propertyTitle} - Video Tur`}
                    loading="lazy"
                    aria-label="Video Tur"
                  />
                ) : videoTourUrl.includes('vimeo.com') ? (
                  <iframe
                    src={videoTourUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={`${propertyTitle} - Video Tur`}
                    loading="lazy"
                    aria-label="Video Tur"
                  />
                ) : (
                  <video
                    src={videoTourUrl}
                    controls
                    className="w-full h-full"
                    aria-label="Video Tur"
                  >
                    Tarayıcınız video oynatmayı desteklemiyor.
                  </video>
                )}
              </div>
            </TabsContent>
          )}

          {floorPlanUrl && (
            <TabsContent value="floorplan" className="mt-4">
              <div className="relative bg-background rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <OptimizedImage
                  publicId={floorPlanUrl}
                  alt={`${propertyTitle} - Kat Planı`}
                  width={800}
                  height={600}
                  className="w-full h-full object-contain"
                />
              </div>
            </TabsContent>
          )}
        </Tabs>
      ) : (
        <div className="relative bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {virtualTourUrl && (
            <iframe
              src={virtualTourUrl}
              className="w-full h-full border-0"
              allow="fullscreen; vr"
              allowFullScreen
              title={`${propertyTitle} - 360° Sanal Tur`}
              loading="lazy"
              aria-label="360° Sanal Tur"
            />
          )}
          {videoTourUrl && !virtualTourUrl && (
            <>
              {videoTourUrl.includes('youtube.com') || videoTourUrl.includes('youtu.be') ? (
                <iframe
                  src={videoTourUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${propertyTitle} - Video Tur`}
                  loading="lazy"
                  aria-label="Video Tur"
                />
              ) : videoTourUrl.includes('vimeo.com') ? (
                <iframe
                  src={videoTourUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  className="w-full h-full border-0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={`${propertyTitle} - Video Tur`}
                  loading="lazy"
                  aria-label="Video Tur"
                />
              ) : (
                <video
                  src={videoTourUrl}
                  controls
                  className="w-full h-full"
                  aria-label="Video Tur"
                >
                  Tarayıcınız video oynatmayı desteklemiyor.
                </video>
              )}
            </>
          )}
          {floorPlanUrl && !virtualTourUrl && !videoTourUrl && (
            <OptimizedImage
              publicId={floorPlanUrl}
              alt={`${propertyTitle} - Kat Planı`}
              width={800}
              height={600}
              className="w-full h-full object-contain"
            />
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Sanal Tur:</strong> Bu ilanı 360° görüntüleme ile keşfedin. 
          Mouse veya dokunmatik ekran ile etrafı gezebilirsiniz.
        </p>
      </div>
    </div>
  );
}

