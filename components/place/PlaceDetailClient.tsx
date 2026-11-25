'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Phone,
  Globe,
  Sparkles,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Compass,
  Edit3,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Place } from '@/types';
import PlaceGallery from '@/components/place/PlaceGallery';
import PlaceCard from '@/components/place/PlaceCard';
import RatingStars from '@/components/common/RatingStars';
import Badge from '@/components/common/Badge';

interface PlaceDetailClientProps {
  initialPlace: Place;
}

export default function PlaceDetailClient({ initialPlace }: PlaceDetailClientProps) {
  const { places, categories, districts } = useData();

  // Find dynamic place from DataContext if modified by Admin
  const place = places.find((p) => p.id === initialPlace.id) || initialPlace;

  const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');
  const category = categories.find((c) => c.id === place.category_id);
  const district = districts.find((d) => d.id === place.district_id);
  const relatedPlaces = places
    .filter(
      (p) =>
        p.id !== place.id &&
        (p.category_id === place.category_id || p.district_id === place.district_id)
    )
    .slice(0, 3);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* 1. BREADCRUMBS */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-teal-700 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link href="/explore" className="hover:text-teal-700 transition-colors">
              Khám phá
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link
              href={`/explore?category=${category?.id}`}
              className="hover:text-teal-700 transition-colors"
            >
              {category?.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-xs">
              {cleanName}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* 2. GALLERY */}
        <PlaceGallery images={place.gallery} placeName={place.name} />

        {/* 3. MAIN HEADER & DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Metadata */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="md">
                  {category?.name}
                </Badge>
                <Badge variant="outline" size="md">
                  <MapPin className="w-3 h-3 text-teal-600" />
                  {district?.name}
                </Badge>
                {place.is_featured && (
                  <Badge variant="accent" size="md">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Nổi bật
                  </Badge>
                )}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    place.is_open_now
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {place.is_open_now ? 'Đang mở cửa' : 'Tạm đóng cửa'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {cleanName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-1">
                <RatingStars rating={place.rating} reviews={place.review_count} size="md" />
                <span className="text-slate-300">|</span>
                <span className="font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                  {place.price_label}
                </span>
              </div>

              <div className="pt-2 text-xs text-slate-500 flex items-center gap-1.5 border-t border-slate-100">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>{place.address}</span>
              </div>
            </div>

            {/* Description & Story */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Giới Thiệu Tổng Quan
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                {place.description}
              </p>
              <div className="text-slate-600 text-sm sm:text-base leading-relaxed pt-2 border-t border-slate-100">
                {place.content}
              </div>
            </div>

            {/* Highlights Section */}
            {place.highlights && place.highlights.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Trải Nghiệm & Điểm Nhấn Nổi Bật</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {place.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100/80 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            {place.tips && place.tips.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-teal-600" />
                  <span>Kinh Nghiệm & Lưu Ý Khi Tham Quan</span>
                </h2>
                <ul className="space-y-2.5 pt-1 text-xs sm:text-sm text-slate-600">
                  {place.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-2" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amenities Section */}
            {place.amenities && place.amenities.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Tiện Ích & Dịch Vụ Có Sẵn
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {place.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ACTION & LOCATION WIDGET */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                Thông Tin Chi Tiết
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-800">Giờ hoạt động</div>
                    <div className="text-slate-500 mt-0.5">{place.opening_hours}</div>
                  </div>
                </div>

                {place.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800">Điện thoại liên hệ</div>
                      <div className="text-slate-500 mt-0.5">{place.phone}</div>
                    </div>
                  </div>
                )}

                {place.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-800">Trang thông tin</div>
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-teal-600 hover:underline mt-0.5 inline-block break-all"
                      >
                        {place.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <Link
                  href={`/map?placeId=${place.id}`}
                  className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 transition-all active:scale-95"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Xem vị trí trên Bản Đồ Số</span>
                </Link>

                <Link
                  href="/admin"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-amber-200"
                >
                  <Edit3 className="w-4 h-4 text-amber-700" />
                  <span>Chỉnh sửa thông tin (Admin CMS)</span>
                </Link>

                <Link
                  href="/explore"
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Compass className="w-4 h-4" />
                  <span>Khám phá địa điểm khác</span>
                </Link>
              </div>
            </div>

            {/* MINI MAP & GPS WIDGET */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>Tọa Độ Định Vị GPS</span>
                </h3>
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  Mô phỏng
                </span>
              </div>

              {/* Mini Map Graphic Representation */}
              <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center p-4 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/40 mb-2">
                    <Navigation className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="font-mono text-xs text-white font-semibold">
                    Lat: {place.latitude.toFixed(4)}°N
                  </div>
                  <div className="font-mono text-xs text-teal-300 font-semibold">
                    Lng: {place.longitude.toFixed(4)}°E
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-relaxed">
                Tọa độ GPS sẵn sàng chuyển tiếp vào ứng dụng Google Maps hoặc hệ cơ sở dữ liệu không gian Supabase PostGIS.
              </div>
            </div>
          </div>
        </div>

        {/* 4. RELATED PLACES */}
        {relatedPlaces.length > 0 && (
          <div className="pt-10 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Địa Điểm Lân Cận & Cùng Danh Mục
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Gợi ý điểm dừng chân tiếp theo cho lịch trình của bạn
                </p>
              </div>
              <Link
                href="/explore"
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPlaces.map((relPlace) => (
                <PlaceCard key={relPlace.id} place={relPlace} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
