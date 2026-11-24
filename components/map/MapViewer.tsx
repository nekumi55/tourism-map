'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Maximize2,
  Minimize2,
  MapPin,
  Star,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  X,
  Compass,
  Route,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Map as MapIcon,
  Check,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Place, Category } from '@/types';
import { useData } from '@/context/DataContext';
import {
  calculateDistanceKm,
  calculateTotalRouteDistance,
  buildGoogleMapsRouteUrl,
} from '@/utils/itinerary';
import { matchSearchKeyword } from '@/utils/vietnamese';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-teal-300 p-8 text-center min-h-[450px]">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-bold">Đang tải bản đồ số Quảng Ngãi...</span>
    </div>
  ),
});

const LAYER_OPTIONS = [
  { id: 'standard' as const, label: 'Đường bộ (Google)', emoji: '🗺️' },
  { id: 'terrain' as const, label: 'Địa hình đồi núi', emoji: '⛰️' },
  { id: 'satellite' as const, label: 'Vệ tinh & Địa danh', emoji: '🛰️' },
];

export default function MapViewer() {
  const searchParams = useSearchParams();
  const initialPlaceId = searchParams.get('placeId');
  const { places, categories } = useData();

  // Mobile segmented control view: 'map' | 'places' | 'itinerary'
  const [mobileTab, setMobileTab] = useState<'map' | 'places' | 'itinerary'>('map');

  // Sidebar mode: 'places' or 'itinerary' (used for desktop and internal sidebar rendering)
  const [sidebarMode, setSidebarMode] = useState<'places' | 'itinerary'>('places');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(() => {
    if (initialPlaceId) {
      return places.find((p) => p.id === initialPlaceId) || null;
    }
    return null;
  });

  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const layersPopoverRef = useRef<HTMLDivElement>(null);
  const layersBtnRef = useRef<HTMLButtonElement>(null);

  // Close layers popover on outside click
  useEffect(() => {
    if (!isLayersOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        layersPopoverRef.current &&
        !layersPopoverRef.current.contains(e.target as Node) &&
        layersBtnRef.current &&
        !layersBtnRef.current.contains(e.target as Node)
      ) {
        setIsLayersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLayersOpen]);

  // Itinerary Stops list
  const [itinerary, setItinerary] = useState<Place[]>(() => {
    const lySonPlaces = places.filter((p) => p.district_id === 'dist-ly-son').slice(0, 3);
    return lySonPlaces.length > 0 ? lySonPlaces : places.slice(0, 3);
  });

  // Filtered places for places tab
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchCategory =
        selectedCategory === 'all' || p.category_id === selectedCategory;
      const matchQuery =
        searchQuery.trim() === '' ||
        matchSearchKeyword(p.name, searchQuery) ||
        matchSearchKeyword(p.address, searchQuery) ||
        p.tags.some((t) => matchSearchKeyword(t, searchQuery));
      return matchCategory && matchQuery;
    });
  }, [places, selectedCategory, searchQuery]);

  // Itinerary calculations
  const totalDistance = useMemo(() => calculateTotalRouteDistance(itinerary), [itinerary]);
  const estimatedHours = useMemo(() => {
    if (itinerary.length === 0) return 0;
    const travelHours = totalDistance / 35;
    const sightseeingHours = itinerary.length * 1.8;
    return Number((travelHours + sightseeingHours).toFixed(1));
  }, [itinerary, totalDistance]);

  // Add place to itinerary
  const addToItinerary = (place: Place) => {
    if (itinerary.some((p) => p.id === place.id)) {
      alert('Địa điểm này đã có trong lịch trình của bạn!');
      return;
    }
    setItinerary((prev) => [...prev, place]);
  };

  // Remove place from itinerary
  const removeFromItinerary = (id: string) => {
    setItinerary((prev) => prev.filter((p) => p.id !== id));
  };

  // Move itinerary item up or down
  const moveItineraryItem = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= itinerary.length) return;
    const next = [...itinerary];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setItinerary(next);
  };

  // Preset Itinerary: Lý Sơn
  const loadLySonTour = () => {
    const items = places.filter((p) => p.district_id === 'dist-ly-son').slice(0, 4);
    setItinerary(items);
    setSidebarMode('itinerary');
  };

  // Preset Itinerary: Di sản
  const loadHeritageTour = () => {
    const items = places.filter(
      (p) => p.district_id === 'dist-tp-quang-ngai' || p.district_id === 'dist-kon-tum'
    ).slice(0, 4);
    setItinerary(items);
    setSidebarMode('itinerary');
  };

  const isMobileSidebarActive = mobileTab === 'places' || mobileTab === 'itinerary';

  // Render Layer Popover content
  const renderLayerPopover = () => (
    <div
      ref={layersPopoverRef}
      className="absolute top-full right-0 mt-2 w-52 sm:w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-soft-2xl border border-slate-200/90 p-1.5 flex flex-col gap-1 text-xs font-bold text-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="px-2.5 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
        Lớp hiển thị bản đồ
      </div>
      {LAYER_OPTIONS.map((opt) => {
        const isActive = mapLayer === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              setMapLayer(opt.id);
              setIsLayersOpen(false);
            }}
            className={`px-3 py-2 rounded-xl text-left transition-colors flex items-center justify-between ${
              isActive
                ? 'bg-teal-50 text-teal-800 font-extrabold border border-teal-200/60'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </span>
            {isActive && <Check className="w-3.5 h-3.5 text-teal-600" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      className={`relative flex flex-col lg:flex-row w-full bg-slate-900 overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen'
          : 'h-[calc(100dvh-57px)] lg:h-[calc(100vh-80px)] lg:min-h-[640px]'
      }`}
    >
      {/* MOBILE FLOATING BAR: SEGMENTED CONTROL + COMPACT LAYERS */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-30 flex items-center gap-2">
        <div className="flex-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-soft-xl border border-slate-200/90 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileTab === 'map'
                ? 'bg-teal-600 text-white shadow-soft-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 shrink-0" />
            <span>Bản đồ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('places');
              setSidebarMode('places');
            }}
            className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileTab === 'places'
                ? 'bg-teal-600 text-white shadow-soft-sm font-extrabold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span>Địa điểm</span>
            <span className="text-[10px] font-semibold opacity-85">({filteredPlaces.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileTab('itinerary');
              setSidebarMode('itinerary');
            }}
            className={`flex-1 py-1.5 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              mobileTab === 'itinerary'
                ? 'bg-amber-500 text-slate-950 shadow-soft-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Route className="w-3.5 h-3.5 shrink-0" />
            <span>Lịch trình</span>
            {itinerary.length > 0 && (
              <span className="text-[10px] font-black bg-slate-950/15 px-1 rounded-full">
                {itinerary.length}
              </span>
            )}
          </button>
        </div>

        {mobileTab === 'map' && (
          <div className="relative shrink-0">
            <button
              ref={layersBtnRef}
              type="button"
              onClick={() => setIsLayersOpen((prev) => !prev)}
              className={`p-2.5 rounded-2xl backdrop-blur-md shadow-soft-xl border transition-all flex items-center justify-center ${
                isLayersOpen
                  ? 'bg-teal-600 text-white border-teal-500 shadow-teal-500/20'
                  : 'bg-white/95 text-slate-700 hover:text-teal-700 border-slate-200/90'
              }`}
              title="Đổi lớp bản đồ"
            >
              <Layers className="w-4 h-4" />
            </button>
            {isLayersOpen && renderLayerPopover()}
          </div>
        )}
      </div>

      {/* 1. SIDEBAR LIST & ITINERARY */}
      <div
        className={`bg-white border-r border-slate-200 z-20 flex flex-col transition-all duration-300 shadow-xl ${
          isMobileSidebarActive
            ? 'absolute inset-0 pt-16 lg:pt-0 lg:relative lg:inset-auto'
            : 'hidden lg:flex'
        } ${
          isSidebarOpen
            ? 'w-full lg:w-96 xl:w-[420px] h-full'
            : 'lg:w-0 lg:h-full lg:overflow-hidden'
        }`}
      >
        <div className="p-3 bg-slate-50 border-b border-slate-200 hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-full">
            <button
              onClick={() => setSidebarMode('places')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                sidebarMode === 'places'
                  ? 'bg-white text-teal-800 shadow-soft-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Địa Điểm ({filteredPlaces.length})</span>
            </button>

            <button
              onClick={() => setSidebarMode('itinerary')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                sidebarMode === 'itinerary'
                  ? 'bg-amber-500 text-slate-950 shadow-soft-sm font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              <span>Lịch Trình ({itinerary.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex ml-2 shrink-0"
            title="Thu gọn sidebar"
          >
            <ChevronLeft className="w-5 h-5 hidden lg:block" />
          </button>
        </div>

        {/* TAB A: PLACES LIST */}
        {sidebarMode === 'places' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-100 space-y-2 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm địa điểm Quảng Ngãi..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-teal-600 text-white shadow-soft-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả
                </button>
                {categories.map((cat: Category) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-teal-600 text-white shadow-soft-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100" data-lenis-prevent>
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-500 text-xs">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Không tìm thấy địa điểm nào phù hợp bộ lọc.
                </div>
              ) : (
                filteredPlaces.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const cat = categories.find((c: Category) => c.id === place.category_id);
                  const inItinerary = itinerary.some((p) => p.id === place.id);

                  return (
                    <div
                      key={place.id}
                      onClick={() => {
                        setSelectedPlace(place);
                        setMobileTab('map');
                      }}
                      className={`pt-2.5 first:pt-0 p-2.5 rounded-2xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50/90 border border-teal-300 shadow-soft-sm'
                          : 'hover:bg-slate-50 border border-transparent'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-2xs bg-slate-100">
                          <Image
                            src={place.cover_image}
                            alt={place.name}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md truncate">
                              {cat?.name}
                            </span>
                            <div className="flex items-center text-[11px] text-amber-500 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                              {place.rating}
                            </div>
                          </div>
                          <h4 className={`text-xs font-bold truncate ${
                            isSelected ? 'text-teal-950 font-black' : 'text-slate-900'
                          }`}>
                            {place.name.replace(/\[Minh Họa\]\s*/g, '')}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {place.address}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 font-semibold">{place.price_label}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToItinerary(place);
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                inItinerary
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
                              }`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>{inItinerary ? 'Đã thêm' : '+ Lịch trình'}</span>
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
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            <div className="p-4 bg-white border-b border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Route className="w-3.5 h-3.5" />
                  <span>Tổng quan lộ trình</span>
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {itinerary.length} điểm dừng
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100">
                  <div className="text-[10px] font-bold uppercase text-teal-700">
                    Tổng quãng đường
                  </div>
                  <div className="text-base font-black text-teal-950 mt-0.5">
                    ~ {totalDistance} km
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="text-[10px] font-bold uppercase text-amber-700">
                    Thời gian gợi ý
                  </div>
                  <div className="text-base font-black text-amber-950 mt-0.5">
                    ~ {estimatedHours} giờ
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={buildGoogleMapsRouteUrl(itinerary)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-soft-sm transition-all"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Mở Google Maps chỉ đường</span>
                </a>
                {itinerary.length > 0 && (
                  <button
                    onClick={() => setItinerary([])}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200"
                    title="Xóa toàn bộ lịch trình"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-600">Gợi ý tour mẫu:</span>
                <button
                  onClick={loadLySonTour}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 font-bold transition-colors"
                >
                  Tour Đảo Lý Sơn
                </button>
                <button
                  onClick={loadHeritageTour}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 font-bold transition-colors"
                >
                  Tour Sông Trà & Di Sản
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5" data-lenis-prevent>
              {itinerary.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-500 text-xs">
                  <Route className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Chưa có địa điểm nào trong lịch trình</p>
                  <p className="mt-1">
                    Chuyển sang tab <strong>&quot;Địa Điểm&quot;</strong> và bấm <strong>&quot;+ Lịch trình&quot;</strong> để tạo hành trình của bạn!
                  </p>
                </div>
              ) : (
                itinerary.map((place, idx) => {
                  const nextPlace = itinerary[idx + 1];
                  const legDist = nextPlace
                    ? calculateDistanceKm(
                        place.latitude,
                        place.longitude,
                        nextPlace.latitude,
                        nextPlace.longitude
                      )
                    : null;

                  return (
                    <div key={place.id} className="space-y-2">
                      <div
                        onClick={() => {
                          setSelectedPlace(place);
                          setMobileTab('map');
                        }}
                        className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm flex items-center justify-between gap-3 cursor-pointer hover:border-teal-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {idx + 1}
                          </span>
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                            <Image
                              src={place.cover_image}
                              alt={place.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h5 className="font-bold text-slate-900 text-xs truncate">
                              {place.name.replace(/\[Minh Họa\]\s*/g, '')}
                            </h5>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {place.address}
                            </span>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => moveItineraryItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Lên trên"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItineraryItem(idx, 'down')}
                            disabled={idx === itinerary.length - 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Xuống dưới"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromItinerary(place.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                            title="Bỏ khỏi lịch trình"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {legDist !== null && (
                        <div className="flex items-center gap-2 pl-6 py-0.5 text-[11px] text-teal-700 font-bold">
                          <div className="w-0.5 h-4 bg-teal-400 border-l border-dashed" />
                          <span className="bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            Di chuyển chặng tiếp theo: ~ {legDist} km
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
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="hidden lg:flex absolute top-4 left-4 z-30 p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-soft-xl text-slate-800 hover:text-teal-700 items-center gap-2 text-xs font-bold"
        >
          <ChevronRight className="w-4 h-4 text-teal-600" />
          <span>Mở danh sách & Lịch trình</span>
        </button>
      )}

      {/* 2. REAL INTERACTIVE LEAFLET MAP */}
      <div className="flex-1 relative w-full h-full bg-slate-900 overflow-hidden">
        <LeafletMap
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={(p) => {
            setSelectedPlace(p);
            setMobileTab('map');
          }}
          itineraryPlaces={itinerary}
          mapLayer={mapLayer}
        />

        {/* Selected Place Popup Window (Modern Floating Bottom Card) */}
        {selectedPlace && mobileTab === 'map' && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-soft-2xl border border-slate-200/80 p-3 sm:p-3.5 overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="w-8 h-1 bg-slate-200 rounded-full mx-auto mb-2 sm:hidden" />

            <div className="flex gap-3">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-slate-100 shadow-2xs">
                <Image
                  src={selectedPlace.cover_image}
                  alt={selectedPlace.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-[10px] text-amber-300 font-black flex items-center gap-0.5 shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                  <span>{selectedPlace.rating}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md truncate max-w-[140px]">
                      {categories.find((c: Category) => c.id === selectedPlace.category_id)?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedPlace(null)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 -mr-1 -mt-0.5"
                      title="Đóng popup"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                    {selectedPlace.name.replace(/\[Minh Họa\]\s*/g, '')}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 flex items-center gap-1 font-medium mt-0.5">
                    <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                    <span className="truncate">{selectedPlace.address}</span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-1">
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md shrink-0">
                    {selectedPlace.price_label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => addToItinerary(selectedPlace)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        itinerary.some((p) => p.id === selectedPlace.id)
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-2xs'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>
                        {itinerary.some((p) => p.id === selectedPlace.id) ? 'Đã thêm' : '+ Lịch trình'}
                      </span>
                    </button>
                    <Link
                      href={`/places/${selectedPlace.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-soft-sm transition-colors"
                    >
                      <span>Chi tiết</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Controls (Top Right): Compact Layers Button + Fullscreen */}
        <div className="hidden lg:flex absolute top-4 right-4 z-30 items-center gap-2">
          <div className="relative">
            <button
              ref={layersBtnRef}
              type="button"
              onClick={() => setIsLayersOpen((prev) => !prev)}
              className={`px-3 py-2 rounded-2xl backdrop-blur-md shadow-soft-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isLayersOpen
                  ? 'bg-teal-600 text-white border-teal-500 shadow-teal-500/20'
                  : 'bg-white/95 text-slate-700 hover:text-teal-700 hover:bg-slate-50 border-slate-200/90'
              }`}
              title="Đổi lớp hiển thị bản đồ"
            >
              <Layers className="w-4 h-4 text-teal-600" />
              <span>
                {mapLayer === 'standard'
                  ? 'Đường bộ'
                  : mapLayer === 'terrain'
                  ? 'Địa hình'
                  : 'Vệ tinh'}
              </span>
            </button>
            {isLayersOpen && renderLayerPopover()}
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-teal-700 hover:bg-slate-50 shadow-soft-xl border border-slate-200/90 transition-colors"
            title={isFullscreen ? 'Thu nhỏ giao diện' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Map Legend (Bottom Right, Desktop/Tablet only) */}
        <div
          className={`hidden sm:flex absolute bottom-4 right-4 z-20 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white px-3.5 py-2 rounded-2xl text-[11px] items-center gap-3 shadow-soft-xl ${
            selectedPlace ? 'hidden lg:flex' : ''
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span>Địa danh Quảng Ngãi</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Chặng lộ trình</span>
          </div>
          <div className="text-slate-400 border-l border-slate-700 pl-3">
            Bản đồ số OpenStreetMap / Google
          </div>
        </div>
      </div>
    </div>
  );
}