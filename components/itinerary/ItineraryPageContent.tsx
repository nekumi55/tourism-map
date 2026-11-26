'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Route,
  ArrowUp,
  ArrowDown,
  Trash2,
  Navigation,
  CheckCircle2,
  Map as MapIcon,
  ChevronRight,
  ChevronDown,
  Check,
  Info,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useData } from '@/context/DataContext';
import { Place } from '@/types';
import {
  calculateDistanceKm,
  calculateTotalRouteDistance,
  buildGoogleMapsRouteUrl,
} from '@/utils/itinerary';

gsap.registerPlugin(useGSAP);

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-basalt)] text-[#A3D9CE] p-8 text-center min-h-[400px]">
      <div className="w-9 h-9 border-3 border-[#7CC4B8] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-semibold">Đang tải bản đồ lộ trình...</span>
    </div>
  ),
});

export default function ItineraryPageContent() {
  const { places } = useData();

  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>(() => {
    const initial = places.filter((p) => p.district_id === 'dist-ly-son').slice(0, 4);
    return initial.length > 0 ? initial : places.slice(0, 4);
  });

  const [activeStepPlace, setActiveStepPlace] = useState<Place | null>(selectedPlaces[0] || null);
  const [activePreset, setActivePreset] = useState<'ly-son' | 'heritage' | null>('ly-son');
  const [mobileTab, setMobileTab] = useState<'stops' | 'map'>('stops');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const [reorderTick, setReorderTick] = useState(0);
  const [presetTick, setPresetTick] = useState(0);
  const [addedTick, setAddedTick] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mobileTabPillRef = useRef<HTMLDivElement>(null);
  const stopsColRef = useRef<HTMLDivElement>(null);
  const mapColRef = useRef<HTMLDivElement>(null);
  const lySonBtnRef = useRef<HTMLButtonElement>(null);
  const heritageBtnRef = useRef<HTMLButtonElement>(null);

  const stopCardRefs = useRef(new Map<string, HTMLDivElement>());
  const stopBadgeRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingReorderTopsRef = useRef<Map<string, number> | null>(null);
  const lastMovedIdRef = useRef<string | null>(null);
  const lastAddedIdRef = useRef<string | null>(null);

  const mobilePillInitRef = useRef(false);
  const prevMobileTabRef = useRef<'stops' | 'map'>(mobileTab);
  const prevActiveStepIdRef = useRef<string | null>(activeStepPlace?.id ?? null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  useEffect(() => {
    if (!statusNotice) return;
    const timer = setTimeout(() => setStatusNotice(null), 3200);
    return () => clearTimeout(timer);
  }, [statusNotice]);

  const totalDistance = useMemo(() => calculateTotalRouteDistance(selectedPlaces), [selectedPlaces]);
  const estimatedHours = useMemo(() => {
    if (selectedPlaces.length === 0) return 0;
    const travelTime = totalDistance / 35;
    const visitingTime = selectedPlaces.length * 1.8;
    return Number((travelTime + visitingTime).toFixed(1));
  }, [selectedPlaces, totalDistance]);

  useGSAP(
    () => {
      const runIntro = (reduced: boolean) => {
        const root = containerRef.current;
        if (!root) return;

        const header = root.querySelector('[data-itinerary-header]');
        const stats = root.querySelectorAll('[data-itinerary-stat]');
        const stops = root.querySelectorAll('[data-stop-card]');
        const introTl = gsap.timeline({ defaults: { ease: reduced ? 'power2.out' : 'power3.out' } });

        if (header) {
          introTl.from(
            header,
            { y: reduced ? 6 : 12, opacity: 0, duration: reduced ? 0.24 : 0.32, clearProps: 'transform,opacity' },
            0
          );
        }
        if (stats.length > 0) {
          introTl.from(
            stats,
            {
              y: reduced ? 6 : 14,
              opacity: 0,
              duration: reduced ? 0.24 : 0.32,
              stagger: reduced ? 0.03 : 0.04,
              clearProps: 'transform,opacity',
            },
            reduced ? 0.04 : 0.06
          );
        }
        if (stops.length > 0) {
          introTl.from(
            stops,
            {
              y: reduced ? 6 : 12,
              opacity: 0,
              duration: reduced ? 0.22 : 0.3,
              stagger: reduced ? 0.03 : 0.04,
              clearProps: 'transform,opacity',
            },
            reduced ? 0.09 : 0.14
          );
        }
      };

      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => runIntro(false));
      mm.add('(prefers-reduced-motion: reduce)', () => runIntro(true));
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      const reduceMotion = prefersReducedMotion();

      if (mobileTabPillRef.current) {
        const targetX = mobileTab === 'stops' ? 0 : 100;
        if (!mobilePillInitRef.current) {
          mobilePillInitRef.current = true;
          gsap.set(mobileTabPillRef.current, { xPercent: targetX });
        } else {
          gsap.to(mobileTabPillRef.current, {
            xPercent: targetX,
            duration: reduceMotion ? 0.18 : 0.26,
            ease: reduceMotion ? 'power2.out' : 'power3.out',
            overwrite: 'auto',
          });
        }
      }

      if (prevMobileTabRef.current === mobileTab) return;
      prevMobileTabRef.current = mobileTab;

      if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
      const targetCol = mobileTab === 'stops' ? stopsColRef.current : mapColRef.current;
      if (!targetCol) return;

      if (reduceMotion) {
        gsap.fromTo(
          targetCol,
          { autoAlpha: 0.35, y: 4 },
          { autoAlpha: 1, y: 0, duration: 0.18, ease: 'power2.out', clearProps: 'transform,opacity,visibility' }
        );
      } else {
        gsap.fromTo(
          targetCol,
          { autoAlpha: 0, y: 10 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.24,
            ease: 'power2.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility',
          }
        );
      }
    },
    { scope: containerRef, dependencies: [mobileTab] }
  );

  const activeStepId = activeStepPlace?.id ?? null;

  useGSAP(
    () => {
      if (prevActiveStepIdRef.current === activeStepId) return;
      prevActiveStepIdRef.current = activeStepId;
      if (!activeStepId) return;

      const card = stopCardRefs.current.get(activeStepId);
      const badge = stopBadgeRefs.current.get(activeStepId);
      const reduceMotion = prefersReducedMotion();

      if (card) {
        card.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'nearest',
        });
      }

      if (card) {
        gsap.fromTo(
          card,
          { scale: reduceMotion ? 0.994 : 0.99 },
          {
            scale: 1,
            duration: reduceMotion ? 0.18 : 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
            clearProps: 'transform',
          }
        );
      }

      if (badge) {
        gsap.fromTo(
          badge,
          { scale: reduceMotion ? 0.94 : 0.9 },
          {
            scale: reduceMotion ? 1.03 : 1.05,
            duration: reduceMotion ? 0.18 : 0.24,
            ease: reduceMotion ? 'power2.out' : 'back.out(2)',
            overwrite: 'auto',
            clearProps: 'transform',
          }
        );
      }
    },
    { scope: containerRef, dependencies: [activeStepId] }
  );

  useGSAP(
    () => {
      if (reorderTick === 0 || !pendingReorderTopsRef.current) return;
      const oldTops = pendingReorderTopsRef.current;
      pendingReorderTopsRef.current = null;
      const movedId = lastMovedIdRef.current;
      lastMovedIdRef.current = null;

      const entries: Array<{ el: HTMLDivElement; badge?: HTMLDivElement; deltaY: number; isMoved: boolean }> = [];
      stopCardRefs.current.forEach((el, id) => {
        const oldTop = oldTops.get(id);
        if (oldTop === undefined) return;
        const newTop = el.getBoundingClientRect().top;
        entries.push({
          el,
          badge: stopBadgeRefs.current.get(id),
          deltaY: oldTop - newTop,
          isMoved: id === movedId,
        });
      });

      const reduceMotion = prefersReducedMotion();

      entries.forEach(({ el, badge, deltaY, isMoved }) => {
        if (Math.abs(deltaY) > 1) {
          gsap.fromTo(
            el,
            { y: reduceMotion ? Math.max(-24, Math.min(24, deltaY * 0.4)) : deltaY },
            {
              y: 0,
              duration: reduceMotion ? 0.2 : 0.28,
              ease: reduceMotion ? 'power2.out' : 'power3.out',
              overwrite: 'auto',
              clearProps: 'transform',
            }
          );
        }

        if (isMoved) {
          gsap.fromTo(
            el,
            { backgroundColor: '#E3F0ED' },
            {
              backgroundColor: '#FFFDF9',
              duration: reduceMotion ? 0.35 : 0.5,
              ease: 'power2.out',
              clearProps: 'backgroundColor',
            }
          );

          if (badge) {
            gsap.fromTo(
              badge,
              { scale: reduceMotion ? 1.08 : 1.15 },
              {
                scale: 1,
                duration: reduceMotion ? 0.2 : 0.28,
                ease: reduceMotion ? 'power2.out' : 'back.out(2)',
                clearProps: 'transform',
              }
            );
          }
        }
      });
    },
    { scope: containerRef, dependencies: [reorderTick] }
  );

  useGSAP(
    () => {
      if (presetTick === 0 || !stopsColRef.current) return;
      const cards = Array.from(stopsColRef.current.querySelectorAll('[data-stop-card]'));
      if (cards.length === 0) return;

      const reduceMotion = prefersReducedMotion();
      if (reduceMotion) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 6 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.025,
            ease: 'power2.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility',
          }
        );
      } else {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.24,
            stagger: 0.04,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility',
          }
        );
      }
    },
    { scope: containerRef, dependencies: [presetTick] }
  );

  useGSAP(
    () => {
      if (addedTick === 0 || !lastAddedIdRef.current) return;
      const id = lastAddedIdRef.current;
      lastAddedIdRef.current = null;
      const el = stopCardRefs.current.get(id);
      if (!el) return;

      const reduceMotion = prefersReducedMotion();
      if (reduceMotion) {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 6, backgroundColor: '#E3F0ED' },
          {
            autoAlpha: 1,
            y: 0,
            backgroundColor: '#FFFDF9',
            duration: 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility,backgroundColor',
          }
        );
      } else {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 12, backgroundColor: '#E3F0ED' },
          {
            autoAlpha: 1,
            y: 0,
            backgroundColor: '#FFFDF9',
            duration: 0.28,
            ease: 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility,backgroundColor',
          }
        );
      }
    },
    { scope: containerRef, dependencies: [addedTick] }
  );

  const handleAddPlace = (placeId: string) => {
    const found = places.find((p) => p.id === placeId);
    if (!found) return;
    const clean = found.name.replace(/\[Minh Họa\]\s*/g, '');
    if (selectedPlaces.some((p) => p.id === found.id)) {
      setStatusNotice(`"${clean}" đã có sẵn trong lộ trình.`);
      return;
    }
    lastAddedIdRef.current = found.id;
    setActivePreset(null);
    setSelectedPlaces([...selectedPlaces, found]);
    setAddedTick((t) => t + 1);
    setStatusNotice(`Đã thêm "${clean}" vào lộ trình.`);
  };

  const handleRemovePlace = (placeId: string) => {
    setActivePreset(null);
    setSelectedPlaces(selectedPlaces.filter((p) => p.id !== placeId));
  };

  const handleMove = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= selectedPlaces.length) return;

    const tops = new Map<string, number>();
    stopCardRefs.current.forEach((el, id) => {
      tops.set(id, el.getBoundingClientRect().top);
    });
    pendingReorderTopsRef.current = tops;
    lastMovedIdRef.current = selectedPlaces[idx].id;

    const next = [...selectedPlaces];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setActivePreset(null);
    setSelectedPlaces(next);
    setReorderTick((t) => t + 1);
  };

  const pulsePresetButton = contextSafe((btn: HTMLButtonElement | null) => {
    if (!btn) return;
    const reduceMotion = prefersReducedMotion();
    gsap.fromTo(
      btn,
      { scale: reduceMotion ? 0.985 : 0.97 },
      { scale: 1, duration: reduceMotion ? 0.16 : 0.22, ease: 'power2.out', clearProps: 'transform' }
    );
  });

  const handlePresetLySon = () => {
    const lySon = places.filter((p) => p.district_id === 'dist-ly-son').slice(0, 4);
    const items = lySon.length > 0 ? lySon : places.slice(0, 4);
    setActivePreset('ly-son');
    setSelectedPlaces(items);
    setActiveStepPlace(items[0] || null);
    setPresetTick((t) => t + 1);
    pulsePresetButton(lySonBtnRef.current);
  };

  const handlePresetHeritage = () => {
    const heritage = places
      .filter((p) => p.district_id === 'dist-tp-quang-ngai' || p.district_id === 'dist-kon-tum')
      .slice(0, 4);
    const items = heritage.length > 0 ? heritage : places.slice(0, 4);
    setActivePreset('heritage');
    setSelectedPlaces(items);
    setActiveStepPlace(items[0] || null);
    setPresetTick((t) => t + 1);
    pulsePresetButton(heritageBtnRef.current);
  };

  return (
    <div
      ref={containerRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8"
    >
      {/* Header Banner */}
      <div data-itinerary-header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink-primary)] tracking-[-0.02em]">
            Lập Lộ Trình Tour Quảng Ngãi
          </h1>
          <p className="text-sm sm:text-base text-[var(--ink-secondary)] mt-1.5">
            Chọn thứ tự điểm đến để tự động tính cự ly, thời gian di chuyển và mở chỉ đường trên bản đồ
          </p>
        </div>

        {/* Preset Tour Selector */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            ref={lySonBtnRef}
            type="button"
            onClick={handlePresetLySon}
            aria-pressed={activePreset === 'ly-son'}
            className={`ui-interactive-press flex-1 sm:flex-none text-center px-4 min-h-11 rounded-lg text-xs sm:text-sm font-semibold border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              activePreset === 'ly-son'
                ? 'bg-[var(--accent-jade)] text-[#FFFDF9] border-[var(--accent-jade)]'
                : 'bg-[var(--bg-surface)] hover:bg-[var(--accent-jade-soft)] text-[var(--ink-primary)] border-[var(--border-subtle)]'
            }`}
          >
            {activePreset === 'ly-son' && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
            <span>Tour Đảo Lý Sơn</span>
          </button>
          <button
            ref={heritageBtnRef}
            type="button"
            onClick={handlePresetHeritage}
            aria-pressed={activePreset === 'heritage'}
            className={`ui-interactive-press flex-1 sm:flex-none text-center px-4 min-h-11 rounded-lg text-xs sm:text-sm font-semibold border inline-flex items-center justify-center gap-1.5 cursor-pointer ${
              activePreset === 'heritage'
                ? 'bg-[#F59E0B] text-[#16201D] border-[#D97706]'
                : 'bg-[var(--bg-surface)] hover:bg-[var(--accent-ochre-soft)] text-[var(--ink-primary)] border-[var(--border-subtle)]'
            }`}
          >
            {activePreset === 'heritage' && <Check className="w-4 h-4 shrink-0" aria-hidden="true" />}
            <span>Tour Sông Trà &amp; Di Sản</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div data-itinerary-stat className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1 min-w-0">
          <div className="text-xs font-semibold text-[var(--ink-muted)] truncate">
            Số điểm dừng
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--accent-jade)] tabular-nums">
            {selectedPlaces.length}{' '}
            <span className="font-sans text-xs sm:text-sm font-medium text-[var(--ink-muted)]">
              địa điểm
            </span>
          </div>
        </div>

        <div data-itinerary-stat className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1 min-w-0">
          <div className="text-xs font-semibold text-[var(--ink-muted)] truncate">
            Tổng quãng đường
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tabular-nums">
            ~ {totalDistance}{' '}
            <span className="font-sans text-xs sm:text-sm font-medium text-[var(--ink-muted)]">km</span>
          </div>
        </div>

        <div data-itinerary-stat className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1 min-w-0">
          <div className="text-xs font-semibold text-[var(--ink-muted)] truncate">
            Thời gian dự kiến
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--accent-ochre)] tabular-nums">
            ~ {estimatedHours}{' '}
            <span className="font-sans text-xs sm:text-sm font-medium text-[var(--ink-muted)]">giờ</span>
          </div>
        </div>

        <div data-itinerary-stat className="p-4 sm:p-5 rounded-xl bg-[var(--accent-jade)] text-[#FFFDF9] flex flex-col justify-between min-w-0">
          <div className="text-xs font-medium text-[#D6EDE8] truncate">
            Dẫn đường thực địa
          </div>
          <a
            href={buildGoogleMapsRouteUrl(selectedPlaces)}
            target="_blank"
            rel="noreferrer"
            className="ui-interactive-press mt-2 min-h-11 px-3 rounded-lg bg-[#FFFDF9] hover:bg-[#F7F4EE] text-[var(--accent-jade-ink)] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <Navigation className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="truncate">Chỉ đường</span>
          </a>
        </div>
      </div>

      {/* Mobile Tab Switcher (Fixed sticky top offset for md navbar) */}
      <div className="lg:hidden sticky top-16 md:top-20 z-30 bg-[var(--bg-canvas)]/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-[var(--border-subtle)]">
        <div className="relative grid grid-cols-2 p-1 bg-[var(--bg-surface-muted)] rounded-xl border border-[var(--border-subtle)]">
          <div aria-hidden="true" className="absolute inset-1 pointer-events-none">
            <div
              ref={mobileTabPillRef}
              className="w-1/2 h-full rounded-lg bg-[var(--bg-surface)] shadow-soft-sm will-change-transform"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileTab('stops')}
            className={`relative z-10 min-w-0 min-h-11 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              mobileTab === 'stops'
                ? 'text-[var(--accent-jade-ink)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <Route className="w-4 h-4 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
            <span className="truncate">Lộ trình ({selectedPlaces.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`relative z-10 min-w-0 min-h-11 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              mobileTab === 'map'
                ? 'text-[var(--accent-jade-ink)]'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
            }`}
          >
            <MapIcon className="w-4 h-4 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
            <span className="truncate">Bản đồ chỉ dẫn</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Stops */}
        <div
          ref={stopsColRef}
          className={`lg:col-span-5 min-w-0 space-y-5 ${
            mobileTab === 'stops' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Add Stop Selector */}
          <div className="p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] space-y-2.5">
            <label
              htmlFor="itinerary-add-stop"
              className="block text-xs font-semibold text-[var(--ink-secondary)]"
            >
              Thêm điểm dừng vào lộ trình
            </label>
            <div className="relative w-full min-w-0">
              <select
                id="itinerary-add-stop"
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddPlace(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="w-full min-h-11 min-w-0 max-w-full px-3.5 py-2 pr-9 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-jade)] appearance-none truncate cursor-pointer transition-colors"
              >
                <option value="" disabled>
                  Chọn địa điểm từ danh sách...
                </option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name.replace(/\[Minh Họa\]\s*/g, '')}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="w-4 h-4 text-[var(--ink-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>

            {statusNotice && (
              <div
                role="status"
                aria-live="polite"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent-jade-soft)] text-[var(--accent-jade-ink)] text-xs font-medium"
              >
                <Info className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{statusNotice}</span>
              </div>
            )}
          </div>

          {/* Sequential Stops */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif font-semibold text-[var(--ink-primary)] text-xl truncate min-w-0">
                Lộ Trình Từng Chặng ({selectedPlaces.length})
              </h2>
              {selectedPlaces.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActivePreset(null);
                    setSelectedPlaces([]);
                  }}
                  className="min-h-10 px-2.5 text-xs font-semibold text-[#9A3412] hover:underline shrink-0 cursor-pointer"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {selectedPlaces.length === 0 ? (
              <div className="p-8 text-center bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] text-[var(--ink-muted)] text-sm space-y-2">
                <Route className="w-8 h-8 mx-auto text-[var(--border-strong)]" aria-hidden="true" />
                <p className="font-semibold text-[var(--ink-primary)]">Chưa có điểm dừng nào</p>
                <p className="text-xs">Hãy chọn địa điểm ở ô trên hoặc chọn một tour gợi ý sẵn.</p>
              </div>
            ) : (
              selectedPlaces.map((place, idx) => {
                const isActiveStep = activeStepPlace?.id === place.id;
                const nextPlace = selectedPlaces[idx + 1];
                const legDistance = nextPlace
                  ? calculateDistanceKm(
                      place.latitude,
                      place.longitude,
                      nextPlace.latitude,
                      nextPlace.longitude
                    )
                  : null;
                const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');

                return (
                  <div key={place.id} className="space-y-2">
                    <div
                      ref={(el) => {
                        if (el) stopCardRefs.current.set(place.id, el);
                        else stopCardRefs.current.delete(place.id);
                      }}
                      data-stop-card
                      onClick={() => setActiveStepPlace(place)}
                      className={`group p-3.5 sm:p-4 bg-[var(--bg-surface)] rounded-xl border transition-[border-color,box-shadow,background-color] duration-200 cursor-pointer ${
                        isActiveStep
                          ? 'border-[var(--accent-jade)] ring-2 ring-[var(--accent-jade)]/15 shadow-soft-sm'
                          : 'border-[var(--border-subtle)] hover:border-[var(--accent-jade)]/45 hover:shadow-soft-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            ref={(el) => {
                              if (el) stopBadgeRefs.current.set(place.id, el);
                              else stopBadgeRefs.current.delete(place.id);
                            }}
                            className={`w-8 h-8 rounded-lg font-mono font-semibold text-xs sm:text-sm flex items-center justify-center shrink-0 tabular-nums transition-colors ${
                              isActiveStep
                                ? 'bg-[var(--accent-jade)] text-[#FFFDF9]'
                                : 'bg-[#F59E0B] text-[#16201D]'
                            }`}
                          >
                            {idx + 1}
                          </div>

                          <div className="relative w-13 h-13 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-surface-muted)]">
                            <Image
                              src={place.cover_image}
                              alt={cleanName}
                              fill
                              sizes="56px"
                              className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3
                              className={`font-semibold text-sm truncate transition-colors duration-150 group-hover:text-[var(--accent-jade)] ${
                                isActiveStep ? 'text-[var(--accent-jade-ink)]' : 'text-[var(--ink-primary)]'
                              }`}
                            >
                              {cleanName}
                            </h3>
                            <p className="text-xs text-[var(--ink-muted)] truncate mt-0.5">
                              {place.address}
                            </p>
                            <span className="inline-block mt-1 text-xs font-medium text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-2 py-0.5 rounded-sm truncate max-w-full">
                              {place.price_label}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Controls */}
                        <div className="hidden sm:flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(idx, 'up');
                            }}
                            disabled={idx === 0}
                            className="w-9 h-9 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] disabled:opacity-25 flex items-center justify-center cursor-pointer"
                            title="Di chuyển lên trước"
                            aria-label={`Chuyển ${cleanName} lên trước`}
                          >
                            <ArrowUp className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(idx, 'down');
                            }}
                            disabled={idx === selectedPlaces.length - 1}
                            className="w-9 h-9 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] disabled:opacity-25 flex items-center justify-center cursor-pointer"
                            title="Di chuyển xuống sau"
                            aria-label={`Chuyển ${cleanName} xuống sau`}
                          >
                            <ArrowDown className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-9 h-9 rounded-lg text-[var(--accent-jade)] hover:bg-[var(--accent-jade-soft)] flex items-center justify-center"
                            title="Chỉ đường Google Maps"
                            aria-label={`Chỉ đường Google Maps đến ${cleanName}`}
                          >
                            <Navigation className="w-4 h-4" aria-hidden="true" />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePlace(place.id);
                            }}
                            className="w-9 h-9 rounded-lg text-[#9A3412] hover:bg-[#F6EAE6] flex items-center justify-center cursor-pointer"
                            title="Xóa điểm này"
                            aria-label={`Xóa ${cleanName} khỏi lộ trình`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile Controls (44px tap targets) */}
                      <div
                        className="sm:hidden grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-[var(--border-subtle)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="min-h-11 rounded-lg bg-[var(--bg-surface-muted)] text-[var(--ink-primary)] disabled:opacity-30 flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                          aria-label={`Chuyển ${cleanName} lên`}
                        >
                          <ArrowUp className="w-4 h-4" aria-hidden="true" />
                          <span>Lên</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === selectedPlaces.length - 1}
                          className="min-h-11 rounded-lg bg-[var(--bg-surface-muted)] text-[var(--ink-primary)] disabled:opacity-30 flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                          aria-label={`Chuyển ${cleanName} xuống`}
                        >
                          <ArrowDown className="w-4 h-4" aria-hidden="true" />
                          <span>Xuống</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-11 rounded-lg bg-[var(--accent-jade-soft)] text-[var(--accent-jade-ink)] flex items-center justify-center gap-1 text-xs font-semibold"
                          aria-label={`Chỉ đường đến ${cleanName}`}
                        >
                          <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>GPS</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleRemovePlace(place.id)}
                          className="min-h-11 rounded-lg bg-[#F6EAE6] text-[#9A3412] flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                          aria-label={`Xóa ${cleanName}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>

                    {/* Leg distance info */}
                    {legDistance !== null && (
                      <div className="flex items-center gap-2 pl-4 sm:pl-7 py-0.5 text-xs font-medium text-[var(--accent-jade-ink)] tabular-nums">
                        <div className="w-0.5 h-5 bg-[var(--accent-jade)]/40 shrink-0" aria-hidden="true" />
                        <span className="font-mono bg-[var(--accent-jade-soft)] px-2.5 py-1 rounded-md text-xs">
                          Chặng {idx + 1} → {idx + 2}: ~ {legDistance} km (~
                          {Math.round((legDistance / 35) * 60)} phút)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Route Map */}
        <div
          ref={mapColRef}
          className={`lg:col-span-7 min-w-0 lg:sticky lg:top-24 space-y-4 ${
            mobileTab === 'map' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-[var(--ink-primary)] text-sm min-w-0">
              <MapIcon className="w-4 h-4 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
              <span className="truncate">Bản Đồ Lộ Trình Trực Quan</span>
            </div>
            <Link
              href="/map"
              className="group text-xs font-semibold text-[var(--accent-jade)] hover:text-[var(--accent-jade-hover)] hover:underline flex items-center gap-1 shrink-0 min-h-9 transition-colors"
            >
              <span>Mở bản đồ lớn</span>
              <ChevronRight className="w-3.5 h-3.5 motion-safe:group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none" aria-hidden="true" />
            </Link>
          </div>

          <div className="relative w-full h-[380px] sm:h-[440px] lg:h-auto lg:aspect-16/11 lg:min-h-[460px] rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-basalt)]">
            <LeafletMap
              places={places}
              selectedPlace={activeStepPlace}
              onSelectPlace={(p) => setActiveStepPlace(p)}
              itineraryPlaces={selectedPlaces}
              mapLayer="standard"
            />
          </div>

          <div className="p-4 rounded-xl bg-[var(--accent-jade-soft)] border border-[var(--accent-jade)]/20 text-xs sm:text-sm text-[var(--ink-primary)] flex items-start gap-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="leading-relaxed">
              <strong>Hướng dẫn:</strong> Tuyến đường nối các điểm dừng theo thứ tự (1, 2, 3...). Bấm{' '}
              <strong>Mở Google Maps</strong> ở trên hoặc nút <strong>GPS</strong> tại từng chặng để dẫn đường trực tiếp.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
