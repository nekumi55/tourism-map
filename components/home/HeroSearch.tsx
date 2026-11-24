'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Grid, ArrowRight, ChevronDown } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function HeroSearch() {
  const router = useRouter();
  const { categories, districts } = useData();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (category) params.set('category', category);
    if (district) params.set('district', district);

    router.push(`/explore?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-4xl bg-white/95 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-2xl border border-white/40 flex flex-col md:flex-row items-center gap-3"
    >
      {/* Keyword input */}
      <div className="flex-1 w-full flex items-center gap-3 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200">
        <Search className="w-5 h-5 text-teal-600 shrink-0" />
        <div className="w-full">
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Bạn muốn đi đâu?
          </label>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tên bãi biển, di tích, ẩm thực..."
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-hidden font-medium"
          />
        </div>
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
              <option value="" className="text-slate-800 bg-white">Tất cả danh mục</option>
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
              <option value="" className="text-slate-800 bg-white">Toàn bộ tỉnh</option>
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
  );
}
