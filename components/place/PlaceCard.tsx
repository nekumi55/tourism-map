'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Navigation } from 'lucide-react';
import { Place } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { DISTRICTS } from '@/data/districts';
import RatingStars from '@/components/common/RatingStars';
import Badge from '@/components/common/Badge';

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
      <div className="group">
        <article className="atlas-card overflow-hidden flex flex-col sm:flex-row">
          <Link
            href={`/places/${place.id}`}
            className="sm:w-64 sm:shrink-0 relative overflow-hidden h-48 sm:h-auto bg-[var(--bg-surface-muted)] min-h-[192px] block"
          >
            <Image
              src={place.cover_image}
              alt={cleanName}
              fill
              sizes="(max-width: 640px) 100vw, 256px"
              className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-[var(--motion-ease-out)]"
            />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <Badge variant="outline" size="sm" className="font-semibold">
              {category?.name || 'Du lịch'}
            </Badge>
          </div>
          {place.is_featured && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#F59E0B] text-[#16201D] text-xs font-bold">
                Tiêu biểu
              </span>
            </div>
          )}
        </Link>

        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <RatingStars rating={place.rating} reviews={place.review_count} size="sm" />
              <span className="text-xs font-semibold text-[#0E563B] bg-[#E5F2EC] px-2.5 py-0.5 rounded-md border border-[#0E563B]/15">
                {place.is_open_now ? 'Đang mở cửa' : 'Tạm đóng cửa'}
              </span>
            </div>

            <Link href={`/places/${place.id}`} className="inline-block max-w-full">
              <h3 className="font-sans font-bold text-lg sm:text-xl tracking-tight text-[var(--ink-primary)] group-hover:text-[var(--accent-jade)] transition-colors line-clamp-1">
                {cleanName}
              </h3>
            </Link>

            <p className="mt-1.5 text-xs text-[var(--ink-muted)] flex items-center gap-1.5 font-normal">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
              <span className="line-clamp-1">{place.address}</span>
            </p>

            <p className="mt-2.5 text-sm text-[var(--ink-secondary)] font-normal line-clamp-2 leading-relaxed">
              {place.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-2.5 py-1.5 rounded-md truncate min-w-0 max-w-[160px] sm:max-w-xs">
              {place.price_label}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/map?placeId=${place.id}`}
                className="ui-interactive-press min-h-11 px-3 text-[var(--ink-secondary)] hover:text-[var(--accent-jade)] hover:bg-[var(--accent-jade-soft)]/60 rounded-lg text-xs inline-flex items-center gap-1.5 font-semibold"
                title="Xem trên bản đồ"
              >
                <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Bản đồ</span>
              </Link>
              <Link
                href={`/places/${place.id}`}
                className="ui-interactive-press min-h-11 px-4 bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] rounded-lg text-xs font-semibold inline-flex items-center"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
        </article>
      </div>
    );
  }

  // Grid Card Mode
  return (
    <div className="group h-full">
      <article className="atlas-card overflow-hidden flex flex-col h-full">
        <Link
          href={`/places/${place.id}`}
          className="relative aspect-4/3 w-full overflow-hidden bg-[var(--bg-surface-muted)] block"
        >
          <Image
            src={place.cover_image}
            alt={cleanName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-[var(--motion-ease-out)]"
          />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111A18]/80 via-[#111A18]/15 to-transparent" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge variant="outline" size="sm" className="font-semibold">
            {category?.name || 'Du lịch'}
          </Badge>
          {place.is_featured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#F59E0B] text-[#16201D] text-xs font-bold">
              Tiêu biểu
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 text-[#FFFDF9] text-xs">
          <div className="flex items-center gap-1.5 font-medium min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#A3D9CE] shrink-0" aria-hidden="true" />
            <span className="truncate">{district?.name}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-semibold shrink-0 ${
              place.is_open_now
                ? 'bg-[#0D5C53] text-[#FFFDF9]'
                : 'bg-[#1A2623] text-[#E5E0D5]'
            }`}
          >
            {place.is_open_now ? 'Mở cửa' : 'Đóng cửa'}
          </span>
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-2">
            <RatingStars rating={place.rating} reviews={place.review_count} size="sm" />
          </div>

          <Link href={`/places/${place.id}`} className="block">
            <h3 className="font-sans font-bold text-base sm:text-lg tracking-tight text-[var(--ink-primary)] group-hover:text-[var(--accent-jade)] transition-colors line-clamp-1">
              {cleanName}
            </h3>
          </Link>

          <p className="mt-2 text-sm text-[var(--ink-secondary)] font-normal line-clamp-2 leading-relaxed">
            {place.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {place.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-[var(--bg-surface-muted)] text-[var(--ink-secondary)] px-2 py-0.5 rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-2.5 py-1.5 rounded-md truncate max-w-[155px]">
            {place.price_label}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href={`/map?placeId=${place.id}`}
              className="ui-interactive-press min-h-11 min-w-11 px-2.5 text-[var(--ink-secondary)] hover:text-[var(--accent-jade)] hover:bg-[var(--accent-jade-soft)]/60 rounded-lg flex items-center justify-center"
              title="Định vị trên bản đồ"
              aria-label={`Định vị ${cleanName} trên bản đồ`}
            >
              <Navigation className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href={`/places/${place.id}`}
              className="ui-interactive-press min-h-11 px-3.5 bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] rounded-lg text-xs font-semibold inline-flex items-center"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
      </article>
    </div>
  );
}
