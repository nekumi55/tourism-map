'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapPin, Star, X, ExternalLink, Plus, Check } from 'lucide-react';
import { Place } from '@/types';
import { SHOW_PLACE_RATINGS } from '@/data/settings';

gsap.registerPlugin(useGSAP);

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function usePlacePopup(initialPlace: Place | null = null) {
  const [popupPlace, setPopupPlace] = useState<Place | null>(initialPlace);
  const [renderedPopupPlace, setRenderedPopupPlace] = useState<Place | null>(initialPlace);
  const popupRef = useRef<HTMLDivElement>(null);
  const closingTokenRef = useRef<number>(0);

  const openPopup = useCallback((place: Place) => {
    closingTokenRef.current += 1;
    if (popupRef.current) {
      gsap.killTweensOf(popupRef.current);
    }
    setPopupPlace(place);
    setRenderedPopupPlace(place);
  }, []);

  const closePopup = useCallback(() => {
    closingTokenRef.current += 1;
    const token = closingTokenRef.current;
    setPopupPlace(null);

    if (!popupRef.current) {
      setRenderedPopupPlace(null);
      return;
    }

    const reduceMotion = prefersReducedMotion();
    gsap.to(popupRef.current, {
      autoAlpha: 0,
      y: reduceMotion ? 8 : 16,
      scale: reduceMotion ? 0.99 : 0.97,
      duration: reduceMotion ? 0.14 : 0.16,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        if (closingTokenRef.current === token) {
          setRenderedPopupPlace(null);
        }
      },
    });
  }, []);

  return {
    popupPlace,
    renderedPopupPlace,
    popupRef,
    openPopup,
    closePopup,
  };
}

interface MapPlacePopupCardProps {
  popupRef: React.RefObject<HTMLDivElement | null>;
  place: Place | null;
  isVisible: boolean;
  categoryName?: string;
  isInItinerary: boolean;
  onAddToItinerary: (place: Place) => void;
  onClose: () => void;
}

export default function MapPlacePopupCard({
  popupRef,
  place,
  isVisible,
  categoryName,
  isInItinerary,
  onAddToItinerary,
  onClose,
}: MapPlacePopupCardProps) {
  const popupContentRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const wasOpenRef = useRef<boolean>(Boolean(place) && isVisible);
  const prevPlaceIdRef = useRef<string | null>(place?.id ?? null);

  const renderedPlaceId = place?.id ?? null;

  useGSAP(
    () => {
      if (!renderedPlaceId || !popupRef.current) {
        wasOpenRef.current = false;
        prevPlaceIdRef.current = null;
        return;
      }

      const reduceMotion = prefersReducedMotion();

      if (!isVisible) {
        if (wasOpenRef.current) {
          gsap.to(popupRef.current, {
            autoAlpha: 0,
            y: reduceMotion ? 6 : 12,
            scale: reduceMotion ? 0.99 : 0.97,
            duration: reduceMotion ? 0.12 : 0.15,
            ease: 'power2.in',
            overwrite: 'auto',
          });
        }
        wasOpenRef.current = false;
        return;
      }

      if (!wasOpenRef.current) {
        gsap.fromTo(
          popupRef.current,
          {
            autoAlpha: 0,
            y: reduceMotion ? 8 : 20,
            scale: reduceMotion ? 0.99 : 0.97,
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: reduceMotion ? 0.2 : 0.26,
            ease: reduceMotion ? 'power2.out' : 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform',
          }
        );
      } else if (prevPlaceIdRef.current !== renderedPlaceId && popupContentRef.current) {
        gsap.fromTo(
          popupContentRef.current,
          { autoAlpha: reduceMotion ? 0.35 : 0, y: reduceMotion ? 4 : 6 },
          {
            autoAlpha: 1,
            y: 0,
            duration: reduceMotion ? 0.18 : 0.2,
            ease: 'power2.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility',
          }
        );
      }

      wasOpenRef.current = true;
      prevPlaceIdRef.current = renderedPlaceId;
    },
    { scope: popupRef, dependencies: [renderedPlaceId, isVisible] }
  );

  if (!place) return null;

  const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!swipeStartRef.current || !popupRef.current || prefersReducedMotion()) return;
    const touch = e.touches[0];
    if (!touch) return;
    const dy = touch.clientY - swipeStartRef.current.y;
    const dx = Math.abs(touch.clientX - swipeStartRef.current.x);
    if (dy > 0 && dy > dx) {
      gsap.set(popupRef.current, { y: Math.min(dy * 0.65, 90) });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!swipeStartRef.current) return;
    const touch = e.changedTouches[0];
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!touch) return;

    const dy = touch.clientY - start.y;
    const dx = Math.abs(touch.clientX - start.x);
    if (dy > 52 && dy > dx) {
      onClose();
    } else if (popupRef.current && !prefersReducedMotion()) {
      gsap.to(popupRef.current, {
        y: 0,
        duration: 0.2,
        ease: 'power3.out',
        clearProps: 'transform',
      });
    }
  };

  return (
    <div
      ref={popupRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`absolute bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 sm:max-w-[calc(100%-3rem)] bg-[var(--bg-surface)] rounded-xl shadow-soft-2xl border border-[var(--border-subtle)] p-3.5 overflow-hidden z-30 will-change-transform touch-pan-x ${
        !isVisible ? 'pointer-events-none' : ''
      }`}
    >
      <div className="w-8 h-1 bg-[var(--border-strong)] rounded-full mx-auto mb-2.5 sm:hidden" />

      <div ref={popupContentRef} className="flex gap-3">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-surface-muted)]">
          <Image
            src={place.cover_image}
            alt={cleanName}
            fill
            sizes="96px"
            className="object-cover"
          />
          {SHOW_PLACE_RATINGS && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-sm bg-[#111A18]/85 text-xs text-[#F59E0B] font-semibold flex items-center gap-0.5 tabular-nums">
              <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" aria-hidden="true" />
              <span>{place.rating}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-1 mb-0.5">
              <span className="text-xs font-semibold text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-2 py-0.5 rounded-sm truncate max-w-[155px]">
                {categoryName}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="min-h-8 min-w-8 flex items-center justify-center rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors shrink-0 -mr-1 -mt-1 cursor-pointer"
                title="Đóng thẻ địa điểm"
                aria-label="Đóng thẻ địa điểm"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <h2 className="font-serif font-semibold text-[var(--ink-primary)] text-sm sm:text-base line-clamp-1">
              {cleanName}
            </h2>
            <p className="text-xs text-[var(--ink-muted)] line-clamp-1 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
              <span className="truncate">{place.address}</span>
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 mt-1.5">
            <span className="text-xs font-semibold text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-2 py-1 rounded-sm truncate min-w-0">
              {place.price_label}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onAddToItinerary(place)}
                aria-pressed={isInItinerary}
                title={isInItinerary ? 'Nhấn để bỏ khỏi lộ trình' : 'Thêm vào lộ trình'}
                aria-label={
                  isInItinerary
                    ? `Bỏ ${cleanName} khỏi lộ trình`
                    : `Thêm ${cleanName} vào lộ trình`
                }
                className={`min-h-9 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  isInItinerary
                    ? 'bg-[var(--accent-ochre-soft)] hover:bg-[#F5E4C8] text-[var(--accent-ochre-ink)]'
                    : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#16201D]'
                }`}
              >
                {isInItinerary ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>{isInItinerary ? 'Đã thêm' : 'Lộ trình'}</span>
              </button>
              <Link
                href={`/places/${place.id}`}
                className="inline-flex items-center gap-1 min-h-9 px-3 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] font-semibold text-xs transition-colors"
              >
                <span>Chi tiết</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
