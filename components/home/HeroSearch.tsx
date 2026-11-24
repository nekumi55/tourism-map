'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  MapPin,
  Grid,
  ArrowRight,
  ChevronDown,
  X,
  Star,
  Map,
  Compass,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { matchSearchKeyword } from '@/utils/vietnamese';
import { Place } from '@/types';

export default function HeroSearch() {
  const router = useRouter();
  const { places, categories, districts } = useData();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Filter suggested places in real-time as user types
  const suggestedPlaces = useMemo(() => {
    const q = keyword.trim();
    if (!q) return [];

    return places
      .filter((p) => {
        const matchName = matchSearchKeyword(p.name, q);
        const matchAddress = matchSearchKeyword(p.address, q);
        const matchTags = p.tags.some((t) => matchSearchKeyword(t, q));
        const matchDesc = matchSearchKeyword(p.description, q);
        const matchCat = !category || p.category_id === category;
        const matchDist = !district || p.district_id === district;

        return (matchName || matchAddress || matchTags || matchDesc) && matchCat && matchDist;
      })
      .slice(0, 5);
  }, [places, keyword, category, district]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (category) params.set('category', category);
    if (district) params.set('district', district);

    router.push(`/explore?${params.toString()}`);
  };

  const handleSelectPlace = (place: Place) => {
    setIsDropdownOpen(false);
    router.push(`/places/${place.id}`);
  };

  const handleOpenOnMap = (e: React.MouseEvent, place: Place) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    router.push(`/map?placeId=${place.id}`);
  };

  return (
    <div
      ref={searchContainerRef}
      className={`w-full max-w-4xl relative ${isDropdownOpen ? 'z-50' : 'z-20'}`}
    >
      <form
        onSubmit={handleSearch}
        className="w-full bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/40 flex flex-col md:flex-row items-center gap-3 transition-all"
      >
        {/* Keyword input */}
        <div className="flex-1 w-full flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200 relative">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <div className="w-full">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Bạn muốn đi đâu?
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => {
                if (keyword.trim()) setIsDropdownOpen(true);
              }}
              placeholder="Nhập tên địa danh (Lý Sơn, Măng Đen, Sa Huỳnh...)"
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-hidden font-medium"
            />
          </div>
          {keyword && (
            <button
              type="button"
              onClick={() => {
                setKeyword('');
                setIsDropdownOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              title="Xóa từ khóa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category selector */}
        <div className="w-full md:w-52 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
          <Grid className="w-5 h-5 text-teal-600 shrink-0" />
          <div className="w-full relative">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Danh mục
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm text-slate-800 bg-transparent outline-hidden font-medium cursor-pointer appearance-none pr-6 hover:text-teal-700 transition-colors"
              >
                <option value="" className="text-slate-800 bg-white">
                  Tất cả danh mục
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-slate-800 bg-white">
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-teal-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* District selector */}
        <div className="w-full md:w-52 flex items-center gap-2.5 px-3 py-2">
          <MapPin className="w-5 h-5 text-teal-600 shrink-0" />
          <div className="w-full relative">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Khu vực
            </label>
            <div className="relative">
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-sm text-slate-800 bg-transparent outline-hidden font-medium cursor-pointer appearance-none pr-6 hover:text-teal-700 transition-colors"
              >
                <option value="" className="text-slate-800 bg-white">
                  Toàn bộ tỉnh
                </option>
                {districts.map((dist) => (
                  <option key={dist.id} value={dist.id} className="text-slate-800 bg-white">
                    {dist.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-teal-600 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full md:w-auto shrink-0 px-7 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <span>Tìm Kiếm</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
      {isDropdownOpen && keyword.trim().length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 w-full bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Gợi ý địa điểm khớp với: &quot;{keyword}&quot;</span>
            </span>
            <span className="text-[11px] text-teal-700 font-bold">
              {suggestedPlaces.length > 0 ? `${suggestedPlaces.length} gợi ý nhanh` : '0 kết quả'}
            </span>
          </div>

          {suggestedPlaces.length > 0 ? (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {suggestedPlaces.map((place) => {
                const cat = categories.find((c) => c.id === place.category_id);
                const dist = districts.find((d) => d.id === place.district_id);
                const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');

                return (
                  <div
                    key={place.id}
                    onClick={() => handleSelectPlace(place)}
                    className="p-3 hover:bg-teal-50/70 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-2xs">
                        <Image
                          src={place.cover_image}
                          alt={cleanName}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                          {cleanName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          {cat && (
                            <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded-md truncate">
                              {cat.name}
                            </span>
                          )}
                          <span className="truncate">{dist?.name || place.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center text-xs text-amber-500 font-bold mr-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-0.5" />
                        {place.rating}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleOpenOnMap(e, place)}
                        className="p-2 rounded-xl text-teal-600 hover:text-white hover:bg-teal-600 bg-teal-50 border border-teal-100 transition-colors shadow-2xs flex items-center gap-1 text-[11px] font-bold"
                        title="Xem vị trí trên bản đồ tương tác"
                      >
                        <Map className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Bản đồ</span>
                      </button>

                      <div className="p-2 rounded-xl text-slate-400 group-hover:text-teal-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* View all in explore button */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <span>Xem tất cả kết quả cho &quot;{keyword}&quot; trên trang Khám phá</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Không tìm thấy địa điểm nào khớp với &quot;{keyword}&quot;
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Gợi ý tìm kiếm nhanh:
              </p>
              <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 text-xs">
                {['Lý Sơn', 'Măng Đen', 'Thiên Ấn', 'Sơn Mỹ', 'Sa Huỳnh', 'Kon Tum', 'Sâm Ngọc Linh'].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setKeyword(tag);
                        setIsDropdownOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-100 hover:text-teal-800 text-slate-700 font-semibold transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
