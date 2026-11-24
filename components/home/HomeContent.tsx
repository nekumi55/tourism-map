'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Map,
  Sparkles,
  ArrowRight,
  Route,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import HeroSearch from '@/components/home/HeroSearch';
import CategoryCard from '@/components/place/CategoryCard';
import PlaceCard from '@/components/place/PlaceCard';
import SplitText from '@/components/ui/SplitText/SplitText';
import AnimatedContent from '@/components/ui/AnimatedContent/AnimatedContent';
import Magnet from '@/components/ui/Magnet/Magnet';

export default function HomeContent() {
  const { places, categories, settings } = useData();

  const featuredPlaces = places.filter((p) => p.is_featured);
  const displayPlaces = featuredPlaces.length > 0 ? featuredPlaces : places.slice(0, 6);

  const isGradientBg = settings.heroBgImage && settings.heroBgImage.startsWith('linear-gradient');

  return (
    <div suppressHydrationWarning className="flex flex-col gap-14 md:gap-20 pb-20">
      {/* 1. HERO SECTION */}
      <section suppressHydrationWarning className="relative min-h-[640px] md:min-h-[720px] w-full flex items-center justify-center bg-gradient-to-br from-teal-800 via-cyan-900 to-slate-900 z-30">
        <div suppressHydrationWarning className="absolute inset-0 z-0 overflow-hidden">
          {isGradientBg ? (
            <div
              className="w-full h-full"
              style={{ background: settings.heroBgImage }}
            />
          ) : (
            <Image
              src={settings.heroBgImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85'}
              alt={settings.siteTitle}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center scale-102 transition-transform duration-1000 ease-out"
            />
          )}

          <div suppressHydrationWarning className="absolute inset-0 bg-teal-950/20 backdrop-blur-[0.5px]" />
          <div suppressHydrationWarning className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-black/20" />
        </div>

        <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          <AnimatedContent
            distance={20}
            direction="vertical"
            duration={0.35}
            trigger="mount"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/25 backdrop-blur-md border border-white/30 text-teal-200 text-xs sm:text-sm font-semibold mb-6 shadow-glow transition-all">
              <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
              <span>{settings.heroBadge}</span>
            </div>
          </AnimatedContent>

          <SplitText
            text={settings.heroHeading || 'Khám Phá Bản Đồ Du Lịch Tỉnh Quảng Ngãi'}
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight sm:leading-snug drop-shadow-md"
            tag="h1"
            delay={20}
            duration={0.45}
            splitType="words"
            effect="rise"
            trigger="load"
          />

          <AnimatedContent
            distance={25}
            direction="vertical"
            duration={0.4}
            delay={0.1}
            trigger="mount"
          >
            <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-slate-100 max-w-2xl leading-relaxed drop-shadow-sm font-medium">
              {settings.heroSubheading}
            </p>
          </AnimatedContent>

          <AnimatedContent
            distance={30}
            direction="vertical"
            duration={0.45}
            delay={0.15}
            trigger="mount"
            className="w-full mt-8 sm:mt-10 flex justify-center relative z-40"
          >
            <HeroSearch />
          </AnimatedContent>

          <AnimatedContent
            distance={20}
            direction="vertical"
            duration={0.4}
            delay={0.2}
            trigger="mount"
          >
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 text-xs text-white">
              <span className="text-slate-200 font-medium">Khám phá nhanh:</span>
              {['Đảo Lý Sơn', 'Măng Đen', 'Núi Thiên Ấn', 'Nhà thờ gỗ', 'Sơn Mỹ', 'Sa Huỳnh'].map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?search=${encodeURIComponent(tag)}`}
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/30 border border-white/25 backdrop-blur-md transition-all font-medium shadow-xs hover:scale-105"
                >
                  {tag}
                </Link>
              ))}
              <Magnet padding={40} magnetStrength={3}>
                <Link
                  href="/itinerary"
                  className="ml-1 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all hover:scale-105"
                >
                  <Route className="w-3.5 h-3.5" />
                  <span>Tạo lịch trình du lịch</span>
                </Link>
              </Magnet>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="-mt-12 md:-mt-16 relative z-10 max-w-5xl mx-auto px-4 w-full">
        <AnimatedContent
          distance={40}
          direction="vertical"
          duration={0.45}
          ease="power3.out"
          threshold={0.15}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-soft-xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100 transition-all hover:shadow-2xl">
            <div className="pt-2 sm:pt-0">
              <div className="text-3xl md:text-4xl font-extrabold text-teal-600 tracking-tight">
                {places.length}+
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                Điểm đến danh thắng số hóa
              </div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-600 tracking-tight">
                {categories.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                Danh mục trải nghiệm đặc sắc
              </div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-3xl md:text-4xl font-extrabold text-amber-500 tracking-tight flex items-center justify-center gap-1">
                <Star className="w-7 h-7 fill-amber-400 text-amber-400" />
                <span>4.9 / 5.0</span>
              </div>
              <div className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                Đánh giá từ cộng đồng du khách
              </div>
            </div>
          </div>
        </AnimatedContent>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AnimatedContent
          distance={30}
          direction="vertical"
          duration={0.4}
          threshold={0.15}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
                Đa dạng trải nghiệm
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Danh Mục Du Lịch Tỉnh Quảng Ngãi
              </h2>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 group"
            >
              <span>Xem tất cả danh mục</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedContent>

        <AnimatedContent
          distance={40}
          direction="vertical"
          duration={0.45}
          threshold={0.1}
          stagger={0.04}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </AnimatedContent>
      </section>

      {/* 4. FEATURED PLACES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AnimatedContent
          distance={30}
          direction="vertical"
          duration={0.4}
          threshold={0.15}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
                Điểm đến tiêu biểu
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Địa Điểm Nổi Bật Được Yêu Thích
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Những danh thắng biển đảo, cổ tự và đặc sản ẩm thực nhất định phải ghé thăm
              </p>
            </div>
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 text-sm font-semibold transition-colors shadow-soft-sm"
            >
              <span>Khám phá toàn bộ {places.length} địa điểm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </AnimatedContent>

        <AnimatedContent
          distance={45}
          direction="vertical"
          duration={0.45}
          threshold={0.1}
          stagger={0.05}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayPlaces.slice(0, 6).map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </AnimatedContent>
      </section>

      {/* 5. INTERACTIVE MAP & ITINERARY PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <AnimatedContent
          distance={40}
          direction="vertical"
          duration={0.45}
          threshold={0.15}
        >
          <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white overflow-hidden p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold">
                <Route className="w-3.5 h-3.5" />
                <span>Bản Đồ Số & Du Lịch Theo Lịch Trình</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Tự Động Lên Lịch Trình & Chỉ Dẫn Đường Đi Trực Quan
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Dễ dàng chọn các địa điểm yêu thích theo thứ tự chuyến đi. Hệ thống tự động tính toán tổng cự ly di chuyển, thời gian tham quan, vẽ đường nối lộ trình trực quan và hỗ trợ chỉ đường GPS trên Google Maps.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Bản đồ số Google Maps Quảng Ngãi mượt mà</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Đổi lớp Vệ tinh thật, Địa hình & Đường bộ</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Tự động tính tổng quãng đường (km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Chỉ dẫn đường đi từng chặng chi tiết</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Magnet padding={50} magnetStrength={3}>
                  <Link
                    href="/itinerary"
                    className="px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/30 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Route className="w-4 h-4" />
                    <span>Tạo Lịch Trình Ngay</span>
                  </Link>
                </Magnet>
                <Magnet padding={50} magnetStrength={3}>
                  <Link
                    href="/map"
                    className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-colors flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    <span>Mở Bản Đồ Số</span>
                  </Link>
                </Magnet>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </section>
    </div>
  );
}