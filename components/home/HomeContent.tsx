'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Map,
  ArrowRight,
  Route,
  CheckCircle2,
  Compass,
  MapPin,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useData } from '@/context/DataContext';
import HeroSearch from '@/components/home/HeroSearch';
import CategoryCard from '@/components/place/CategoryCard';
import PlaceCard from '@/components/place/PlaceCard';
import SplitText from '@/components/ui/SplitText/SplitText';
import AnimatedContent from '@/components/ui/AnimatedContent/AnimatedContent';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function HomeContent() {
  const { places, categories, districts, settings } = useData();
  const rootRef = useRef<HTMLDivElement>(null);

  const featuredPlaces = places.filter((p) => p.is_featured);
  const displayPlaces = featuredPlaces.length > 0 ? featuredPlaces : places.slice(0, 6);

  const isGradientBg = settings.heroBgImage && settings.heroBgImage.startsWith('linear-gradient');
  const routeSamplePlaces = places.filter((p) => p.district_id === 'dist-ly-son').slice(0, 3);
  const previewStops = routeSamplePlaces.length > 0 ? routeSamplePlaces : displayPlaces.slice(0, 3);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const mm = gsap.matchMedia();

      const runAnimations = (reduced: boolean) => {
        // 1. Hero opening choreography (content stays visible in SSR HTML)
        const heroBg = root.querySelector('[data-hero-bg]');
        if (heroBg && !reduced) {
          gsap.fromTo(
            heroBg,
            { scale: 1.08 },
            { scale: 1, duration: 1.15, ease: 'power2.out', clearProps: 'transform' }
          );
        }

        const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        const badge = root.querySelector('[data-hero-badge]');
        const sub = root.querySelector('[data-hero-sub]');
        const searchWrap = root.querySelector('[data-hero-search]');
        const tags = root.querySelectorAll('[data-hero-tag]');
        const dy = reduced ? 8 : 18;

        if (badge) {
          heroTl.from(
            badge,
            { y: dy * 0.8, opacity: 0, duration: reduced ? 0.35 : 0.48, clearProps: 'transform,opacity' },
            0.05
          );
        }
        if (sub) {
          heroTl.from(
            sub,
            { y: dy, opacity: 0, duration: reduced ? 0.38 : 0.52, clearProps: 'transform,opacity' },
            0.16
          );
        }
        if (searchWrap) {
          heroTl.from(
            searchWrap,
            {
              y: dy * 1.15,
              scale: reduced ? 0.99 : 0.97,
              opacity: 0,
              duration: reduced ? 0.4 : 0.58,
              clearProps: 'transform,opacity',
            },
            0.25
          );
        }
        if (tags.length > 0) {
          heroTl.from(
            tags,
            {
              y: reduced ? 6 : 12,
              opacity: 0,
              duration: reduced ? 0.3 : 0.42,
              stagger: reduced ? 0.025 : 0.045,
              clearProps: 'transform,opacity',
            },
            0.36
          );
        }

        // 2. Scroll-linked hero parallax depth ("lướt") - full motion only
        const heroSection = root.querySelector('[data-hero-section]');
        const heroContent = root.querySelector('[data-hero-content]');
        if (!reduced && heroSection && heroBg) {
          gsap.to(heroBg, {
            yPercent: 12,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSection,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
            },
          });
        }
        if (!reduced && heroSection && heroContent) {
          gsap.to(heroContent, {
            y: -22,
            opacity: 0.88,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSection,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
            },
          });
        }

        // 3. Summary ribbon stat counters on scroll
        const statNodes = root.querySelectorAll<HTMLElement>('[data-stat-value]');
        statNodes.forEach((node, idx) => {
          const target = Number(node.dataset.statValue || 0);
          if (!Number.isFinite(target) || target <= 0) return;

          const startVal = Math.max(0, Math.floor(target * 0.4));
          const counter = { val: startVal };
          gsap.to(counter, {
            val: target,
            duration: reduced ? 0.45 : 0.7,
            delay: idx * 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 94%',
              once: true,
            },
            onUpdate: () => {
              node.textContent = String(Math.round(counter.val));
            },
            onComplete: () => {
              node.textContent = String(target);
            },
          });
        });

        // 4. Section headings gradual reveal on scroll
        const sectionHeadings = root.querySelectorAll<HTMLElement>('[data-scroll-heading]');
        sectionHeadings.forEach((heading) => {
          gsap.from(heading, {
            y: reduced ? 10 : 24,
            opacity: 0,
            duration: reduced ? 0.38 : 0.58,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: heading,
              start: 'top 88%',
              once: true,
            },
          });
        });

        // 5. Category & Featured Place cards: batched ScrollTrigger reveals row-by-row as user scrolls
        const setupBatchReveal = (selector: string) => {
          const items = Array.from(root.querySelectorAll<HTMLElement>(selector));
          if (items.length === 0) return;

          const triggerLine = window.innerHeight * 0.88;
          const pending: HTMLElement[] = [];

          items.forEach((item, idx) => {
            const rect = item.getBoundingClientRect();
            if (rect.top <= triggerLine) {
              gsap.from(item, {
                y: reduced ? 10 : 26,
                scale: reduced ? 0.99 : 0.975,
                opacity: 0,
                duration: reduced ? 0.36 : 0.58,
                delay: idx * 0.05,
                ease: 'power3.out',
                clearProps: 'transform,opacity,willChange',
              });
            } else {
              gsap.set(item, {
                y: reduced ? 14 : 32,
                scale: reduced ? 0.99 : 0.97,
                opacity: 0,
                willChange: 'transform, opacity',
              });
              pending.push(item);
            }
          });

          if (pending.length > 0) {
            ScrollTrigger.batch(pending, {
              interval: 0.08,
              batchMax: 4,
              start: 'top 88%',
              once: true,
              onEnter: (batch) => {
                gsap.to(batch, {
                  y: 0,
                  scale: 1,
                  opacity: 1,
                  duration: reduced ? 0.42 : 0.65,
                  stagger: reduced ? 0.06 : 0.09,
                  ease: 'power3.out',
                  overwrite: 'auto',
                  clearProps: 'transform,opacity,willChange',
                });
              },
            });
          }
        };

        setupBatchReveal('[data-scroll-stat]');
        setupBatchReveal('[data-category-card]');
        setupBatchReveal('[data-featured-card]');

        // 6. Showcase section + checklist + route stops gradual scroll reveal
        const showcaseFeatures = root.querySelectorAll('[data-showcase-feature]');
        const showcaseSection = root.querySelector('[data-showcase-section]');
        if (showcaseSection && showcaseFeatures.length > 0) {
          gsap.from(showcaseFeatures, {
            y: reduced ? 8 : 14,
            opacity: 0,
            duration: reduced ? 0.32 : 0.44,
            stagger: reduced ? 0.04 : 0.07,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: showcaseSection,
              start: 'top 82%',
              once: true,
            },
          });
        }

        const showcaseStops = root.querySelectorAll('[data-showcase-stop]');
        const showcaseCard = root.querySelector('[data-showcase-card]');
        if (showcaseCard && showcaseStops.length > 0) {
          gsap.from(showcaseStops, {
            x: reduced ? 8 : 16,
            opacity: 0,
            duration: reduced ? 0.32 : 0.45,
            stagger: reduced ? 0.05 : 0.09,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: showcaseCard,
              start: 'top 85%',
              once: true,
            },
          });
        }
      };

      mm.add('(prefers-reduced-motion: no-preference)', () => runAnimations(false));
      mm.add('(prefers-reduced-motion: reduce)', () => runAnimations(true));

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} suppressHydrationWarning className="flex flex-col">
      {/* 1. HERO SECTION */}
      <section
        data-hero-section
        suppressHydrationWarning
        className="relative min-h-[600px] lg:min-h-[680px] w-full flex items-center justify-center bg-[#111A18] z-30"
      >
        <div suppressHydrationWarning className="absolute inset-0 z-0 overflow-hidden">
          <div data-hero-bg className="w-full h-full will-change-transform">
            {isGradientBg ? (
              <div className="w-full h-full" style={{ background: settings.heroBgImage }} />
            ) : (
              <Image
                src={
                  settings.heroBgImage ||
                  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85'
                }
                alt={settings.siteTitle}
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            )}
          </div>

          {/* Protective high-contrast basalt scrim */}
          <div
            suppressHydrationWarning
            className="absolute inset-0 bg-gradient-to-b from-[#0D1513]/75 via-[#0D1513]/50 to-[#0D1513]/85"
          />
        </div>

        <div
          data-hero-content
          className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center flex flex-col items-center"
        >
          <p
            data-hero-badge
            className="text-xs sm:text-sm font-medium text-[#E5E0D5] mb-4 tracking-wide"
          >
            {settings.heroBadge || `${places.length} địa danh · ${districts.length} khu vực tỉnh Quảng Ngãi`}
          </p>

          <SplitText
            text={settings.heroHeading || 'Di Sản, Văn Hóa & Danh Thắng Tỉnh Quảng Ngãi'}
            className="font-serif text-3xl sm:text-5xl lg:text-[3.5rem] font-bold text-[#FFFDF9] tracking-[-0.02em] max-w-4xl leading-[1.14]"
            tag="h1"
            delay={26}
            duration={0.55}
            splitType="words"
            effect="rise"
            trigger="load"
          />

          <p
            data-hero-sub
            className="mt-4 sm:mt-5 text-base sm:text-lg text-[#E8E3D9] max-w-2xl leading-relaxed font-normal"
          >
            {settings.heroSubheading}
          </p>

          <div
            data-hero-search
            className="w-full mt-8 sm:mt-10 flex justify-center relative z-40"
          >
            <HeroSearch />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-[#F5F2EB]">
            <span data-hero-tag className="text-[#CBC4B8] font-medium mr-1">
              Điểm đến nhanh:
            </span>
            {['Đảo Lý Sơn', 'Măng Đen', 'Núi Thiên Ấn', 'Nhà thờ gỗ', 'Sơn Mỹ', 'Sa Huỳnh'].map(
              (tag) => (
                <Link
                  key={tag}
                  data-hero-tag
                  href={`/explore?search=${encodeURIComponent(tag)}`}
                  className="ui-interactive-press min-h-10 px-3.5 py-1.5 rounded-full bg-[#111A18]/65 hover:bg-[#111A18]/90 motion-safe:hover:-translate-y-0.5 border border-white/25 hover:border-white/45 text-[#F5F2EB] font-medium inline-flex items-center"
                >
                  {tag}
                </Link>
              )
            )}
            <Link
              data-hero-tag
              href="/itinerary"
              className="ui-interactive-press ml-1 min-h-10 px-4 py-1.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] motion-safe:hover:-translate-y-0.5 text-[#16201D] font-semibold inline-flex items-center gap-1.5"
            >
              <Route className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Lập lịch trình tour</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PROVINCE ATLAS SUMMARY STRIP (Flush & Grounded, No Overlap) */}
      <section
        aria-label="Tổng quan địa danh Quảng Ngãi"
        className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 md:py-9">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div data-scroll-stat className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-5 flex items-start gap-4">
              <div
                data-stat-value={places.length}
                className="font-sans text-3xl md:text-4xl font-extrabold text-[var(--accent-jade)] tracking-tight tabular-nums leading-none shrink-0"
              >
                {places.length}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--ink-primary)]">
                  Điểm đến số hóa
                </div>
                <p className="text-xs sm:text-sm text-[var(--ink-muted)] font-normal mt-0.5 leading-snug">
                  Danh thắng &amp; di sản đã định vị GPS
                </p>
              </div>
            </div>

            <div data-scroll-stat className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-5 flex items-start gap-4">
              <div
                data-stat-value={districts.length}
                className="font-sans text-3xl md:text-4xl font-extrabold text-[var(--ink-primary)] tracking-tight tabular-nums leading-none shrink-0"
              >
                {districts.length}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--ink-primary)]">
                  Khu vực địa lý
                </div>
                <p className="text-xs sm:text-sm text-[var(--ink-muted)] font-normal mt-0.5 leading-snug">
                  Từ hải đảo Lý Sơn đến đại ngàn phía Tây
                </p>
              </div>
            </div>

            <div data-scroll-stat className="rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] p-5 flex items-start gap-4">
              <div
                data-stat-value={categories.length}
                className="font-sans text-3xl md:text-4xl font-extrabold text-[var(--accent-ochre)] tracking-tight tabular-nums leading-none shrink-0"
              >
                {categories.length}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-[var(--ink-primary)]">
                  Nhóm trải nghiệm
                </div>
                <p className="text-xs sm:text-sm text-[var(--ink-muted)] font-normal mt-0.5 leading-snug">
                  Sinh thái, biển đảo, di tích và ẩm thực
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-14 md:py-20">
        <div
          data-scroll-heading
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-[var(--border-subtle)]"
        >
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl md:text-[2.25rem] font-extrabold text-[#0E1A17] tracking-[-0.025em] leading-tight">
              Danh Mục Du Lịch Quảng Ngãi
            </h2>
            <div className="h-1 w-14 rounded-full bg-[var(--accent-jade)] mt-2.5" aria-hidden="true" />
            <p className="text-sm sm:text-base text-[var(--ink-secondary)] font-normal mt-3 max-w-2xl">
              Khám phá theo thiên nhiên sinh thái, biển đảo, di tích lịch sử và ẩm thực xứ Quảng.
            </p>
          </div>
          <Link
            href="/explore"
            className="ui-interactive-press inline-flex items-center justify-center gap-2 px-4 min-h-11 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--accent-jade)] hover:text-[#FFFDF9] hover:border-[var(--accent-jade)] text-[var(--ink-primary)] text-sm font-semibold transition-colors shrink-0 group"
          >
            <span>Xem tất cả danh mục</span>
            <ArrowRight
              aria-hidden="true"
              className="w-4 h-4 motion-safe:group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div key={cat.id} data-category-card className="h-full min-w-0">
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PLACES SECTION */}
      <section className="w-full bg-[var(--bg-surface-muted)]/60 border-y border-[var(--border-subtle)] py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-scroll-heading
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-8 border-b border-[var(--border-subtle)]"
          >
            <div>
              <h2 className="font-sans text-2xl sm:text-3xl md:text-[2.25rem] font-extrabold text-[#0E1A17] tracking-[-0.025em] leading-tight">
                Điểm Đến Tiêu Biểu
              </h2>
              <div className="h-1 w-14 rounded-full bg-[var(--accent-jade)] mt-2.5" aria-hidden="true" />
              <p className="text-sm sm:text-base text-[var(--ink-secondary)] font-normal mt-3 max-w-2xl">
                Những thắng cảnh biển đảo, cổ tự và đặc sản nổi bật trên bản đồ du lịch tỉnh Quảng Ngãi.
              </p>
            </div>
            <Link
              href="/explore"
              className="ui-interactive-press group inline-flex items-center justify-center gap-2 px-4 min-h-11 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] text-[var(--ink-primary)] text-sm font-semibold shrink-0 shadow-soft-sm"
            >
              <span>Xem toàn bộ {places.length} địa điểm</span>
              <ArrowRight
                className="w-4 h-4 motion-safe:group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPlaces.slice(0, 6).map((place) => (
              <div key={place.id} data-featured-card className="h-full min-w-0">
                <PlaceCard place={place} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE ATLAS & ITINERARY SHOWCASE */}
      <section data-showcase-section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-14 md:py-20">
        <AnimatedContent distance={28} direction="vertical" duration={0.6} threshold={0.14}>
          <div className="rounded-2xl bg-[var(--bg-basalt)] text-[var(--ink-on-dark)] border border-[#24332F] p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <h2 className="font-serif text-2xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.18] text-[#FFFDF9]">
                Bản Đồ Số Đa Lớp &amp; Lịch Trình Từng Chặng
              </h2>

              <p className="text-[var(--ink-on-dark-muted)] text-base leading-relaxed max-w-2xl">
                Chọn các điểm đến theo thứ tự chuyến đi. Hệ thống tự động tính tổng cự ly, ước lượng thời gian tham quan, vẽ lộ trình nối điểm và mở chỉ đường GPS qua Google Maps.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#E5E0D5]">
                <li data-showcase-feature className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#7CC4B8] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Chuyển đổi 3 lớp: Đường bộ, Địa hình, Vệ tinh</span>
                </li>
                <li data-showcase-feature className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#7CC4B8] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Tính tự động tổng cự ly di chuyển (km)</span>
                </li>
                <li data-showcase-feature className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#7CC4B8] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Sắp xếp thứ tự dừng &amp; xem chặng nối trực quan</span>
                </li>
                <li data-showcase-feature className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#7CC4B8] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>Chuyển tiếp chỉ đường toàn tuyến lên Google Maps</span>
                </li>
              </ul>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/itinerary"
                  className="ui-interactive-press min-h-12 px-5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#16201D] font-semibold text-sm inline-flex items-center gap-2"
                >
                  <Route className="w-4 h-4" aria-hidden="true" />
                  <span>Tạo lịch trình tour</span>
                </Link>
                <Link
                  href="/map"
                  className="ui-interactive-press min-h-12 px-5 rounded-lg bg-[#1A2623] hover:bg-[#23332F] border border-[#324640] text-[#FFFDF9] font-semibold text-sm inline-flex items-center gap-2"
                >
                  <Map className="w-4 h-4 text-[#7CC4B8]" aria-hidden="true" />
                  <span>Mở bản đồ số</span>
                </Link>
              </div>
            </div>

            {/* Concrete Mechanism Preview: Sample Coordinate Route Card */}
            <div className="lg:col-span-5" data-showcase-card>
              <div className="rounded-xl bg-[var(--bg-basalt-elevated)] border border-[#2B3D38] p-5 space-y-4">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#2B3D38]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#FFFDF9]">
                    <Compass className="w-4 h-4 text-[#7CC4B8]" aria-hidden="true" />
                    <span>Tuyến mẫu: Đảo Lý Sơn</span>
                  </div>
                  <span className="font-mono text-xs text-[#A3D9CE] tabular-nums">
                    WGS84 · {previewStops.length} điểm
                  </span>
                </div>

                <div className="space-y-3">
                  {previewStops.map((stop, index) => (
                    <Link
                      key={stop.id}
                      data-showcase-stop
                      href={`/places/${stop.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-[#131E1B] hover:bg-[#1F2E2A] border border-[#263732] hover:border-[#3A544D] transition-colors group"
                    >
                      <span className="w-7 h-7 rounded-md bg-[var(--accent-jade)] text-[#FFFDF9] font-mono text-xs font-semibold flex items-center justify-center shrink-0 tabular-nums transition-transform duration-200 motion-safe:group-hover:scale-105">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#FFFDF9] group-hover:text-[#A3D9CE] transition-colors truncate">
                          {stop.name.replace(/\[Minh Họa\]\s*/g, '')}
                        </div>
                        <div className="font-mono text-xs text-[var(--ink-on-dark-muted)] flex items-center gap-1.5 mt-0.5 tabular-nums">
                          <MapPin className="w-3 h-3 text-[#7CC4B8] shrink-0" aria-hidden="true" />
                          <span>
                            {stop.latitude.toFixed(4)}°N, {stop.longitude.toFixed(4)}°E
                          </span>
                        </div>
                      </div>
                      <ArrowRight
                        aria-hidden="true"
                        className="w-4 h-4 text-[var(--ink-on-dark-muted)] group-hover:text-[#FFFDF9] motion-safe:group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none shrink-0"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedContent>
      </section>
    </div>
  );
}
