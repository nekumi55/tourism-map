'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

interface PlaceGalleryProps {
  images: string[];
  placeName: string;
}

const HIDDEN_SLIDE_STYLE: React.CSSProperties = {
  opacity: 0,
  visibility: 'hidden',
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function PlaceGallery({ images, placeName }: PlaceGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isLightboxMounted, setIsLightboxMounted] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const mainFrameRef = useRef<HTMLDivElement>(null);
  const mainSlideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLDivElement>(null);
  const prevMainIdxRef = useRef(0);

  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);
  const thumbRingRef = useRef<HTMLSpanElement>(null);
  const thumbBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isFirstThumbSyncRef = useRef(true);

  const expandBtnRef = useRef<HTMLButtonElement>(null);
  const lightboxOverlayRef = useRef<HTMLDivElement>(null);
  const lightboxStageRef = useRef<HTMLDivElement>(null);
  const lightboxImageFrameRef = useRef<HTMLDivElement>(null);
  const slideDirectionRef = useRef<1 | -1>(1);
  const lightboxPrevIdxRef = useRef<number | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);

  const safeActiveIdx = images.length > 0 ? Math.min(activeIdx, images.length - 1) : 0;
  const currentImage = images[safeActiveIdx] || images[0] || '';

  const selectIndex = useCallback(
    (nextIdx: number, directionHint?: 1 | -1) => {
      if (images.length === 0) return;
      slideDirectionRef.current =
        directionHint ?? (nextIdx >= safeActiveIdx ? 1 : -1);
      setActiveIdx(nextIdx);
    },
    [images.length, safeActiveIdx]
  );

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    slideDirectionRef.current = -1;
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    slideDirectionRef.current = 1;
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const openLightbox = useCallback(() => {
    setIsLightboxMounted(true);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const handleGalleryTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleGalleryTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!swipeStartRef.current || images.length <= 1) return;
      const touch = e.changedTouches[0];
      const start = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!touch) return;

      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) handleNext();
        else handlePrev();
      }
    },
    [images.length, handleNext, handlePrev]
  );

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, closeLightbox, handlePrev, handleNext]);

  useGSAP(
    () => {
      const prevIdx = prevMainIdxRef.current;
      if (prevIdx === safeActiveIdx) return;
      prevMainIdxRef.current = safeActiveIdx;

      const prevEl = mainSlideRefs.current[prevIdx];
      const nextEl = mainSlideRefs.current[safeActiveIdx];
      if (!nextEl) return;

      const reduceMotion = prefersReducedMotion();

      mainSlideRefs.current.forEach((el, idx) => {
        if (!el) return;
        gsap.killTweensOf(el);
        if (idx !== prevIdx && idx !== safeActiveIdx) {
          gsap.set(el, { autoAlpha: 0, zIndex: 0 });
        }
      });

      if (prevEl) {
        gsap.set(prevEl, { autoAlpha: 1, zIndex: 1 });
      }
      gsap.set(nextEl, { zIndex: 2 });

      const dir = slideDirectionRef.current;

      gsap.fromTo(
        nextEl,
        {
          autoAlpha: 0,
          x: reduceMotion ? 0 : dir * 24,
          scale: reduceMotion ? 1 : 1.02,
        },
        {
          autoAlpha: 1,
          x: 0,
          scale: 1,
          duration: reduceMotion ? 0.12 : 0.4,
          ease: 'power3.out',
          clearProps: 'transform',
          onComplete: () => {
            if (prevEl && prevEl !== nextEl) {
              gsap.set(prevEl, { autoAlpha: 0, zIndex: 0 });
            }
          },
        }
      );
    },
    { scope: mainFrameRef, dependencies: [safeActiveIdx] }
  );

  const syncThumbRing = useCallback(
    (instant: boolean) => {
      const ring = thumbRingRef.current;
      const firstBtn = thumbBtnRefs.current[0];
      const targetBtn = thumbBtnRefs.current[safeActiveIdx];
      if (!ring || !firstBtn || !targetBtn) return;

      const targetX = targetBtn.offsetLeft - firstBtn.offsetLeft;
      const reduceMotion = prefersReducedMotion();

      if (instant || reduceMotion) {
        gsap.set(ring, { x: targetX });
        return;
      }

      gsap.to(ring, {
        x: targetX,
        duration: 0.28,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    },
    [safeActiveIdx]
  );

  useGSAP(
    () => {
      if (images.length <= 1) return;

      if (isFirstThumbSyncRef.current) {
        syncThumbRing(true);
        isFirstThumbSyncRef.current = false;
        return;
      }

      syncThumbRing(false);
      const targetBtn = thumbBtnRefs.current[safeActiveIdx];
      if (targetBtn) {
        targetBtn.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    },
    { scope: thumbStripRef, dependencies: [safeActiveIdx, images.length, syncThumbRing] }
  );

  useEffect(() => {
    const strip = thumbStripRef.current;
    if (!strip || images.length <= 1) return;

    const handleResize = () => syncThumbRing(true);
    const observer = new ResizeObserver(handleResize);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [images.length, syncThumbRing]);

  useGSAP(
    () => {
      if (!isLightboxMounted) {
        lightboxPrevIdxRef.current = null;
        return;
      }

      const overlay = lightboxOverlayRef.current;
      const stage = lightboxStageRef.current;
      if (!overlay || !stage) return;

      const controls = Array.from(overlay.querySelectorAll('[data-lightbox-control]'));
      const reduceMotion = prefersReducedMotion();

      gsap.killTweensOf([overlay, stage, ...controls]);

      if (isLightboxOpen) {
        lightboxPrevIdxRef.current = safeActiveIdx;

        const enterTl = gsap.timeline();
        enterTl.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, duration: reduceMotion ? 0.08 : 0.22, ease: 'power2.out' },
          0
        );
        enterTl.fromTo(
          stage,
          { opacity: 0, scale: reduceMotion ? 1 : 0.95, y: reduceMotion ? 0 : 10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: reduceMotion ? 0.08 : 0.3,
            ease: 'expo.out',
            clearProps: 'transform',
          },
          0
        );
      } else {
        const exitTl = gsap.timeline({
          onComplete: () => {
            setIsLightboxMounted(false);
            expandBtnRef.current?.focus({ preventScroll: true });
          },
        });

        exitTl.to(
          stage,
          {
            opacity: 0,
            scale: reduceMotion ? 1 : 0.96,
            duration: reduceMotion ? 0.06 : 0.18,
            ease: 'power2.in',
          },
          0
        );

        exitTl.to(
          overlay,
          { opacity: 0, duration: reduceMotion ? 0.06 : 0.2, ease: 'power2.in' },
          '<0.03'
        );
      }
    },
    { scope: rootRef, dependencies: [isLightboxOpen, isLightboxMounted] }
  );

  useGSAP(
    () => {
      if (!isLightboxMounted || !isLightboxOpen) return;
      if (lightboxPrevIdxRef.current === null || lightboxPrevIdxRef.current === safeActiveIdx) {
        lightboxPrevIdxRef.current = safeActiveIdx;
        return;
      }
      lightboxPrevIdxRef.current = safeActiveIdx;

      const frame = lightboxImageFrameRef.current;
      if (!frame) return;

      const dir = slideDirectionRef.current;
      const reduceMotion = prefersReducedMotion();

      gsap.killTweensOf(frame);
      if (reduceMotion) {
        gsap.fromTo(frame, { opacity: 0.5 }, { opacity: 1, duration: 0.12, clearProps: 'opacity' });
      } else {
        gsap.fromTo(
          frame,
          { opacity: 0, x: dir * 32 },
          { opacity: 1, x: 0, duration: 0.28, ease: 'power3.out', clearProps: 'transform,opacity' }
        );
      }
    },
    { scope: rootRef, dependencies: [safeActiveIdx, isLightboxOpen, isLightboxMounted] }
  );

  if (images.length === 0) {
    return null;
  }

  return (
    <div ref={rootRef} className="space-y-3">
      {/* Main Image Frame */}
      <div
        ref={mainFrameRef}
        onTouchStart={handleGalleryTouchStart}
        onTouchEnd={handleGalleryTouchEnd}
        className="relative aspect-16/9 sm:aspect-21/9 rounded-xl overflow-hidden bg-[var(--bg-basalt)] border border-[var(--border-subtle)] group touch-pan-y"
      >
        {images.map((img, idx) => (
          <div
            key={`${img}-${idx}`}
            ref={(el) => {
              mainSlideRefs.current[idx] = el;
            }}
            aria-hidden={idx !== safeActiveIdx}
            style={idx === 0 ? undefined : HIDDEN_SLIDE_STYLE}
            className={`absolute inset-0 ${idx === safeActiveIdx ? 'z-1' : 'z-0 pointer-events-none'}`}
          >
            <Image
              src={img}
              alt={`${placeName} - Ảnh ${idx + 1}`}
              fill
              priority={idx === 0}
              sizes="(max-width: 1024px) 100vw, 1200px"
              className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-102"
            />
          </div>
        ))}

        <div className="absolute inset-0 z-3 bg-gradient-to-t from-[#111A18]/60 via-transparent to-transparent pointer-events-none" />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Xem ảnh trước"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-4 min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-[#111A18]/75 hover:bg-[#111A18] text-[#FFFDF9] backdrop-blur-sm opacity-95 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Xem ảnh tiếp theo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-4 min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-[#111A18]/75 hover:bg-[#111A18] text-[#FFFDF9] backdrop-blur-sm opacity-95 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}

        <button
          ref={expandBtnRef}
          type="button"
          onClick={openLightbox}
          className="ui-interactive-press absolute bottom-4 right-4 z-4 min-h-11 px-4 rounded-lg bg-[#111A18]/85 hover:bg-[#111A18] text-[#FFFDF9] text-xs font-semibold backdrop-blur-md flex items-center gap-2 cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Phóng to ảnh ({images.length})</span>
        </button>

        <div
          ref={counterRef}
          className="absolute top-4 right-4 z-4 px-3 py-1 rounded-md bg-[#111A18]/80 text-[#FFFDF9] font-mono text-xs font-medium tabular-nums"
        >
          {safeActiveIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div ref={thumbScrollRef} className="overflow-x-auto pb-2 pt-1 px-1 scrollbar-none">
          <div ref={thumbStripRef} className="relative inline-flex items-center gap-3">
            <span
              ref={thumbRingRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 w-24 sm:w-28 h-16 sm:h-20 rounded-lg border-2 border-[var(--accent-jade)] ring-2 ring-[var(--accent-jade)]/25 z-10"
            />
            {images.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                ref={(el) => {
                  thumbBtnRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => selectIndex(idx)}
                aria-label={`Chọn ảnh ${idx + 1}`}
                aria-pressed={safeActiveIdx === idx}
                className={`relative shrink-0 w-24 sm:w-28 h-16 sm:h-20 rounded-lg overflow-hidden transition-opacity duration-200 cursor-pointer ${
                  safeActiveIdx === idx
                    ? 'opacity-100'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={img}
                  alt={`Ảnh thu nhỏ ${idx + 1} của ${placeName}`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {isLightboxMounted && (
        <div
          ref={lightboxOverlayRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`Thư viện ảnh ${placeName}`}
          className={`fixed inset-0 z-50 bg-[#111A18]/95 backdrop-blur-md flex items-center justify-center p-4 ${
            isLightboxOpen ? '' : 'pointer-events-none'
          }`}
        >
          <button
            type="button"
            data-lightbox-control
            onClick={closeLightbox}
            aria-label="Đóng thư viện ảnh"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 min-h-12 min-w-12 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-[#FFFDF9] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              data-lightbox-control
              onClick={handlePrev}
              aria-label="Ảnh trước"
              className="absolute left-3 sm:left-8 z-10 min-h-12 min-w-12 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-[#FFFDF9] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </button>
          )}

          <div
            ref={lightboxStageRef}
            onTouchStart={handleGalleryTouchStart}
            onTouchEnd={handleGalleryTouchEnd}
            className="max-w-5xl w-full max-h-[85vh] flex flex-col items-center pointer-events-none"
          >
            <div
              ref={lightboxImageFrameRef}
              className="relative w-full max-w-4xl h-[70vh] pointer-events-auto"
            >
              <Image
                src={currentImage}
                alt={`${placeName} - Ảnh ${safeActiveIdx + 1}`}
                fill
                priority
                sizes="100vw"
                className="object-contain rounded-lg"
              />
            </div>
            <div className="mt-3 text-[#E5E0D5] text-xs font-medium text-center px-4 truncate max-w-full tabular-nums">
              {placeName} · {safeActiveIdx + 1} / {images.length}
            </div>
          </div>

          {images.length > 1 && (
            <button
              type="button"
              data-lightbox-control
              onClick={handleNext}
              aria-label="Ảnh tiếp theo"
              className="absolute right-3 sm:right-8 z-10 min-h-12 min-w-12 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-[#FFFDF9] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
