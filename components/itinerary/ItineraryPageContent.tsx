'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Route,
  ArrowUp,
  ArrowDown,
  Trash2,
  Navigation,
  CheckCircle2,
  Map,
  ChevronRight,
  ChevronDown,
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

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-teal-300 p-8 text-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-bold">Đang tải bản đồ lộ trình...</span>
    </div>
  ),
});

export default function ItineraryPageContent() {
  const { places, categories } = useData();

  // Selected sequential stops for the itinerary
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>(() => {
    // Default: Lý Sơn Tour (pl-001, pl-006, pl-007, pl-011)
    const initial = places.filter((p) => p.district_id === 'dist-ly-son').slice(0, 4);
    return initial.length > 0 ? initial : places.slice(0, 4);
  });

  const [activeStepPlace, setActiveStepPlace] = useState<Place | null>(selectedPlaces[0] || null);
  const [mobileTab, setMobileTab] = useState<'stops' | 'map'>('stops');

  // Statistics
  const totalDistance = useMemo(() => calculateTotalRouteDistance(selectedPlaces), [selectedPlaces]);
  const estimatedHours = useMemo(() => {
    if (selectedPlaces.length === 0) return 0;
    const travelTime = totalDistance / 35; // ~35km/h in VN
    const visitingTime = selectedPlaces.length * 1.8;
    return Number((travelTime + visitingTime).toFixed(1));
  }, [selectedPlaces, totalDistance]);

  // Add place
  const handleAddPlace = (placeId: string) => {
    const found = places.find((p) => p.id === placeId);
    if (!found) return;
    if (selectedPlaces.some((p) => p.id === found.id)) {
      alert('Địa điểm này đã có trong lịch trình của bạn!');
      return;
    }
    setSelectedPlaces([...selectedPlaces, found]);
  };

  // Remove place
  const handleRemovePlace = (placeId: string) => {
    setSelectedPlaces(selectedPlaces.filter((p) => p.id !== placeId));
  };

  // Move place in order
  const handleMove = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= selectedPlaces.length) return;
    const next = [...selectedPlaces];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setSelectedPlaces(next);
  };

  // Preset Tour: Lý Sơn 2 Ngày 1 Đêm
  const handlePresetLySon = () => {
    const lySon = places.filter((p) => p.district_id === 'dist-ly-son').slice(0, 4);
    setSelectedPlaces(lySon);
    setActiveStepPlace(lySon[0] || null);
  };

  // Preset Tour: Di Sản & Danh Thắng
  const handlePresetHeritage = () => {
    const items = places
      .filter((p) => p.district_id === 'dist-tp-quang-ngai' || p.district_id === 'dist-kon-tum')
      .slice(0, 4);
    setSelectedPlaces(items);
    setActiveStepPlace(items[0] || null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-12 space-y-5 sm:space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Route className="w-3.5 h-3.5" />
            <span>Công Cụ Du Lịch Thông Minh</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Lập Lịch Trình Tour & Chỉ Dẫn Trực Quan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Chọn các điểm đến theo thứ tự mong muốn, hệ thống sẽ tự động tính toán tổng cự ly và chỉ dẫn trực quan trên bản đồ số
          </p>
        </div>

        {/* Preset Tour Quick Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePresetLySon}
            className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200/80 transition-colors shadow-soft-sm active:scale-95"
          >
            Tour Mẫu: Đảo Lý Sơn
          </button>
          <button
            onClick={handlePresetHeritage}
            className="flex-1 sm:flex-none text-center px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200/80 transition-colors shadow-soft-sm active:scale-95"
          >
            Tour Mẫu: Sông Trà & Biển Mỹ Khê
          </button>
        </div>
      </div>

      {/* Statistics Highlights Cards - Compact 2-column grid on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-0.5 sm:space-y-1">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
            Tổng số điểm dừng
          </div>
          <div className="text-xl sm:text-3xl font-black text-teal-700">
            {selectedPlaces.length} <span className="text-xs sm:text-sm font-semibold text-slate-400">địa điểm</span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-0.5 sm:space-y-1">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
            Tổng quãng đường
          </div>
          <div className="text-xl sm:text-3xl font-black text-emerald-600">
            ~ {totalDistance} <span className="text-xs sm:text-sm font-semibold text-slate-400">km</span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-0.5 sm:space-y-1">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 truncate">
            Thời gian ước tính
          </div>
          <div className="text-xl sm:text-3xl font-black text-amber-500">
            ~ {estimatedHours} <span className="text-xs sm:text-sm font-semibold text-slate-400">giờ</span>
          </div>
        </div>

        <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white shadow-soft-xl flex flex-col justify-between">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-100 truncate">
            Bản Đồ Google Maps
          </div>
          <a
            href={buildGoogleMapsRouteUrl(selectedPlaces)}
            target="_blank"
            rel="noreferrer"
            className="py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-white mt-1.5 sm:mt-2"
          >
            <Navigation className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Chỉ đường toàn tuyến</span>
          </a>
        </div>
      </div>

      {/* Mobile Tab Switcher: [Lộ trình từng chặng] vs [Bản đồ chỉ dẫn] */}
      <div className="lg:hidden sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-slate-200/80">
        <div className="grid grid-cols-2 p-1 bg-slate-200/90 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setMobileTab('stops')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              mobileTab === 'stops'
                ? 'bg-white text-teal-800 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Route className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="truncate">Lộ trình ({selectedPlaces.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              mobileTab === 'map'
                ? 'bg-white text-teal-800 shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="truncate">Bản đồ chỉ dẫn</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Interface: Left Itinerary Stops + Right Live Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Itinerary Sequence & Selector (5 cols on lg, toggleable on mobile) */}
        <div className={`lg:col-span-5 min-w-0 space-y-6 ${mobileTab === 'stops' ? 'block' : 'hidden lg:block'}`}>
          {/* Add Stop Selector */}
          <div className="p-3.5 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-soft space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
              + Thêm một điểm dừng vào hành trình:
            </label>
            <div className="relative w-full min-w-0">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddPlace(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="w-full min-w-0 max-w-full px-3.5 py-2.5 pr-9 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-teal-500 appearance-none truncate cursor-pointer"
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
              <ChevronDown className="w-4 h-4 text-teal-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sequential Stops */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                Lộ Trình Từng Chặng ({selectedPlaces.length} điểm)
              </h3>
              {selectedPlaces.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedPlaces([])}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {selectedPlaces.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-2">
                <Route className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-bold text-slate-700">Chưa có địa điểm nào trong lịch trình</p>
                <p>Hãy chọn điểm đến ở ô trên hoặc bấm vào các nút Tour mẫu!</p>
              </div>
            ) : (
              selectedPlaces.map((place, idx) => {
                const nextPlace = selectedPlaces[idx + 1];
                const legDistance = nextPlace
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
                    <div
                      onClick={() => setActiveStepPlace(place)}
                      className={`p-3 sm:p-4 bg-white rounded-2xl sm:rounded-3xl border transition-all cursor-pointer ${
                        activeStepPlace?.id === place.id
                          ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-soft-xl'
                          : 'border-slate-200/80 hover:border-slate-300 shadow-soft-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Information Row */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Number Badge */}
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl bg-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-soft-sm">
                            {idx + 1}
                          </div>

                          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                            <Image
                              src={place.cover_image}
                              alt={place.name}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 text-sm truncate">
                              {place.name.replace(/\[Minh Họa\]\s*/g, '')}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {place.address}
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                              {place.price_label}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Controls (Up, Down, Google Maps navigate, Trash) */}
                        <div className="hidden sm:flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(idx, 'up');
                            }}
                            disabled={idx === 0}
                            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 flex items-center justify-center transition-colors"
                            title="Di chuyển lên trước"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMove(idx, 'down');
                            }}
                            disabled={idx === selectedPlaces.length - 1}
                            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 flex items-center justify-center transition-colors"
                            title="Di chuyển xuống sau"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-xl text-teal-600 hover:bg-teal-50 flex items-center justify-center transition-colors"
                            title="Chỉ đường Google Maps đến địa điểm này"
                          >
                            <Navigation className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePlace(place.id);
                            }}
                            className="w-8 h-8 rounded-xl text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors"
                            title="Xóa điểm này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile Action Buttons Bar (Thumb-friendly touch targets with minimum 40px height) */}
                      <div
                        className="sm:hidden grid grid-cols-4 gap-2 pt-2.5 mt-2.5 border-t border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          disabled={idx === 0}
                          className="h-10 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-700 disabled:opacity-25 flex items-center justify-center gap-1 text-xs font-bold active:scale-95 transition-all shadow-2xs"
                          aria-label="Di chuyển lên trước"
                        >
                          <ArrowUp className="w-4 h-4" />
                          <span className="text-[11px]">Lên</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          disabled={idx === selectedPlaces.length - 1}
                          className="h-10 rounded-xl bg-slate-100 active:bg-slate-200 text-slate-700 disabled:opacity-25 flex items-center justify-center gap-1 text-xs font-bold active:scale-95 transition-all shadow-2xs"
                          aria-label="Di chuyển xuống sau"
                        >
                          <ArrowDown className="w-4 h-4" />
                          <span className="text-[11px]">Xuống</span>
                        </button>

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="h-10 rounded-xl bg-teal-50 active:bg-teal-100 text-teal-800 border border-teal-200/60 flex items-center justify-center gap-1 text-xs font-bold active:scale-95 transition-all shadow-2xs"
                          title="Chỉ đường Google Maps"
                          aria-label="Chỉ đường Google Maps"
                        >
                          <Navigation className="w-3.5 h-3.5 text-teal-600" />
                          <span className="text-[11px]">GPS</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleRemovePlace(place.id)}
                          className="h-10 rounded-xl bg-rose-50 active:bg-rose-100 text-rose-700 border border-rose-200/60 flex items-center justify-center gap-1 text-xs font-bold active:scale-95 transition-all shadow-2xs"
                          title="Xóa điểm này"
                          aria-label="Xóa điểm này"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span className="text-[11px]">Xóa</span>
                        </button>
                      </div>
                    </div>

                    {/* Leg distance info */}
                    {legDistance !== null && (
                      <div className="flex items-center gap-2 pl-3 sm:pl-8 py-1 text-xs font-bold text-teal-800">
                        <div className="w-0.5 h-5 bg-teal-400 border-l border-dashed shrink-0" />
                        <span className="bg-teal-50/80 px-2.5 py-1 rounded-lg border border-teal-200/80 text-[10px] sm:text-[11px] leading-tight">
                          Chặng {idx + 1} → {idx + 2}: ~ {legDistance} km (~{Math.round((legDistance / 35) * 60)} phút di chuyển)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Interactive Route Map Visualizer (7 cols on lg, toggleable on mobile) */}
        <div className={`lg:col-span-7 min-w-0 lg:sticky lg:top-24 space-y-4 ${mobileTab === 'map' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-black text-slate-900 text-xs sm:text-sm min-w-0">
              <Map className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="truncate">Bản Đồ Chỉ Dẫn Lộ Trình Tour Trực Quan</span>
            </div>
            <Link
              href="/map"
              className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Xem trên bản đồ lớn</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Leaflet Map Frame with Route Polyline */}
          <div className="relative w-full h-[380px] sm:h-[440px] lg:h-auto lg:aspect-16/11 lg:min-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200 shadow-soft-xl bg-slate-900">
            <LeafletMap
              places={places}
              selectedPlace={activeStepPlace}
              onSelectPlace={(p) => setActiveStepPlace(p)}
              itineraryPlaces={selectedPlaces}
              mapLayer="standard"
            />
          </div>

          {/* Guidance Tips */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-teal-50 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-2.5 sm:gap-3">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Lưu ý hành trình:</strong> Bản đồ nối liền các điểm thứ tự bằng nét đứt xanh và số thứ tự chặng (1, 2, 3...). Bạn có thể bấm nút &quot;Chỉ đường toàn tuyến&quot; hoặc nút &quot;GPS&quot; ở từng chặng để dẫn đường bằng Google Maps.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}