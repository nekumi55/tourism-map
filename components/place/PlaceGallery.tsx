'use client';

import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PlaceGalleryProps {
  images: string[];
  placeName: string;
}

export default function PlaceGallery({ images, placeName }: PlaceGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const currentImage = images[activeIdx] || images[0];

  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Image Frame */}
      <div className="relative aspect-16/9 sm:aspect-21/9 rounded-3xl overflow-hidden bg-slate-900 shadow-xl group">
        <img
          src={currentImage}
          alt={`${placeName} - Ảnh ${activeIdx + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

        {/* Expand / Lightbox Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 transition-colors shadow-lg"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Xem ảnh lớn ({images.length})</span>
        </button>

        {/* Counter Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-900/70 text-white text-xs font-medium backdrop-blur-xs">
          {activeIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={`relative shrink-0 w-24 sm:w-28 h-16 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                activeIdx === idx
                  ? 'border-teal-500 ring-2 ring-teal-500/30 scale-102'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={handlePrev}
            className="absolute left-4 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img
              src={currentImage}
              alt={placeName}
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <div className="mt-3 text-white/80 text-xs font-medium">
              {placeName} · {activeIdx + 1} / {images.length}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
