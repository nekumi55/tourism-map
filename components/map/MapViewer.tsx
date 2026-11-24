'use client';

import React, { useState, useMemo } from 'react';
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

export default function MapViewer() {
  const searchParams = useSearchParams();
  const initialPlaceId = searchParams.get('placeId');
  const { places, categories } = useData();

  // Sidebar mode: 'places' or 'itinerary'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Itinerary Stops list
  const [itinerary, setItinerary] = useState<Place[]>(() => {
    // Default initial itinerary: Lý Sơn highlights
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
    // ~ 2 hours per stop + travel time (avg 35km/h in VN traffic)
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
    setItinerary([...itinerary, place]);
    setSidebarMode('itinerary');
  };

  // Remove place from itinerary
  const removeFromItinerary = (id: string) => {
    setItinerary(itinerary.filter((p) => p.id !== id));
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

  return (
    <div
      className={`relative flex flex-col lg:flex-row w-full bg-slate-900 overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 h-screen'
          : 'h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] min-h-[640px]'
      }`}
    >
      {/* 1. SIDEBAR LIST & ITINERARY */}
      <div
        className={`bg-white border-r border-slate-200 z-20 flex flex-col transition-all duration-300 shadow-xl ${
          isSidebarOpen
            ? 'w-full lg:w-96 xl:w-[420px] h-1/2 lg:h-full'
            : 'w-full lg:w-0 h-0 lg:h-full overflow-hidden'
        }`}
      >
        {/* Sidebar Header & Tab Switcher */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
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
            <X className="w-5 h-5 lg:hidden" />
          </button>
        </div>

        {/* TAB A: PLACES LIST */}
        {sidebarMode === 'places' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Category Pills */}
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

              {/* Category Pills */}
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

            {/* Places List Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-slate-100" data-lenis-prevent>
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-12 px-4 text-slate-500 text-xs">
                  <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Không tìm thấy địa điểm nào phù compliance bộ lọc.
                </div>
              ) : (
                filteredPlaces.map((place) => {
                  const isSelected = selectedPlace?.id === place.id;
                  const cat = categories.find((c: Category) => c.id === place.category_id);
                  const inItinerary = itinerary.some((p) => p.id === place.id);

                  return (
                    <div
                      key={place.id}
                      onClick={() => setSelectedPlace(place)}
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
            {/* Itinerary Stats Card */}
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

              {/* Quick Stats Grid */}
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

              {/* Navigation Action Buttons */}
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

              {/* Quick Preset Tours */}
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

            {/* Sequential Stops List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
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
                      {/* Place Stop Card */}
                      <div className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm flex items-center justify-between gap-3">
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

                        {/* Reorder and Delete Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveItineraryItem(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Lên trên"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveItineraryItem(idx, 'down')}
                            disabled={idx === itinerary.length - 1}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20"
                            title="Xuống dưới"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromItinerary(place.id)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                            title="Bỏ khỏi lịch trình"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Leg distance connector */}
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

      {/* Floating Toggle Button for Closed Sidebar */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-30 p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-soft-xl text-slate-800 hover:text-teal-700 flex items-center gap-2 text-xs font-bold"
        >
          <ChevronRight className="w-4 h-4 text-teal-600" />
          <span className="hidden sm:inline">Mở danh sách & Lịch trình</span>
          <span className="sm:hidden">Danh sách</span>
        </button>
      )}

      {/* 2. REAL INTERACTIVE LEAFLET MAP (QUẢNG NGÃI + TILES: STANDARD, TERRAIN, SATELLITE) */}
      <div className="flex-1 relative h-1/2 lg:h-full bg-slate-900 overflow-hidden min-h-[450px]">
        <LeafletMap
          places={places}
          selectedPlace={selectedPlace}
          onSelectPlace={(p) => setSelectedPlace(p)}
          itineraryPlaces={itinerary}
          mapLayer={mapLayer}
        />

        {/* Selected Place Popup Window */}
        {selectedPlace && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-soft-xl border border-white/40 overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="relative h-32 sm:h-36 bg-slate-100 overflow-hidden">
              <Image
                src={selectedPlace.cover_image}
                alt={selectedPlace.name}
                fill
                sizes="(max-width: 640px) 90vw, 400px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-600/90 backdrop-blur-xs">
                  {categories.find((c: Category) => c.id === selectedPlace.category_id)?.name}
                </span>
                <div className="flex items-center text-xs text-amber-300 font-black">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 mr-1" />
                  {selectedPlace.rating} ({selectedPlace.review_count})
                </div>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1">
                {selectedPlace.name.replace(/\[Minh Họa\]\s*/g, '')}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                {selectedPlace.address}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                  {selectedPlace.price_label}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => addToItinerary(selectedPlace)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-2xs transition-all"
                  >
                    + Lịch trình
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
        )}

        {/* 3. MAP CONTROLS FLOATING BAR */}
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2.5">
          {/* Layer switcher: Đường bộ / Địa hình / Vệ tinh */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-soft-xl border border-slate-200/80 p-1 flex flex-col gap-1 text-[11px] font-bold text-slate-700">
            <button
              onClick={() => setMapLayer('standard')}
              className={`px-3 py-1.5 rounded-xl text-left transition-colors flex items-center gap-1.5 ${
                mapLayer === 'standard'
                  ? 'bg-teal-600 text-white shadow-soft-sm font-extrabold'
                  : 'hover:bg-slate-100'
              }`}
            >
              <span>Đường bộ (Google Maps)</span>
            </button>
            <button
              onClick={() => setMapLayer('terrain')}
              className={`px-3 py-1.5 rounded-xl text-left transition-colors flex items-center gap-1.5 ${
                mapLayer === 'terrain'
                  ? 'bg-teal-600 text-white shadow-soft-sm font-extrabold'
                  : 'hover:bg-slate-100'
              }`}
            >
              <span>Địa hình (Đồi núi Quảng Ngãi)</span>
            </button>
            <button
              onClick={() => setMapLayer('satellite')}
              className={`px-3 py-1.5 rounded-xl text-left transition-colors flex items-center gap-1.5 ${
                mapLayer === 'satellite'
                  ? 'bg-teal-600 text-white shadow-soft-sm font-extrabold'
                  : 'hover:bg-slate-100'
              }`}
            >
              <span>Vệ tinh & Địa danh thật</span>
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-teal-700 hover:bg-slate-50 shadow-soft-xl border border-slate-200/80 transition-colors self-end"
            title={isFullscreen ? 'Thu nhỏ giao diện' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Map Legend (Bottom Right) */}
        <div className="hidden sm:flex absolute bottom-4 right-4 z-30 bg-slate-950/85 backdrop-blur-md border border-slate-800 text-white px-3.5 py-2 rounded-2xl text-[11px] items-center gap-3 shadow-soft-xl">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <span>Địa danh Quảng Ngãi</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Chặng lộ trình</span>
          </div>
          <div className="text-slate-400 border-l border-slate-700 pl-3">
            Bản đồ số thực tế OpenStreetMap / Esri
          </div>
        </div>
      </div>
    </div>
  );
}
