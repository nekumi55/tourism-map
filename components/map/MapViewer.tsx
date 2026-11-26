'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Search,
  Maximize2,
  Minimize2,
  MapPin,
  Star,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Compass,
  Route,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Map as MapIcon,
  Mountain,
  Globe,
  Check,
  Info,
  Sparkles,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Place, Category } from '@/types';
import { useData } from '@/context/DataContext';
import { SHOW_PLACE_RATINGS } from '@/data/settings';
import MapPlacePopupCard, { usePlacePopup } from '@/components/map/MapPlacePopupCard';
import MapMarkersToggleButton from '@/components/map/MapMarkersToggleButton';
import {
  calculateDistanceKm,
  calculateTotalRouteDistance,
  buildGoogleMapsRouteUrl,
  optimizeItineraryOrder,
  formatOptimizeNotice,
} from '@/utils/itinerary';
import { matchSearchKeyword } from '@/utils/vietnamese';

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
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-basalt)] text-[#A3D9CE] p-8 text-center min-h-[450px]">
      <div className="w-9 h-9 border-3 border-[#7CC4B8] border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-semibold">Đang tải bản đồ số Quảng Ngãi...</span>
    </div>
  ),
});

const LAYER_OPTIONS = [
  { id: 'standard' as const, label: 'Đường bộ', icon: MapIcon },
  { id: 'terrain' as const, label: 'Địa hình đồi núi', icon: Mountain },
  { id: 'satellite' as const, label: 'Vệ tinh & Địa danh', icon: Globe },
];

type MapLayerType = 'standard' | 'satellite' | 'terrain';

interface MapLayersControlProps {
  mapLayer: MapLayerType;
  onSelectLayer: (layer: MapLayerType) => void;
  variant: 'mobile' | 'desktop';
}

function MapLayersControl({ mapLayer, onSelectLayer, variant }: MapLayersControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<SVGSVGElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const closeTokenRef = useRef(0);

  const { contextSafe } = useGSAP({ scope: wrapperRef });

  const closePopover = useCallback(() => {
    closeTokenRef.current += 1;
    const token = closeTokenRef.current;
    setIsOpen(false);

    if (!popoverRef.current) {
      setIsMounted(false);
      return;
    }

    const reduceMotion = prefersReducedMotion();
    contextSafe(() => {
      if (!popoverRef.current) {
        setIsMounted(false);
        return;
      }
      gsap.to(popoverRef.current, {
        autoAlpha: 0,
        y: reduceMotion ? -3 : -6,
        scale: reduceMotion ? 0.985 : 0.95,
        duration: reduceMotion ? 0.12 : 0.14,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          if (closeTokenRef.current === token) {
            setIsMounted(false);
          }
        },
      });
    })();
  }, [contextSafe]);

  const togglePopover = () => {
    if (isOpen) {
      closePopover();
    } else {
      closeTokenRef.current += 1;
      setIsMounted(true);
      setIsOpen(true);
    }
  };

  useGSAP(
    () => {
      if (!isMounted || !isOpen || !popoverRef.current) return;
      const reduceMotion = prefersReducedMotion();

      gsap.fromTo(
        popoverRef.current,
        {
          autoAlpha: 0,
          y: reduceMotion ? -4 : -8,
          scale: reduceMotion ? 0.98 : 0.94,
          transformOrigin: 'top right',
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: reduceMotion ? 0.18 : 0.22,
          ease: reduceMotion ? 'power2.out' : 'power3.out',
          overwrite: 'auto',
        }
      );

      const options = popoverRef.current.querySelectorAll('[data-layer-option]');
      if (options.length > 0) {
        gsap.fromTo(
          options,
          { autoAlpha: 0, x: reduceMotion ? -3 : -6 },
          {
            autoAlpha: 1,
            x: 0,
            duration: reduceMotion ? 0.14 : 0.18,
            stagger: reduceMotion ? 0.02 : 0.03,
            ease: 'power2.out',
            clearProps: 'transform,opacity,visibility',
          }
        );
      }
    },
    { scope: wrapperRef, dependencies: [isMounted, isOpen] }
  );

  useGSAP(
    () => {
      const reduceMotion = prefersReducedMotion();
      if (chevronRef.current) {
        gsap.to(chevronRef.current, {
          rotation: isOpen ? 180 : 0,
          duration: reduceMotion ? 0.16 : 0.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
      if (iconRef.current) {
        gsap.to(iconRef.current, {
          scale: isOpen ? (reduceMotion ? 1.04 : 1.06) : 1,
          duration: reduceMotion ? 0.14 : 0.18,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    },
    { scope: wrapperRef, dependencies: [isOpen] }
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        closePopover();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopover();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closePopover]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={togglePopover}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={
          variant === 'mobile'
            ? `min-h-11 min-w-10 px-2.5 rounded-xl shadow-soft-xl border transition-colors duration-200 flex items-center justify-center cursor-pointer ${
                isOpen
                  ? 'bg-[var(--accent-jade)] text-[#FFFDF9] border-[var(--accent-jade)]'
                  : 'bg-[var(--bg-surface)]/95 text-[var(--ink-primary)] hover:text-[var(--accent-jade)] border-[var(--border-subtle)]'
              }`
            : `min-h-11 px-3.5 rounded-xl shadow-soft-xl border text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 cursor-pointer ${
                isOpen
                  ? 'bg-[var(--accent-jade)] text-[#FFFDF9] border-[var(--accent-jade)]'
                  : 'bg-[var(--bg-surface)]/95 text-[var(--ink-primary)] hover:text-[var(--accent-jade)] hover:bg-[var(--bg-surface)] border-[var(--border-subtle)]'
              }`
        }
        title={variant === 'mobile' ? 'Đổi lớp bản đồ' : 'Đổi lớp hiển thị bản đồ'}
        aria-label="Đổi lớp bản đồ"
      >
        <Layers
          ref={iconRef}
          aria-hidden="true"
          className={`w-4 h-4 shrink-0 ${
            variant === 'desktop' ? (isOpen ? 'text-[#FFFDF9]' : 'text-[var(--accent-jade)]') : ''
          }`}
        />
        {variant === 'desktop' && (
          <>
            <span>
              {mapLayer === 'standard'
                ? 'Đường bộ'
                : mapLayer === 'terrain'
                ? 'Địa hình'
                : 'Vệ tinh'}
            </span>
            <ChevronDown
              ref={chevronRef}
              aria-hidden="true"
              className="w-3.5 h-3.5 opacity-85 shrink-0"
            />
          </>
        )}
      </button>

      {isMounted && (
        <div
          ref={popoverRef}
          role="menu"
          className="absolute top-full right-0 mt-2 w-56 bg-[var(--bg-surface)] rounded-xl shadow-soft-2xl border border-[var(--border-subtle)] p-1.5 flex flex-col gap-1 text-xs font-semibold text-[var(--ink-primary)] z-50 will-change-transform"
        >
          <div className="px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-muted)]">
            Lớp bản đồ
          </div>
          {LAYER_OPTIONS.map((opt) => {
            const isActive = mapLayer === opt.id;
            const LayerIcon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                data-layer-option
                onClick={() => {
                  onSelectLayer(opt.id);
                  closePopover();
                }}
                className={`min-h-10 px-3 py-2 rounded-lg text-left transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-jade-soft)] text-[var(--accent-jade-ink)] font-semibold'
                    : 'hover:bg-[var(--bg-surface-muted)] text-[var(--ink-primary)]'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <LayerIcon className="w-4 h-4 shrink-0 text-[var(--accent-jade)]" aria-hidden="true" />
                  <span className="truncate">{opt.label}</span>
                </span>
                {isActive && <Check className="w-3.5 h-3.5 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function MapViewer() {
  const searchParams = useSearchParams();
  const initialPlaceId = searchParams.get('placeId');
  const { places, categories } = useData();

  const [mobileTab, setMobileTab] = useState<'map' | 'places' | 'itinerary'>('map');
  const [isMobileOverlayVisible, setIsMobileOverlayVisible] = useState<boolean>(false);

  const [sidebarMode, setSidebarMode] = useState<'places' | 'itinerary'>('places');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const mappedPlaces = useMemo(
    () => places.filter((p) => p.has_coordinates !== false),
    [places]
  );

  const initialPlace = useMemo(() => {
    if (initialPlaceId) {
      return mappedPlaces.find((p) => p.id === initialPlaceId) || null;
    }
    return null;
  }, [initialPlaceId, mappedPlaces]);

  const {
    popupPlace: selectedPlace,
    renderedPopupPlace,
    popupRef,
    openPopup,
    closePopup: closePlacePopup,
  } = usePlacePopup(initialPlace);

  const [mapLayer, setMapLayer] = useState<MapLayerType>('standard');
  const [showMarkers, setShowMarkers] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [itinerary, setItinerary] = useState<Place[]>(() => {
    const lySonPlaces = mappedPlaces.filter((p) => p.district_id === 'dist-ly-son').slice(0, 3);
    return lySonPlaces.length > 0 ? lySonPlaces : mappedPlaces.slice(0, 3);
  });
  const [itineraryReorderTick, setItineraryReorderTick] = useState<number>(0);

  const shellRef = useRef<HTMLDivElement>(null);
  const mobileTabPillRef = useRef<HTMLDivElement>(null);
  const desktopTabPillRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const reopenBtnRef = useRef<HTMLButtonElement>(null);
  const tabPanelRef = useRef<HTMLDivElement>(null);
  const chipsContainerRef = useRef<HTMLDivElement>(null);
  const placesListRef = useRef<HTMLDivElement>(null);

  const chipRefs = useRef(new Map<string, HTMLButtonElement>());
  const placeCardRefs = useRef(new Map<string, HTMLDivElement>());
  const itineraryCardRefs = useRef(new Map<string, HTMLDivElement>());
  const pendingReorderTopsRef = useRef<Map<string, number> | null>(null);
  const lastMovedItineraryIdRef = useRef<string | null>(null);

  const mobilePillInitRef = useRef(false);
  const desktopPillInitRef = useRef(false);
  const prevSidebarModeRef = useRef<'places' | 'itinerary'>(sidebarMode);
  const prevSidebarOpenRef = useRef<boolean>(isSidebarOpen);
  const prevCategoryRef = useRef<string>(selectedCategory);
  const prevSearchRef = useRef<string>(searchQuery);
  const mobileTabLatestRef = useRef<'map' | 'places' | 'itinerary'>(mobileTab);

  const { contextSafe } = useGSAP({ scope: shellRef });

  useEffect(() => {
    if (!toastMsg) return;
    const timer = setTimeout(() => setToastMsg(null), 2800);
    return () => clearTimeout(timer);
  }, [toastMsg]);

  const filteredPlaces = useMemo(() => {
    return mappedPlaces.filter((p) => {
      const matchCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        matchSearchKeyword(p.name, searchQuery) ||
        matchSearchKeyword(p.address, searchQuery) ||
        p.tags.some((t) => matchSearchKeyword(t, searchQuery));
      return matchCategory && matchQuery;
    });
  }, [mappedPlaces, selectedCategory, searchQuery]);

  const totalDistance = useMemo(() => calculateTotalRouteDistance(itinerary), [itinerary]);
  const estimatedHours = useMemo(() => {
    if (itinerary.length === 0) return 0;
    const travelHours = totalDistance / 35;
    const sightseeingHours = itinerary.length * 1.8;
    return Number((travelHours + sightseeingHours).toFixed(1));
  }, [itinerary, totalDistance]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const handleChange = () => {
      if (sidebarRef.current) {
        gsap.set(sidebarRef.current, { clearProps: 'transform,opacity,visibility' });
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useGSAP(
    () => {
      if (!mobileTabPillRef.current) return;
      const targetIdx = mobileTab === 'map' ? 0 : mobileTab === 'places' ? 1 : 2;
      const bg = mobileTab === 'itinerary' ? '#F59E0B' : '#0D5C53';

      if (!mobilePillInitRef.current) {
        mobilePillInitRef.current = true;
        gsap.set(mobileTabPillRef.current, { xPercent: targetIdx * 100, backgroundColor: bg });
        return;
      }

      const reduceMotion = prefersReducedMotion();
      gsap.to(mobileTabPillRef.current, {
        xPercent: targetIdx * 100,
        backgroundColor: bg,
        duration: reduceMotion ? 0.18 : 0.26,
        ease: reduceMotion ? 'power2.out' : 'power3.out',
        overwrite: 'auto',
      });
    },
    { scope: shellRef, dependencies: [mobileTab] }
  );

  useGSAP(
    () => {
      if (!desktopTabPillRef.current) return;
      const targetIdx = sidebarMode === 'places' ? 0 : 1;
      const bg = sidebarMode === 'places' ? '#FFFDF9' : '#F59E0B';

      if (!desktopPillInitRef.current) {
        desktopPillInitRef.current = true;
        gsap.set(desktopTabPillRef.current, { xPercent: targetIdx * 100, backgroundColor: bg });
        return;
      }

      const reduceMotion = prefersReducedMotion();
      gsap.to(desktopTabPillRef.current, {
        xPercent: targetIdx * 100,
        backgroundColor: bg,
        duration: reduceMotion ? 0.18 : 0.24,
        ease: reduceMotion ? 'power2.out' : 'power3.out',
        overwrite: 'auto',
      });
    },
    { scope: shellRef, dependencies: [sidebarMode] }
  );

  const switchMobileTab = (nextTab: 'map' | 'places' | 'itinerary') => {
    mobileTabLatestRef.current = nextTab;
    setMobileTab(nextTab);

    if (nextTab === 'places' || nextTab === 'itinerary') {
      setSidebarMode(nextTab);
      if (sidebarRef.current) {
        gsap.killTweensOf(sidebarRef.current);
      }
      if (isMobileOverlayVisible && sidebarRef.current) {
        gsap.set(sidebarRef.current, { autoAlpha: 1, y: 0, scale: 1 });
      }
      setIsMobileOverlayVisible(true);
      return;
    }

    const isMobileViewport =
      typeof window !== 'undefined' && window.innerWidth < 1024;

    if (!isMobileViewport || !isMobileOverlayVisible || !sidebarRef.current || prefersReducedMotion()) {
      if (sidebarRef.current && isMobileViewport) {
        gsap.set(sidebarRef.current, { clearProps: 'transform,opacity,visibility' });
      }
      setIsMobileOverlayVisible(false);
      return;
    }

    contextSafe(() => {
      if (!sidebarRef.current) return;
      gsap.to(sidebarRef.current, {
        autoAlpha: 0,
        y: 14,
        scale: 0.985,
        duration: 0.18,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          if (mobileTabLatestRef.current === 'map') {
            if (sidebarRef.current) {
              gsap.set(sidebarRef.current, { clearProps: 'transform,opacity,visibility' });
            }
            setIsMobileOverlayVisible(false);
          }
        },
      });
    })();
  };

  useGSAP(
    () => {
      if (!isMobileOverlayVisible || !sidebarRef.current) return;
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) return;
      const reduceMotion = prefersReducedMotion();

      if (reduceMotion) {
        gsap.set(sidebarRef.current, { autoAlpha: 1, y: 0, scale: 1 });
        return;
      }

      gsap.fromTo(
        sidebarRef.current,
        { autoAlpha: 0, y: 16, scale: 0.985 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.26,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform,opacity,visibility',
        }
      );
    },
    { scope: shellRef, dependencies: [isMobileOverlayVisible] }
  );

  const handleCollapseSidebar = () => {
    if (!sidebarRef.current) {
      setIsSidebarOpen(false);
      return;
    }

    const reduceMotion = prefersReducedMotion();
    contextSafe(() => {
      if (!sidebarRef.current) return;
      gsap.to(sidebarRef.current, {
        x: reduceMotion ? -10 : -24,
        autoAlpha: 0,
        duration: reduceMotion ? 0.15 : 0.18,
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => {
          if (sidebarRef.current) {
            gsap.set(sidebarRef.current, { clearProps: 'transform,opacity,visibility' });
          }
          setIsSidebarOpen(false);
        },
      });
    })();
  };

  const handleExpandSidebar = () => {
    setIsSidebarOpen(true);
  };

  useGSAP(
    () => {
      const wasOpen = prevSidebarOpenRef.current;
      prevSidebarOpenRef.current = isSidebarOpen;
      if (wasOpen === isSidebarOpen) return;

      const reduceMotion = prefersReducedMotion();

      if (isSidebarOpen && sidebarRef.current) {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
          gsap.fromTo(
            sidebarRef.current,
            { x: reduceMotion ? -10 : -24, autoAlpha: 0 },
            {
              x: 0,
              autoAlpha: 1,
              duration: reduceMotion ? 0.2 : 0.26,
              ease: reduceMotion ? 'power2.out' : 'power3.out',
              overwrite: 'auto',
              clearProps: 'transform,opacity,visibility',
            }
          );
        }
      } else if (!isSidebarOpen && reopenBtnRef.current) {
        gsap.fromTo(
          reopenBtnRef.current,
          { x: reduceMotion ? -6 : -14, autoAlpha: 0, scale: reduceMotion ? 0.98 : 0.95 },
          {
            x: 0,
            autoAlpha: 1,
            scale: 1,
            duration: reduceMotion ? 0.18 : 0.24,
            ease: reduceMotion ? 'power2.out' : 'power3.out',
            overwrite: 'auto',
            clearProps: 'transform,opacity,visibility',
          }
        );
      }
    },
    { scope: shellRef, dependencies: [isSidebarOpen] }
  );

  useGSAP(
    () => {
      if (prevSidebarModeRef.current === sidebarMode) return;
      prevSidebarModeRef.current = sidebarMode;
      if (!tabPanelRef.current) return;

      const reduceMotion = prefersReducedMotion();
      gsap.fromTo(
        tabPanelRef.current,
        { autoAlpha: reduceMotion ? 0.35 : 0, y: reduceMotion ? 4 : 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: reduceMotion ? 0.18 : 0.22,
          ease: 'power2.out',
          overwrite: 'auto',
          clearProps: 'transform,opacity,visibility',
        }
      );
    },
    { scope: shellRef, dependencies: [sidebarMode] }
  );

  useGSAP(
    () => {
      const catChanged = prevCategoryRef.current !== selectedCategory;
      const searchChanged = prevSearchRef.current !== searchQuery;
      prevCategoryRef.current = selectedCategory;
      prevSearchRef.current = searchQuery;
      if (!catChanged && !searchChanged) return;

      const reduceMotion = prefersReducedMotion();

      if (catChanged) {
        const activeChip = chipRefs.current.get(selectedCategory);
        if (activeChip) {
          activeChip.scrollIntoView({
            behavior: reduceMotion ? 'auto' : 'smooth',
            inline: 'nearest',
            block: 'nearest',
          });
        }
      }

      if (placesListRef.current && sidebarMode === 'places') {
        const cards = Array.from(
          placesListRef.current.querySelectorAll('[data-place-card]')
        ).slice(0, 8);
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { autoAlpha: reduceMotion ? 0.35 : 0, y: reduceMotion ? 4 : 6 },
            {
              autoAlpha: 1,
              y: 0,
              duration: reduceMotion ? 0.18 : 0.2,
              stagger: reduceMotion ? 0.015 : 0.02,
              ease: 'power2.out',
              overwrite: 'auto',
              clearProps: 'transform,opacity,visibility',
            }
          );
        }
      }
    },
    { scope: shellRef, dependencies: [selectedCategory, searchQuery, sidebarMode] }
  );

  const openPlacePopup = (place: Place, jumpToMapOnMobile = true) => {
    openPopup(place);
    if (jumpToMapOnMobile) {
      switchMobileTab('map');
    }
  };

  const shouldShowPopup = Boolean(selectedPlace) && mobileTab === 'map';

  // Sync sidebar list highlight & scroll-into-view when selecting a place on the map
  const selectedPlaceId = selectedPlace?.id ?? null;
  useGSAP(
    () => {
      if (!selectedPlaceId) return;
      const cardEl = placeCardRefs.current.get(selectedPlaceId);
      if (!cardEl) return;

      const reduceMotion = prefersReducedMotion();
      cardEl.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });

      gsap.fromTo(
        cardEl,
        { scale: reduceMotion ? 0.994 : 0.988 },
        {
          scale: 1,
          duration: reduceMotion ? 0.18 : 0.24,
          ease: 'power2.out',
          overwrite: 'auto',
          clearProps: 'transform',
        }
      );
    },
    { scope: shellRef, dependencies: [selectedPlaceId] }
  );

  const addToItinerary = (place: Place) => {
    const clean = place.name.replace(/\[Minh Họa\]\s*/g, '');
    if (itinerary.some((p) => p.id === place.id)) {
      setToastMsg(`"${clean}" đã có trong lộ trình.`);
      return;
    }
    setItinerary((prev) => [...prev, place]);
    setToastMsg(`Đã thêm "${clean}" vào lộ trình.`);
  };

  const removeFromItinerary = (id: string) => {
    setItinerary((prev) => prev.filter((p) => p.id !== id));
  };

  const moveItineraryItem = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= itinerary.length) return;

    const tops = new Map<string, number>();
    itineraryCardRefs.current.forEach((el, id) => {
      tops.set(id, el.getBoundingClientRect().top);
    });
    pendingReorderTopsRef.current = tops;
    lastMovedItineraryIdRef.current = itinerary[idx].id;

    const next = [...itinerary];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setItinerary(next);
    setItineraryReorderTick((t) => t + 1);
  };

  const optimizeMapItinerary = () => {
    if (itinerary.length < 3) return;
    const result = optimizeItineraryOrder(itinerary);
    setToastMsg(formatOptimizeNotice(result));
    if (!result.changed) return;

    const tops = new Map<string, number>();
    itineraryCardRefs.current.forEach((el, id) => {
      tops.set(id, el.getBoundingClientRect().top);
    });
    pendingReorderTopsRef.current = tops;
    lastMovedItineraryIdRef.current = null;

    setItinerary(result.places);
    setItineraryReorderTick((t) => t + 1);
  };

  useGSAP(
    () => {
      if (itineraryReorderTick === 0 || !pendingReorderTopsRef.current) return;
      const oldTops = pendingReorderTopsRef.current;
      pendingReorderTopsRef.current = null;
      const movedId = lastMovedItineraryIdRef.current;
      lastMovedItineraryIdRef.current = null;

      const deltas: Array<{ el: HTMLDivElement; deltaY: number; isMoved: boolean }> = [];
      itineraryCardRefs.current.forEach((el, id) => {
        const oldTop = oldTops.get(id);
        if (oldTop === undefined) return;
        const newTop = el.getBoundingClientRect().top;
        deltas.push({ el, deltaY: oldTop - newTop, isMoved: id === movedId });
      });

      const reduceMotion = prefersReducedMotion();

      deltas.forEach(({ el, deltaY, isMoved }) => {
        if (Math.abs(deltaY) > 1) {
          gsap.fromTo(
            el,
            { y: reduceMotion ? Math.max(-24, Math.min(24, deltaY * 0.4)) : deltaY },
            {
              y: 0,
              duration: reduceMotion ? 0.2 : 0.26,
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
              duration: reduceMotion ? 0.35 : 0.45,
              ease: 'power2.out',
              clearProps: 'backgroundColor',
            }
          );
        }
      });
    },
    { scope: shellRef, dependencies: [itineraryReorderTick] }
  );

  const loadLySonTour = () => {
    const lySon = mappedPlaces.filter((p) => p.district_id === 'dist-ly-son').slice(0, 4);
    const items = lySon.length > 0 ? lySon : mappedPlaces.slice(0, 4);
    setItinerary(items);
    setSidebarMode('itinerary');
  };

  const loadHeritageTour = () => {
    const heritage = mappedPlaces
      .filter(
        (p) => p.district_id === 'dist-tp-quang-ngai' || p.district_id === 'dist-kon-tum'
      )
      .slice(0, 4);
    const items = heritage.length > 0 ? heritage : mappedPlaces.slice(0, 4);
    setItinerary(items);
    setSidebarMode('itinerary');
  };

  return (
    <div
      ref={shellRef}
      className={`map-viewer-shell relative flex flex-col lg:flex-row w-full bg-[var(--bg-basalt)] overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-dvh'
          : 'flex-1 min-h-0 lg:flex-none lg:h-[calc(100vh-80px)] lg:min-h-[640px]'
      }`}
    >
      {/* Non-blocking status toast */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 lg:bottom-6 z-50 px-4 py-2.5 rounded-lg bg-[var(--bg-basalt)] text-[#FFFDF9] border border-[#2B3D38] shadow-soft-2xl text-xs font-semibold flex items-center gap-2 max-w-[90vw]"
        >
          <Info className="w-4 h-4 text-[#7CC4B8] shrink-0" aria-hidden="true" />
          <span className="truncate">{toastMsg}</span>
        </div>
      )}

      {/* MOBILE FLOATING BAR */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
        <div className="relative flex-1 min-w-0 bg-[var(--bg-surface)]/95 backdrop-blur-md p-1 rounded-xl shadow-soft-xl border border-[var(--border-subtle)] grid grid-cols-3">
          <div aria-hidden="true" className="absolute inset-1 pointer-events-none">
            <div
              ref={mobileTabPillRef}
              className="w-1/3 h-full rounded-lg will-change-transform"
            />
          </div>

          <button
            type="button"
            onClick={() => switchMobileTab('map')}
            className={`relative z-10 min-w-0 min-h-10 px-1 rounded-lg text-[11px] sm:text-xs whitespace-nowrap transition-colors duration-200 flex items-center justify-center gap-1 cursor-pointer ${
              mobileTab === 'map'
                ? 'text-[#FFFDF9] font-semibold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] font-semibold'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Bản đồ</span>
          </button>

          <button
            type="button"
            onClick={() => switchMobileTab('places')}
            className={`relative z-10 min-w-0 min-h-10 px-1 rounded-lg text-[11px] sm:text-xs whitespace-nowrap transition-colors duration-200 flex items-center justify-center gap-1 cursor-pointer ${
              mobileTab === 'places'
                ? 'text-[#FFFDF9] font-semibold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] font-semibold'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Địa điểm</span>
          </button>

          <button
            type="button"
            onClick={() => switchMobileTab('itinerary')}
            className={`relative z-10 min-w-0 min-h-10 px-1 rounded-lg text-[11px] sm:text-xs whitespace-nowrap transition-colors duration-200 flex items-center justify-center gap-1 cursor-pointer ${
              mobileTab === 'itinerary'
                ? 'text-[#16201D] font-bold'
                : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] font-semibold'
            }`}
          >
            <Route className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Lộ trình</span>
            {itinerary.length > 0 && (
              <span className="text-[10px] font-bold bg-[#16201D]/15 px-1 rounded-full shrink-0 tabular-nums">
                {itinerary.length}
              </span>
            )}
          </button>
        </div>

        {mobileTab === 'map' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <MapMarkersToggleButton
              showMarkers={showMarkers}
              onToggle={() => setShowMarkers((prev) => !prev)}
              compact
            />

            <MapLayersControl
              mapLayer={mapLayer}
              onSelectLayer={setMapLayer}
              variant="mobile"
            />

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="min-h-11 min-w-10 rounded-xl bg-[var(--bg-surface)]/95 backdrop-blur-md text-[var(--ink-primary)] hover:text-[var(--accent-jade)] shadow-soft-xl border border-[var(--border-subtle)] transition-colors flex items-center justify-center cursor-pointer"
              title={isFullscreen ? 'Thu nhỏ bản đồ' : 'Phóng to toàn màn hình'}
              aria-label={isFullscreen ? 'Thu nhỏ bản đồ' : 'Phóng to toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" aria-hidden="true" /> : <Maximize2 className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
        )}
      </div>

      {/* 1. SIDEBAR LIST & ITINERARY */}
      <div
        ref={sidebarRef}
        className={`bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] z-20 flex-col shadow-soft-xl ${
          isMobileOverlayVisible
            ? 'flex absolute inset-0 pt-16 w-full h-full'
            : 'hidden'
        } ${
          isSidebarOpen
            ? 'lg:flex lg:relative lg:inset-auto lg:pt-0 lg:w-96 xl:w-[420px] lg:h-full'
            : 'lg:hidden'
        }`}
      >
        <div className="p-3 bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)] hidden lg:flex items-center justify-between gap-2">
          <div className="relative grid grid-cols-2 p-1 bg-[var(--bg-surface-muted)] rounded-lg w-full border border-[var(--border-subtle)]">
            <div aria-hidden="true" className="absolute inset-1 pointer-events-none">
              <div
                ref={desktopTabPillRef}
                className="w-1/2 h-full rounded-md shadow-soft-sm will-change-transform"
              />
            </div>

            <button
              type="button"
              onClick={() => setSidebarMode('places')}
              className={`relative z-10 min-w-0 min-h-10 px-2 rounded-md text-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                sidebarMode === 'places'
                  ? 'text-[var(--accent-jade-ink)] font-semibold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] font-semibold'
              }`}
            >
              <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate tabular-nums">Địa điểm ({filteredPlaces.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSidebarMode('itinerary')}
              className={`relative z-10 min-w-0 min-h-10 px-2 rounded-md text-xs transition-colors duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                sidebarMode === 'itinerary'
                  ? 'text-[#16201D] font-bold'
                  : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] font-semibold'
              }`}
            >
              <Route className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate tabular-nums">Lộ trình ({itinerary.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCollapseSidebar}
            className="min-h-10 min-w-10 rounded-lg text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            title="Thu gọn bảng điều khiển"
            aria-label="Thu gọn bảng điều khiển"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* TAB A: PLACES LIST */}
        {sidebarMode === 'places' && (
          <div ref={tabPanelRef} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-[var(--border-subtle)] space-y-2.5 bg-[var(--bg-surface)]">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  aria-label="Tìm kiếm địa điểm Quảng Ngãi"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm địa điểm Quảng Ngãi..."
                  className="w-full min-h-11 pl-9 pr-9 py-2 text-sm rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors cursor-pointer"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div
                ref={chipsContainerRef}
                className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none"
              >
                <button
                  ref={(el) => {
                    if (el) chipRefs.current.set('all', el);
                    else chipRefs.current.delete('all');
                  }}
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  aria-pressed={selectedCategory === 'all'}
                  className={`min-h-9 px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors duration-150 shrink-0 cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[var(--accent-jade)] text-[#FFFDF9]'
                      : 'bg-[var(--bg-surface-muted)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat: Category) => (
                  <button
                    key={cat.id}
                    ref={(el) => {
                      if (el) chipRefs.current.set(cat.id, el);
                      else chipRefs.current.delete(cat.id);
                    }}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    aria-pressed={selectedCategory === cat.id}
                    className={`min-h-9 px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors duration-150 shrink-0 cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[var(--accent-jade)] text-[#FFFDF9]'
                        : 'bg-[var(--bg-surface-muted)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={placesListRef}
              className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2"
              data-lenis-prevent
            >
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-12 px-4 text-[var(--ink-muted)] text-sm">
                  <MapPin className="w-8 h-8 text-[var(--border-strong)] mx-auto mb-2" aria-hidden="true" />
                  Không tìm thấy địa điểm nào phù hợp.
                </div>
              ) : (
                filteredPlaces.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const cat = categories.find((c: Category) => c.id === place.category_id);
                  const inItinerary = itinerary.some((p) => p.id === place.id);
                  const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');

                  return (
                    <div
                      key={place.id}
                      ref={(el) => {
                        if (el) placeCardRefs.current.set(place.id, el);
                        else placeCardRefs.current.delete(place.id);
                      }}
                      data-place-card
                      className={`group p-3 rounded-xl transition-[background-color,border-color,box-shadow] duration-200 border ${
                        isSelected
                          ? 'bg-[var(--accent-jade-soft)]/60 border-[var(--accent-jade)] shadow-soft-sm'
                          : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] hover:border-[var(--accent-jade)]/40 border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => openPlacePopup(place, true)}
                          className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-surface-muted)] cursor-pointer"
                          aria-label={`Chọn ${cleanName} trên bản đồ`}
                        >
                          <Image
                            src={place.cover_image}
                            alt={cleanName}
                            fill
                            sizes="64px"
                            className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none"
                          />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[11px] font-semibold text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-2 py-0.5 rounded-sm truncate">
                              {cat?.name}
                            </span>
                            {SHOW_PLACE_RATINGS && (
                              <div className="flex items-center text-xs text-[var(--ink-primary)] font-semibold shrink-0 tabular-nums">
                                <Star
                                  aria-hidden="true"
                                  className="w-3.5 h-3.5 fill-[var(--accent-ochre-bright)] text-[var(--accent-ochre-bright)] mr-0.5"
                                />
                                <span>{place.rating}</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => openPlacePopup(place, true)}
                            className={`text-left w-full text-sm font-semibold truncate cursor-pointer transition-colors duration-150 hover:text-[var(--accent-jade)] ${
                              isSelected ? 'text-[var(--accent-jade-ink)]' : 'text-[var(--ink-primary)]'
                            }`}
                          >
                            {cleanName}
                          </button>
                          <p className="text-xs text-[var(--ink-muted)] truncate mt-0.5">
                            {place.address}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                            <span className="text-[var(--ink-secondary)] font-medium truncate min-w-0">
                              {place.price_label}
                            </span>
                            <button
                              type="button"
                              onClick={() => addToItinerary(place)}
                              className={`min-h-8 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 cursor-pointer ${
                                inItinerary
                                  ? 'bg-[var(--accent-ochre-soft)] text-[var(--accent-ochre-ink)]'
                                  : 'bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9]'
                              }`}
                            >
                              {inItinerary ? (
                                <Check className="w-3 h-3" aria-hidden="true" />
                              ) : (
                                <Plus className="w-3 h-3" aria-hidden="true" />
                              )}
                              <span>{inItinerary ? 'Đã thêm' : 'Lộ trình'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB B: ITINERARY TOUR PLANNER */}
        {sidebarMode === 'itinerary' && (
          <div ref={tabPanelRef} className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[var(--bg-canvas)]">
            <div className="p-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--accent-ochre-ink)] bg-[var(--accent-ochre-soft)] px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Tổng quan lộ trình</span>
                </span>
                <span className="text-xs font-semibold text-[var(--ink-primary)] tabular-nums">
                  {itinerary.length} điểm dừng
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[var(--accent-jade-soft)]/70 border border-[var(--accent-jade)]/15">
                  <div className="text-xs font-medium text-[var(--accent-jade-ink)]">
                    Quãng đường
                  </div>
                  <div className="font-mono text-base font-semibold text-[var(--ink-primary)] mt-0.5 tabular-nums">
                    ~ {totalDistance} km
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--accent-ochre-soft)] border border-[var(--accent-ochre)]/15">
                  <div className="text-xs font-medium text-[var(--accent-ochre-ink)]">
                    Thời gian
                  </div>
                  <div className="font-mono text-base font-semibold text-[var(--ink-primary)] mt-0.5 tabular-nums">
                    ~ {estimatedHours} giờ
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <a
                    href={buildGoogleMapsRouteUrl(itinerary)}
                    target="_blank"
                    rel="noreferrer"
                    className="ui-interactive-press flex-1 min-w-0 min-h-10 px-3 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">Chỉ đường Google Maps</span>
                  </a>
                  {itinerary.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setItinerary([])}
                      className="min-h-10 min-w-10 rounded-lg text-[#9A3412] hover:bg-[#F6EAE6] border border-[var(--border-subtle)] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                      title="Xóa toàn bộ lộ trình"
                      aria-label="Xóa toàn bộ lộ trình"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {itinerary.length > 0 && (
                  <button
                    type="button"
                    onClick={optimizeMapItinerary}
                    disabled={itinerary.length < 3}
                    title={
                      itinerary.length < 3
                        ? 'Cần ít nhất 3 điểm dừng để sắp xếp thông minh'
                        : 'Tự động sắp xếp thứ tự các chặng để rút ngắn quãng đường'
                    }
                    className="ui-interactive-press w-full min-h-9 px-3 rounded-lg bg-[var(--accent-jade-soft)] hover:bg-[var(--accent-jade)] text-[var(--accent-jade-ink)] hover:text-[#FFFDF9] disabled:opacity-45 disabled:pointer-events-none text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Sắp xếp thông minh</span>
                  </button>
                )}
              </div>

              <div className="text-xs text-[var(--ink-muted)] flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <span className="font-medium text-[var(--ink-secondary)]">Gợi ý sẵn:</span>
                <button
                  type="button"
                  onClick={loadLySonTour}
                  className="min-h-8 px-2.5 py-1 rounded-md bg-[var(--bg-surface-muted)] hover:bg-[var(--accent-jade-soft)] hover:text-[var(--accent-jade-ink)] text-[var(--ink-primary)] font-semibold transition-colors cursor-pointer"
                >
                  Đảo Lý Sơn
                </button>
                <button
                  type="button"
                  onClick={loadHeritageTour}
                  className="min-h-8 px-2.5 py-1 rounded-md bg-[var(--bg-surface-muted)] hover:bg-[var(--accent-jade-soft)] hover:text-[var(--accent-jade-ink)] text-[var(--ink-primary)] font-semibold transition-colors cursor-pointer"
                >
                  Sông Trà &amp; Di sản
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5" data-lenis-prevent>
              {itinerary.length === 0 ? (
                <div className="text-center py-12 px-4 text-[var(--ink-muted)] text-xs">
                  <Route className="w-9 h-9 text-[var(--border-strong)] mx-auto mb-2" aria-hidden="true" />
                  <p className="font-semibold text-[var(--ink-primary)] text-sm">Chưa có địa điểm nào</p>
                  <p className="mt-1">
                    Chuyển sang mục <strong>Địa điểm</strong> và bấm <strong>+ Lộ trình</strong>.
                  </p>
                </div>
              ) : (
                itinerary.map((place, idx) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const nextPlace = itinerary[idx + 1];
                  const legDist = nextPlace
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
                          if (el) itineraryCardRefs.current.set(place.id, el);
                          else itineraryCardRefs.current.delete(place.id);
                        }}
                        onClick={() => openPlacePopup(place, true)}
                        className={`group p-3 bg-[var(--bg-surface)] rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-[border-color,box-shadow,background-color] duration-200 ${
                          isSelected
                            ? 'border-[var(--accent-jade)] ring-2 ring-[var(--accent-jade)]/15'
                            : 'border-[var(--border-subtle)] hover:border-[var(--accent-jade)]/45 hover:shadow-soft-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-md font-mono font-semibold text-xs flex items-center justify-center shrink-0 tabular-nums ${
                              isSelected
                                ? 'bg-[var(--accent-jade)] text-[#FFFDF9]'
                                : 'bg-[#F59E0B] text-[#16201D]'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-surface-muted)]">
                            <Image
                              src={place.cover_image}
                              alt={cleanName}
                              fill
                              sizes="48px"
                              className="object-cover motion-safe:group-hover:scale-105 transition-transform duration-300 motion-reduce:transition-none"
                            />
                          </div>
                          <div className="min-w-0">
                            <div
                              className={`font-semibold text-xs sm:text-sm truncate transition-colors duration-150 group-hover:text-[var(--accent-jade)] ${
                                isSelected ? 'text-[var(--accent-jade-ink)]' : 'text-[var(--ink-primary)]'
                              }`}
                            >
                              {cleanName}
                            </div>
                            <span className="text-xs text-[var(--ink-muted)] truncate block">
                              {place.address}
                            </span>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-0.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => moveItineraryItem(idx, 'up')}
                            disabled={idx === 0}
                            className="w-8 h-8 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] disabled:opacity-25 flex items-center justify-center cursor-pointer"
                            title="Lên trên"
                            aria-label={`Chuyển ${cleanName} lên trên`}
                          >
                            <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItineraryItem(idx, 'down')}
                            disabled={idx === itinerary.length - 1}
                            className="w-8 h-8 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] disabled:opacity-25 flex items-center justify-center cursor-pointer"
                            title="Xuống dưới"
                            aria-label={`Chuyển ${cleanName} xuống dưới`}
                          >
                            <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromItinerary(place.id)}
                            className="w-8 h-8 rounded-lg text-[#9A3412] hover:bg-[#F6EAE6] flex items-center justify-center cursor-pointer"
                            title="Bỏ khỏi lộ trình"
                            aria-label={`Xóa ${cleanName} khỏi lộ trình`}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      {legDist !== null && (
                        <div className="flex items-center gap-2 pl-5 py-0.5 text-xs text-[var(--accent-jade-ink)] font-medium tabular-nums">
                          <div className="w-0.5 h-4 bg-[var(--accent-jade)]/40" aria-hidden="true" />
                          <span className="font-mono bg-[var(--accent-jade-soft)] px-2 py-0.5 rounded-sm">
                            Chặng tiếp: ~ {legDist} km
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {!isSidebarOpen && (
        <button
          ref={reopenBtnRef}
          type="button"
          onClick={handleExpandSidebar}
          className="hidden lg:flex absolute top-4 left-4 z-30 min-h-11 px-3.5 rounded-xl bg-[var(--bg-surface)]/95 backdrop-blur-md border border-[var(--border-subtle)] shadow-soft-xl text-[var(--ink-primary)] hover:text-[var(--accent-jade)] items-center gap-2 text-xs font-semibold cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-[var(--accent-jade)]" aria-hidden="true" />
          <span>Mở danh sách &amp; Lộ trình</span>
        </button>
      )}

      {/* 2. INTERACTIVE LEAFLET MAP */}
      <div className="flex-1 min-h-0 relative w-full h-full bg-[var(--bg-basalt)] overflow-hidden">
        <LeafletMap
          places={mappedPlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={(p) => openPlacePopup(p, true)}
          itineraryPlaces={
            showMarkers || sidebarMode === 'itinerary' || mobileTab === 'itinerary'
              ? itinerary
              : []
          }
          mapLayer={mapLayer}
          showMarkers={showMarkers}
          showItineraryMarkers={sidebarMode === 'itinerary' || mobileTab === 'itinerary'}
        />

        {/* Selected Place Popup Card */}
        <MapPlacePopupCard
          popupRef={popupRef}
          place={renderedPopupPlace}
          isVisible={shouldShowPopup}
          categoryName={
            renderedPopupPlace
              ? categories.find((c: Category) => c.id === renderedPopupPlace.category_id)?.name
              : undefined
          }
          isInItinerary={
            renderedPopupPlace ? itinerary.some((p) => p.id === renderedPopupPlace.id) : false
          }
          onAddToItinerary={addToItinerary}
          onClose={closePlacePopup}
        />

        {/* Desktop Controls (Top Right) */}
        <div className="hidden lg:flex absolute top-4 right-4 z-30 items-center gap-2">
          <MapMarkersToggleButton
            showMarkers={showMarkers}
            onToggle={() => setShowMarkers((prev) => !prev)}
            showLabel={sidebarMode === 'itinerary' ? 'Hiện tất cả điểm' : 'Hiện đánh dấu'}
            hideLabel={sidebarMode === 'itinerary' ? 'Chỉ hiện lộ trình' : 'Ẩn đánh dấu'}
          />

          <MapLayersControl
            mapLayer={mapLayer}
            onSelectLayer={setMapLayer}
            variant="desktop"
          />

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="min-h-11 min-w-11 rounded-xl bg-[var(--bg-surface)]/95 backdrop-blur-md text-[var(--ink-primary)] hover:text-[var(--accent-jade)] shadow-soft-xl border border-[var(--border-subtle)] transition-colors flex items-center justify-center cursor-pointer"
            title={isFullscreen ? 'Thu nhỏ giao diện' : 'Toàn màn hình'}
            aria-label={isFullscreen ? 'Thu nhỏ giao diện' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" aria-hidden="true" /> : <Maximize2 className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>

        {/* Map Legend */}
        <div
          className={`flex absolute bottom-7 left-3 sm:left-auto sm:bottom-6 sm:right-4 z-20 bg-[#111A18]/90 backdrop-blur-md border border-[#2B3D38] text-[#F5F2EB] px-3 py-1.5 rounded-lg text-xs items-center gap-3 shadow-soft-xl max-w-[calc(100%-24px)] ${
            selectedPlace ? 'hidden lg:flex' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF] shrink-0" aria-hidden="true" />
            <span>Địa danh</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" aria-hidden="true" />
            <span>Chặng lộ trình</span>
          </div>
          <div className="hidden sm:block text-[var(--ink-on-dark-muted)] border-l border-[#2B3D38] pl-3 whitespace-nowrap">
            OpenStreetMap / Google
          </div>
        </div>
      </div>
    </div>
  );
}
