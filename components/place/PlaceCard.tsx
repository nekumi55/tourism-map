'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Navigation, Sparkles } from 'lucide-react';
import { Place } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { DISTRICTS } from '@/data/districts';
import RatingStars from '@/components/common/RatingStars';
import Badge from '@/components/common/Badge';
import SpotlightCard from '@/components/ui/SpotlightCard/SpotlightCard';

interface PlaceCardProps {
  place: Place;
  viewMode?: 'grid' | 'list';
}

export default function PlaceCard({ place, viewMode = 'grid' }: PlaceCardProps) {
  const category = CATEGORIES.find((c) => c.id === place.category_id);
  const district = DISTRICTS.find((d) => d.id === place.district_id);
  const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');

  if (viewMode === 'list') {
    return (
      <SpotlightCard
        theme="light"
        spotlightColor="rgba(20, 184, 166, 0.2)"
        intensity={0.5}
        className="group !p-0 bg-white rounded-3xl border border-slate-200/80 hover:border-teal-500/50 shadow-soft hover:shadow-soft-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
      >
        <div className="sm:w-64 sm:shrink-0 relative overflow-hidden h-48 sm:h-auto bg-slate-100 min-h-[192px]">
          <Image
            src={place.cover_image}
            alt={cleanName}
            fill
            sizes="(max-width: 640px) 100vw, 256px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="outline" size="sm" className="bg-white/95 font-bold shadow-2xs backdrop-blur-md">
              {category?.name || 'Du lịch'}
            </Badge>
          </div>
          {place.is_featured && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="accent" size="sm" className="bg-amber-500 text-slate-950 border-0 font-black shadow-soft-sm">
                <Sparkles className="w-3 h-3" /> Nổi bật
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <RatingStars rating={place.rating} reviews={place.review_count} size="sm" />
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                {place.is_open_now ? 'Đang mở cửa' : 'Tạm đóng cửa'}
              </span>
            </div>

            <Link href={`/places/${place.id}`}>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
                {cleanName}
              </h3>
            </Link>

            <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="line-clamp-1">{place.address}</span>
            </p>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {place.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg truncate min-w-0 max-w-[150px] sm:max-w-xs">
              {place.price_label}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/map?placeId=${place.id}`}
                className="p-2 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-xl transition-colors text-xs flex items-center gap-1 font-bold"
                title="Xem trên bản đồ"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Bản đồ</span>
              </Link>
              <Link
                href={`/places/${place.id}`}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-soft-sm hover:shadow-soft"
              >
                Chi tiết
              </Link>
            </div>
          </div>
        </div>
      </SpotlightCard>
    );
  }

  // Grid Card Mode
  return (
    <SpotlightCard
      theme="light"
      spotlightColor="rgba(20, 184, 166, 0.2)"
      intensity={0.5}
      className="group !p-0 bg-white rounded-3xl border border-slate-200/80 hover:border-teal-500/50 shadow-soft hover:shadow-soft-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
        <Image
          src={place.cover_image}
          alt={cleanName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-90" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge variant="outline" size="sm" className="bg-white/95 text-slate-900 font-extrabold shadow-soft-sm backdrop-blur-md">
            {category?.name || 'Du lịch'}
          </Badge>
          {place.is_featured && (
            <Badge variant="accent" size="sm" className="bg-amber-500 text-slate-950 border-0 font-black shadow-soft-sm">
              <Sparkles className="w-3 h-3" /> Nổi bật
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 drop-shadow-md font-semibold">
            <MapPin className="w-3.5 h-3.5 text-teal-300" />
            <span className="truncate max-w-[160px]">{district?.name}</span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-md ${
            place.is_open_now
              ? 'bg-emerald-500/90 text-white'
              : 'bg-slate-700/90 text-slate-200'
          }`}>
            {place.is_open_now ? 'Mở cửa' : 'Đóng cửa'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-2">
            <RatingStars rating={place.rating} reviews={place.review_count} size="sm" />
          </div>

          <Link href={`/places/${place.id}`}>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1">
              {cleanName}
            </h3>
          </Link>

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {place.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg truncate max-w-[150px]">
            {place.price_label}
          </span>
          <div className="flex items-center gap-1.5">
            <Link
              href={`/map?placeId=${place.id}`}
              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
              title="Định vị trên bản đồ"
            >
              <Navigation className="w-4 h-4" />
            </Link>
            <Link
              href={`/places/${place.id}`}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-soft-sm hover:shadow-soft"
            >
              Xem ngay
            </Link>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
