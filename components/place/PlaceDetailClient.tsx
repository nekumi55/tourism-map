'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Phone,
  Globe,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Compass,
  ExternalLink,
  Landmark,
  FileText,
  Calendar,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useData } from '@/context/DataContext';
import { SHOW_PLACE_RATINGS } from '@/data/settings';
import { Place } from '@/types';
import PlaceGallery from '@/components/place/PlaceGallery';
import PlaceCard from '@/components/place/PlaceCard';
import RatingStars from '@/components/common/RatingStars';
import Badge from '@/components/common/Badge';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface PlaceDetailClientProps {
  initialPlace: Place;
}

export default function PlaceDetailClient({ initialPlace }: PlaceDetailClientProps) {
  const { places, categories, districts } = useData();
  const containerRef = useRef<HTMLDivElement>(null);

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

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const runDetail = (reduced: boolean) => {
        const root = containerRef.current;
        if (!root) return;

        const gallery = root.querySelector('[data-detail-gallery]');
        const headerCard = root.querySelector('[data-detail-header]');
        const asideCards = root.querySelectorAll('[data-detail-aside-card]');
        const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (gallery) {
          introTl.from(
            gallery,
            { y: reduced ? 8 : 14, opacity: 0, duration: reduced ? 0.3 : 0.38, clearProps: 'transform,opacity' },
            0
          );
        }
        if (headerCard) {
          introTl.from(
            headerCard,
            { y: reduced ? 8 : 16, opacity: 0, duration: reduced ? 0.3 : 0.38, clearProps: 'transform,opacity' },
            0.08
          );
        }
        if (asideCards.length > 0) {
          introTl.from(
            asideCards,
            {
              y: reduced ? 8 : 14,
              opacity: 0,
              duration: reduced ? 0.28 : 0.36,
              stagger: 0.06,
              clearProps: 'transform,opacity',
            },
            0.12
          );
        }

        const highlights = root.querySelectorAll('[data-highlight-card]');
        const highlightsWrap = root.querySelector('[data-highlights-wrap]');
        if (highlightsWrap && highlights.length > 0) {
          gsap.from(highlights, {
            opacity: 0,
            y: reduced ? 6 : 12,
            duration: reduced ? 0.26 : 0.32,
            stagger: 0.04,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: highlightsWrap,
              start: 'top 86%',
              once: true,
            },
          });
        }

        const relatedSection = root.querySelector('[data-related-section]');
        const relatedCards = root.querySelectorAll('[data-related-card]');
        if (relatedSection && relatedCards.length > 0) {
          gsap.from(relatedCards, {
            opacity: 0,
            y: reduced ? 10 : 20,
            duration: reduced ? 0.32 : 0.42,
            stagger: 0.07,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: relatedSection,
              start: 'top 86%',
              once: true,
            },
          });
        }
      };

      mm.add('(prefers-reduced-motion: no-preference)', () => runDetail(false));
      mm.add('(prefers-reduced-motion: reduce)', () => runDetail(true));
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="bg-[var(--bg-canvas)] min-h-screen pb-20">
      {/* 1. BREADCRUMBS */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav
            aria-label="Đường dẫn trang"
            className="flex items-center gap-2 text-xs sm:text-sm text-[var(--ink-muted)] font-medium overflow-x-auto whitespace-nowrap"
          >
            <Link href="/" className="hover:text-[var(--accent-jade)] transition-colors py-1">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--border-strong)] shrink-0" aria-hidden="true" />
            <Link href="/explore" className="hover:text-[var(--accent-jade)] transition-colors py-1">
              Khám phá
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--border-strong)] shrink-0" aria-hidden="true" />
            <Link
              href={`/explore?category=${category?.id}`}
              className="hover:text-[var(--accent-jade)] transition-colors py-1"
            >
              {category?.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--border-strong)] shrink-0" aria-hidden="true" />
            <span className="text-[var(--ink-primary)] font-semibold truncate max-w-xs">
              {cleanName}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* 2. GALLERY */}
        <div data-detail-gallery>
          <PlaceGallery images={place.gallery} placeName={cleanName} />
        </div>

        {/* 3. MAIN HEADER & DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 min-w-0 space-y-6">
            {/* Title & Metadata */}
            <div data-detail-header className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="md">
                  {category?.name}
                </Badge>
                <Badge variant="outline" size="md">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-jade)]" aria-hidden="true" />
                  <span>{district?.name}</span>
                </Badge>
                {place.is_featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#F59E0B] text-[#16201D] text-xs font-bold">
                    Điểm tiêu biểu
                  </span>
                )}
                {place.recognition_level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-[var(--accent-ochre-soft)] text-[var(--accent-ochre-ink)] border border-[var(--accent-ochre)]/25 text-xs font-semibold">
                    {place.recognition_level}
                  </span>
                )}
                {place.region && (
                  <Badge variant="outline" size="md">
                    {place.region}
                  </Badge>
                )}
                <span
                  className={`text-xs px-3 py-1 rounded-md font-semibold ${
                    place.is_open_now
                      ? 'bg-[#E5F2EC] text-[#0E563B] border border-[#0E563B]/20'
                      : 'bg-[var(--bg-surface-muted)] text-[var(--ink-secondary)]'
                  }`}
                >
                  {place.is_open_now ? 'Đang mở cửa' : 'Tạm đóng cửa'}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink-primary)] tracking-[-0.02em] leading-tight">
                {cleanName}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-[var(--ink-secondary)] pt-1">
                {SHOW_PLACE_RATINGS && (
                  <>
                    <RatingStars rating={place.rating} reviews={place.review_count} size="md" />
                    <span className="hidden sm:inline text-[var(--border-strong)]" aria-hidden="true">
                      |
                    </span>
                  </>
                )}
                <span className="font-semibold text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-3 py-1 rounded-md text-xs sm:text-sm">
                  {place.price_label}
                </span>
              </div>

              <div className="pt-3 text-sm text-[var(--ink-secondary)] flex items-start gap-2 border-t border-[var(--border-subtle)] min-w-0">
                <MapPin className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="min-w-0">{place.address}</span>
              </div>
            </div>

            {/* Description & Story */}
            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--ink-primary)]">
                Giới Thiệu Địa Danh
              </h2>
              <p className="text-[var(--ink-primary)] text-base leading-relaxed font-medium">
                {place.description}
              </p>
              <div className="text-[var(--ink-secondary)] text-base leading-relaxed pt-3 border-t border-[var(--border-subtle)]">
                {place.content}
              </div>
            </div>

            {/* Highlights Section */}
            {place.highlights && place.highlights.length > 0 && (
              <div data-highlights-wrap className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--ink-primary)]">
                  Điểm Nhấn Trải Nghiệm
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {place.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      data-highlight-card
                      className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--ink-primary)] flex items-start gap-2.5"
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5"
                      />
                      <span className="min-w-0 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            {place.tips && place.tips.length > 0 && (
              <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--ink-primary)] flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[var(--accent-ochre)]" aria-hidden="true" />
                  <span>Lưu Ý Khi Tham Quan</span>
                </h2>
                <ul className="space-y-3 pt-1 text-sm sm:text-base text-[var(--ink-secondary)]">
                  {place.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent-jade)] shrink-0 mt-2.5"
                      />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Amenities Section */}
            {place.amenities && place.amenities.length > 0 && (
              <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--ink-primary)]">
                  Tiện Ích Tại Điểm Đến
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  {place.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] text-xs sm:text-sm font-medium inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-jade)]" aria-hidden="true" />
                      <span>{amenity}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: INFO & COORDINATES */}
          <aside className="min-w-0 space-y-6">
            <div data-detail-aside-card className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-5">
              <h2 className="font-serif font-semibold text-[var(--ink-primary)] text-lg pb-3 border-b border-[var(--border-subtle)]">
                Thông Tin Tham Quan
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Clock className="w-4.5 h-4.5 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[var(--ink-primary)]">Giờ mở cửa</div>
                    <div className="text-[var(--ink-secondary)] mt-0.5">{place.opening_hours}</div>
                  </div>
                </div>

                {place.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4.5 h-4.5 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--ink-primary)]">Điện thoại</div>
                      <div className="text-[var(--ink-secondary)] mt-0.5 tabular-nums">{place.phone}</div>
                    </div>
                  </div>
                )}

                {place.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-4.5 h-4.5 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--ink-primary)]">Trang thông tin</div>
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--accent-jade)] hover:underline mt-0.5 inline-block break-all"
                      >
                        {place.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2.5">
                {place.has_coordinates !== false ? (
                  <>
                    <Link
                      href={`/map?placeId=${place.id}`}
                      className="ui-interactive-press w-full min-h-12 px-4 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Xem vị trí trên bản đồ</span>
                    </Link>

                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ui-interactive-press w-full min-h-11 px-4 rounded-lg bg-[var(--accent-ochre-soft)] hover:bg-[#F5E4C8] text-[var(--accent-ochre-ink)] font-semibold text-sm flex items-center justify-center gap-2 border border-[var(--accent-ochre)]/25"
                    >
                      <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Chỉ đường Google Maps</span>
                    </a>
                  </>
                ) : (
                  <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-[var(--ink-secondary)] space-y-1.5">
                    <div className="font-semibold text-[var(--ink-primary)] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
                      <span>Địa chỉ (Phường / Xã): {place.address}</span>
                    </div>
                    <p className="text-[var(--ink-muted)] leading-relaxed">
                      Địa điểm chưa có tọa độ GPS công khai (không đánh dấu trên bản đồ).
                    </p>
                  </div>
                )}

                <Link
                  href="/explore"
                  className="ui-interactive-press w-full min-h-11 px-4 rounded-lg border border-[var(--border-strong)] hover:bg-[var(--bg-surface-muted)] text-[var(--ink-primary)] font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Compass className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Khám phá địa điểm khác</span>
                </Link>
              </div>
            </div>

            {/* KHKT HERITAGE METADATA CARD */}
            {(place.heritage_type ||
              place.recognition_level ||
              place.decision_number ||
              place.recognition_date ||
              place.listed_year ||
              place.issuing_authority ||
              place.management_unit ||
              place.region ||
              place.route_name ||
              place.dms_coordinates ||
              (place.component_sites && place.component_sites.length > 0) ||
              place.verification_source) && (
              <div data-detail-aside-card className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-5">
                <h2 className="font-serif font-semibold text-[var(--ink-primary)] text-lg pb-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
                  <Landmark className="w-4.5 h-4.5 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
                  <span>Hồ Sơ Di Sản &amp; Pháp Lý</span>
                </h2>

                <div className="space-y-3.5 text-sm">
                  {place.route_name && (
                    <div className="flex items-start gap-3">
                      <Compass className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Tuyến di sản</div>
                        <div className="text-[var(--ink-secondary)] mt-0.5">{place.route_name}</div>
                      </div>
                    </div>
                  )}

                  {place.region && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Phân vùng nghiên cứu</div>
                        <div className="text-[var(--ink-secondary)] mt-0.5">{place.region}</div>
                      </div>
                    </div>
                  )}

                  {place.heritage_type && (
                    <div className="flex items-start gap-3">
                      <Landmark className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Loại hình di sản</div>
                        <div className="text-[var(--ink-secondary)] mt-0.5">{place.heritage_type}</div>
                      </div>
                    </div>
                  )}

                  {place.recognition_level && (
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-4 h-4 text-[var(--accent-ochre)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Cấp công nhận</div>
                        <div className="text-[var(--ink-secondary)] mt-0.5 font-medium">{place.recognition_level}</div>
                      </div>
                    </div>
                  )}

                  {place.decision_number && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Số văn bản / Quyết định</div>
                        <div className="text-[var(--ink-secondary)] mt-0.5">{place.decision_number}</div>
                      </div>
                    </div>
                  )}

                  {(place.recognition_date || place.listed_year) && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">
                          {place.recognition_date ? 'Ngày công nhận' : 'Năm ghi danh'}
                        </div>
                        <div className="text-[var(--ink-secondary)] mt-0.5 tabular-nums">
                          {[place.recognition_date, place.listed_year ? `Ghi danh ${place.listed_year}` : '']
                            .filter(Boolean)
                            .join(' · ')}
                        </div>
                      </div>
                    </div>
                  )}

                  {place.issuing_authority && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Thẩm quyền ban hành</div>
                        <div className="text-[var(--ink-secondary)] mt-0.5">{place.issuing_authority}</div>
                      </div>
                    </div>
                  )}

                  {place.management_unit && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Đơn vị quản lý</div>
                        <div className="text-[var(--ink-secondary)] mt-0.5">{place.management_unit}</div>
                      </div>
                    </div>
                  )}

                  {place.dms_coordinates && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Tọa độ GPS (DMS)</div>
                        <div className="font-mono text-xs text-[var(--ink-secondary)] mt-0.5">{place.dms_coordinates}</div>
                      </div>
                    </div>
                  )}

                  {place.component_sites && place.component_sites.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Landmark className="w-4 h-4 text-[var(--accent-jade)] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="font-semibold text-[var(--ink-primary)]">Điểm thành phần</div>
                        <ul className="mt-1 space-y-1 text-xs text-[var(--ink-secondary)] list-disc list-inside">
                          {place.component_sites.map((site, idx) => (
                            <li key={idx}>{site}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {place.verification_source && (
                    <div className="pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--ink-muted)] leading-relaxed">
                      <span className="font-semibold text-[var(--ink-secondary)]">Nguồn kiểm chứng: </span>
                      {place.verification_source}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GPS COORDINATE CARD */}
            {place.has_coordinates !== false && (
              <div data-detail-aside-card className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-serif font-semibold text-[var(--ink-primary)] text-base flex items-center gap-2 min-w-0">
                    <MapPin className="w-4 h-4 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
                    <span className="truncate">Tọa Độ Địa Lý</span>
                  </h2>
                  <span className="font-mono text-xs font-semibold text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-2 py-0.5 rounded-sm shrink-0">
                    WGS84
                  </span>
                </div>

                <div className="relative h-40 rounded-lg overflow-hidden bg-[var(--bg-basalt)] border border-[#24332F] flex items-center justify-center p-4 text-center">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-9 h-9 rounded-lg bg-[var(--accent-jade)]/30 text-[#A3D9CE] flex items-center justify-center border border-[#7CC4B8]/40 mb-2.5">
                      <Navigation className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="font-mono text-sm text-[#FFFDF9] font-medium tabular-nums">
                      {place.latitude.toFixed(4)}° N
                    </div>
                    <div className="font-mono text-sm text-[#A3D9CE] font-medium tabular-nums mt-0.5">
                      {place.longitude.toFixed(4)}° E
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                  Hệ tọa độ chuẩn WGS84 dùng để định vị trên bản đồ số tương tác và dẫn đường GPS.
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* 4. RELATED PLACES */}
        {relatedPlaces.length > 0 && (
          <section data-related-section className="pt-10 border-t border-[var(--border-subtle)] space-y-6">
            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tracking-[-0.02em]">
                  Địa Điểm Lân Cận &amp; Cùng Danh Mục
                </h2>
                <p className="text-sm text-[var(--ink-secondary)] mt-1">
                  Gợi ý điểm dừng tiếp theo cho hành trình khám phá Quảng Ngãi
                </p>
              </div>
              <Link
                href="/explore"
                className="group text-sm font-semibold text-[var(--accent-jade)] hover:text-[var(--accent-jade-hover)] hover:underline inline-flex items-center gap-1 shrink-0 min-h-11 transition-colors"
              >
                <span>Xem tất cả</span>
                <ChevronRight
                  className="w-4 h-4 motion-safe:group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPlaces.map((relPlace) => (
                <div key={relPlace.id} data-related-card className="h-full min-w-0">
                  <PlaceCard place={relPlace} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
