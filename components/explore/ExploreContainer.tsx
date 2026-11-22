'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { Category, District } from '@/types';
import { useData } from '@/context/DataContext';
import PlaceCard from '@/components/place/PlaceCard';

const ITEMS_PER_PAGE = 6;

type SortOption = 'featured' | 'rating-desc' | 'reviews-desc' | 'name-asc';

export default function ExploreContainer() {
  const searchParams = useSearchParams();
  const { places, categories, districts } = useData();

  // Read initial filter values from URL search params
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'all');
  const [district, setDistrict] = useState(() => searchParams.get('district') || 'all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Reset to page 1 whenever filters change
  const handleFilterChange = (updater: () => void) => {
    updater();
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setDistrict('all');
    setPriceRange('all');
    setMinRating(0);
    setSortBy('featured');
    setCurrentPage(1);
  };

  // Filter and sort places
  const filteredAndSortedPlaces = useMemo(() => {
    let result = places.filter((p) => {
      // Search keyword
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchDesc = p.description.toLowerCase().includes(query);
        const matchAddress = p.address.toLowerCase().includes(query);
        const matchTags = p.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchAddress && !matchTags) return false;
      }

      // Category
      if (category !== 'all' && p.category_id !== category) return false;

      // District
      if (district !== 'all' && p.district_id !== district) return false;

      // Price range
      if (priceRange !== 'all' && p.price_range !== priceRange) return false;

      // Rating
      if (minRating > 0 && p.rating < minRating) return false;

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'reviews-desc') return b.review_count - a.review_count;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      // 'featured'
      if (a.is_featured === b.is_featured) return b.rating - a.rating;
      return a.is_featured ? -1 : 1;
    });

    return result;
  }, [places, search, category, district, priceRange, minRating, sortBy]);

  // Pagination calculation
  const totalItems = filteredAndSortedPlaces.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedPlaces = filteredAndSortedPlaces.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFiltersCount = [
    category !== 'all',
    district !== 'all',
    priceRange !== 'all',
    minRating > 0,
    search.trim() !== '',
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
      {/* Header & Title */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
              Khám Phá Toàn Diện
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Danh Sách Địa Điểm Du Lịch
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Khám phá hệ sinh thái du lịch đa dạng của tỉnh Non Xanh với bộ lọc trực quan
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dạng lưới"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Dạng danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 text-white text-xs font-medium"
            >
              <Filter className="w-4 h-4" />
              <span>Bộ lọc ({activeFiltersCount})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 1. DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-teal-600" />
                <span>Bộ Lọc Nâng Cao</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Từ khóa
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
                  placeholder="Tên hoặc từ khóa..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Danh mục
              </label>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleFilterChange(() => setCategory('all'))}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                    category === 'all'
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Tất cả danh mục</span>
                  <span className="text-[11px] text-slate-400">{places.length}</span>
                </button>
                {categories.map((cat: Category) => (
                  <button
                    key={cat.id}
                    onClick={() => handleFilterChange(() => setCategory(cat.id))}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      category === cat.id
                        ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[11px] text-slate-400">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Khu vực địa lý
              </label>
              <select
                value={district}
                onChange={(e) => handleFilterChange(() => setDistrict(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:border-teal-500 focus:bg-white"
              >
                <option value="all">Toàn bộ tỉnh Non Xanh</option>
                {districts.map((d: District) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mức chi phí
              </label>
              <select
                value={priceRange}
                onChange={(e) => handleFilterChange(() => setPriceRange(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:border-teal-500 focus:bg-white"
              >
                <option value="all">Tất cả mức giá</option>
                <option value="free">Miễn phí vé tham quan</option>
                <option value="budget">Tiết kiệm (&lt; 100.000đ)</option>
                <option value="moderate">Trung bình (100k - 500k)</option>
                <option value="luxury">Cao cấp (&gt; 500.000đ)</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Đánh giá tối thiểu
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {[0, 4.6, 4.8].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => handleFilterChange(() => setMinRating(stars))}
                    className={`py-1.5 px-2 rounded-lg text-center font-medium transition-colors ${
                      minRating === stars
                        ? 'bg-amber-500 text-white font-semibold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {stars === 0 ? 'Tất cả' : `★ ${stars}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* 2. MAIN CONTENT AREA */}
        <main className="lg:col-span-3 space-y-6">
          {/* Active Filter Indicators & Sorting Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-600 font-medium">
              Hiển thị{' '}
              <strong className="text-slate-900 font-bold">
                {totalItems === 0
                  ? 0
                  : `${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      totalItems
                    )}`}
              </strong>{' '}
              trên tổng số <strong className="text-slate-900 font-bold">{totalItems}</strong> địa điểm
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-hidden focus:border-teal-500"
              >
                <option value="featured">Nổi bật nhất</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
                <option value="reviews-desc">Nhiều đánh giá nhất</option>
                <option value="name-asc">Tên (A đến Z)</option>
              </select>
            </div>
          </div>

          {/* Places Grid / List */}
          {paginatedPlaces.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">
                Không tìm thấy địa điểm phù hợp
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Không có kết quả nào khớp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn. Vui lòng thử từ khóa khác hoặc đặt lại bộ lọc.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt lại tất cả bộ lọc</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} viewMode="list" />
              ))}
            </div>
          )}

          {/* 3. PAGINATION BAR */}
          {totalPages > 1 && (
            <div className="pt-6 flex items-center justify-between border-t border-slate-200">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trang trước</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                  <span>Bộ Lọc Địa Điểm</span>
                </div>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Từ khóa
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tên địa danh..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              {/* Mobile Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Danh mục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((c: Category) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Khu vực
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200"
                >
                  <option value="all">Toàn bộ tỉnh</option>
                  {districts.map((d: District) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
