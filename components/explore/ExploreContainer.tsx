'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  ChevronDown,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Category, District } from '@/types';
import { useData } from '@/context/DataContext';
import PlaceCard from '@/components/place/PlaceCard';
import { matchSearchKeyword } from '@/utils/vietnamese';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ITEMS_PER_PAGE = 6;
const RATING_OPTIONS = [0, 4.6, 4.8] as const;

type SortOption = 'featured' | 'rating-desc' | 'reviews-desc' | 'name-asc';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ExploreContainer() {
  const searchParams = useSearchParams();
  const { places, categories, districts } = useData();

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'all');
  const [district, setDistrict] = useState(() => searchParams.get('district') || 'all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobileFilterMounted, setIsMobileFilterMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewSwitcherRef = useRef<HTMLDivElement>(null);
  const viewPillRef = useRef<HTMLSpanElement>(null);
  const gridBtnRef = useRef<HTMLButtonElement>(null);
  const listBtnRef = useRef<HTMLButtonElement>(null);
  const isFirstViewSyncRef = useRef(true);

  const categoryListRef = useRef<HTMLDivElement>(null);
  const categoryPillRef = useRef<HTMLSpanElement>(null);
  const categoryBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isFirstCatSyncRef = useRef(true);

  const ratingGroupRef = useRef<HTMLDivElement>(null);
  const ratingPillRef = useRef<HTMLSpanElement>(null);
  const ratingBtnRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const isFirstRatingSyncRef = useRef(true);

  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const paginationGroupRef = useRef<HTMLDivElement>(null);
  const pagePillRef = useRef<HTMLSpanElement>(null);
  const pageBtnRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const isFirstPageSyncRef = useRef(true);
  const prevTotalPagesRef = useRef<number>(1);

  const mobileBackdropRef = useRef<HTMLDivElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

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

  const openMobileFilter = useCallback(() => {
    setIsMobileFilterMounted(true);
    setIsMobileFilterOpen(true);
  }, []);

  const closeMobileFilter = useCallback(() => {
    setIsMobileFilterOpen(false);
  }, []);

  useEffect(() => {
    if (!isMobileFilterOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileFilter();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileFilterOpen, closeMobileFilter]);

  const filteredAndSortedPlaces = useMemo(() => {
    let result = places.filter((p) => {
      if (search.trim()) {
        const query = search.trim();
        const matchName = matchSearchKeyword(p.name, query);
        const matchDesc = matchSearchKeyword(p.description, query);
        const matchAddress = matchSearchKeyword(p.address, query);
        const matchTags = p.tags.some((t) => matchSearchKeyword(t, query));
        if (!matchName && !matchDesc && !matchAddress && !matchTags) return false;
      }

      if (category !== 'all' && p.category_id !== category) return false;
      if (district !== 'all' && p.district_id !== district) return false;
      if (priceRange !== 'all' && p.price_range !== priceRange) return false;
      if (minRating > 0 && p.rating < minRating) return false;

      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'rating-desc') return b.rating - a.rating;
      if (sortBy === 'reviews-desc') return b.review_count - a.review_count;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (a.is_featured === b.is_featured) return b.rating - a.rating;
      return a.is_featured ? -1 : 1;
    });

    return result;
  }, [places, search, category, district, priceRange, minRating, sortBy]);

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

  const cardsAnimKey = `${search}|${category}|${district}|${priceRange}|${minRating}|${sortBy}|${viewMode}|${currentPage}`;
  const prevCardsKeyRef = useRef(cardsAnimKey);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const setupExplore = (reduced: boolean) => {
        const header = containerRef.current?.querySelector('[data-explore-header]');
        const cards = Array.from(
          containerRef.current?.querySelectorAll<HTMLElement>('[data-place-card]') ?? []
        );

        if (header) {
          gsap.from(header, {
            y: reduced ? 8 : 14,
            opacity: 0,
            duration: reduced ? 0.3 : 0.38,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          });
        }

        if (cards.length > 0) {
          const triggerLine = window.innerHeight * 0.9;
          const visibleNow: HTMLElement[] = [];
          const belowFold: HTMLElement[] = [];

          cards.forEach((card) => {
            if (card.getBoundingClientRect().top <= triggerLine) {
              visibleNow.push(card);
            } else {
              gsap.set(card, {
                y: reduced ? 12 : 28,
                scale: reduced ? 0.99 : 0.98,
                opacity: 0,
                willChange: 'transform, opacity',
              });
              belowFold.push(card);
            }
          });

          if (visibleNow.length > 0) {
            gsap.from(visibleNow, {
              y: reduced ? 8 : 18,
              scale: reduced ? 0.99 : 0.985,
              opacity: 0,
              duration: reduced ? 0.34 : 0.45,
              stagger: reduced ? 0.04 : 0.06,
              delay: 0.06,
              ease: 'power3.out',
              clearProps: 'transform,opacity,willChange',
            });
          }

          if (belowFold.length > 0) {
            ScrollTrigger.batch(belowFold, {
              interval: 0.08,
              batchMax: 3,
              start: 'top 88%',
              once: true,
              onEnter: (batch) => {
                gsap.to(batch, {
                  y: 0,
                  scale: 1,
                  opacity: 1,
                  duration: reduced ? 0.38 : 0.56,
                  stagger: reduced ? 0.05 : 0.08,
                  ease: 'power3.out',
                  overwrite: 'auto',
                  clearProps: 'transform,opacity,willChange',
                });
              },
            });
          }
        }
      };

      mm.add('(prefers-reduced-motion: no-preference)', () => setupExplore(false));
      mm.add('(prefers-reduced-motion: reduce)', () => setupExplore(true));
      return () => mm.revert();
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      const pill = viewPillRef.current;
      const firstBtn = gridBtnRef.current;
      const targetBtn = viewMode === 'grid' ? gridBtnRef.current : listBtnRef.current;
      if (!pill || !firstBtn || !targetBtn) return;

      const targetX = targetBtn.offsetLeft - firstBtn.offsetLeft;
      const reduceMotion = prefersReducedMotion();

      if (isFirstViewSyncRef.current || reduceMotion) {
        gsap.set(pill, { x: targetX });
        isFirstViewSyncRef.current = false;
        return;
      }

      gsap.to(pill, {
        x: targetX,
        duration: 0.26,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    },
    { scope: viewSwitcherRef, dependencies: [viewMode] }
  );

  const syncCategoryPill = useCallback(
    (instant: boolean) => {
      const listEl = categoryListRef.current;
      const pill = categoryPillRef.current;
      const targetBtn = categoryBtnRefs.current[category];
      if (!listEl || !pill || !targetBtn || listEl.offsetParent === null) return;

      const baseHeight = pill.offsetHeight || targetBtn.offsetHeight || 40;
      const targetY = targetBtn.offsetTop;
      const targetScaleY = targetBtn.offsetHeight / baseHeight;
      const reduceMotion = prefersReducedMotion();

      if (instant || reduceMotion) {
        gsap.set(pill, { y: targetY, scaleY: targetScaleY, opacity: 1 });
        return;
      }

      gsap.to(pill, {
        y: targetY,
        scaleY: targetScaleY,
        opacity: 1,
        duration: 0.28,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    },
    [category]
  );

  const syncRatingPill = useCallback(
    (instant: boolean) => {
      const groupEl = ratingGroupRef.current;
      const pill = ratingPillRef.current;
      const firstBtn = ratingBtnRefs.current[RATING_OPTIONS[0]];
      const targetBtn = ratingBtnRefs.current[minRating];
      if (!groupEl || !pill || !firstBtn || !targetBtn || groupEl.offsetParent === null) return;

      const targetX = targetBtn.offsetLeft - firstBtn.offsetLeft;
      const reduceMotion = prefersReducedMotion();

      if (instant || reduceMotion) {
        gsap.set(pill, { x: targetX });
        return;
      }

      gsap.to(pill, {
        x: targetX,
        duration: 0.24,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    },
    [minRating]
  );

  useGSAP(
    () => {
      if (isFirstCatSyncRef.current) {
        syncCategoryPill(true);
        if (categoryListRef.current && categoryListRef.current.offsetParent !== null) {
          isFirstCatSyncRef.current = false;
        }
        return;
      }
      syncCategoryPill(false);
    },
    { scope: categoryListRef, dependencies: [category, categories.length, syncCategoryPill] }
  );

  useGSAP(
    () => {
      if (isFirstRatingSyncRef.current) {
        syncRatingPill(true);
        if (ratingGroupRef.current && ratingGroupRef.current.offsetParent !== null) {
          isFirstRatingSyncRef.current = false;
        }
        return;
      }
      syncRatingPill(false);
    },
    { scope: ratingGroupRef, dependencies: [minRating, syncRatingPill] }
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handleBreakpointOrResize = () => {
      if (mq.matches) {
        syncCategoryPill(true);
        syncRatingPill(true);
      }
    };

    mq.addEventListener('change', handleBreakpointOrResize);
    window.addEventListener('resize', handleBreakpointOrResize);
    return () => {
      mq.removeEventListener('change', handleBreakpointOrResize);
      window.removeEventListener('resize', handleBreakpointOrResize);
    };
  }, [syncCategoryPill, syncRatingPill]);

  useGSAP(
    () => {
      if (prevCardsKeyRef.current === cardsAnimKey) return;
      prevCardsKeyRef.current = cardsAnimKey;

      const root = resultsContainerRef.current;
      if (!root) return;

      const reduceMotion = prefersReducedMotion();
      const cards = root.querySelectorAll('[data-place-card]');
      const emptyState = root.querySelector('[data-empty-state]');

      if (cards.length > 0) {
        gsap.killTweensOf(cards);
        if (reduceMotion) {
          gsap.fromTo(
            cards,
            { opacity: 0.7 },
            { opacity: 1, duration: 0.12, ease: 'power1.out', clearProps: 'opacity' }
          );
        } else {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: { amount: 0.16, from: 'start' },
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            }
          );
        }
      } else if (emptyState) {
        gsap.killTweensOf(emptyState);
        if (!reduceMotion) {
          gsap.fromTo(
            emptyState,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.26, ease: 'power3.out', clearProps: 'transform,opacity' }
          );
        }
      }
    },
    { scope: resultsContainerRef, dependencies: [cardsAnimKey] }
  );

  useGSAP(
    () => {
      if (totalPages <= 1) {
        isFirstPageSyncRef.current = true;
        prevTotalPagesRef.current = totalPages;
        return;
      }

      const pill = pagePillRef.current;
      const firstBtn = pageBtnRefs.current[1];
      const activeBtn = pageBtnRefs.current[currentPage];
      if (!pill || !firstBtn || !activeBtn) return;

      const targetX = activeBtn.offsetLeft - firstBtn.offsetLeft;
      const reduceMotion = prefersReducedMotion();
      const pagesChanged = prevTotalPagesRef.current !== totalPages;
      prevTotalPagesRef.current = totalPages;

      if (isFirstPageSyncRef.current || pagesChanged || reduceMotion) {
        gsap.set(pill, { x: targetX });
        isFirstPageSyncRef.current = false;
        return;
      }

      gsap.to(pill, {
        x: targetX,
        duration: 0.26,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    },
    { scope: paginationGroupRef, dependencies: [currentPage, totalPages] }
  );

  useGSAP(
    () => {
      if (!isMobileFilterMounted) return;

      const backdrop = mobileBackdropRef.current;
      const drawer = mobileDrawerRef.current;
      if (!backdrop || !drawer) return;

      const sections = Array.from(drawer.querySelectorAll('[data-drawer-section]'));
      const reduceMotion = prefersReducedMotion();

      gsap.killTweensOf([backdrop, drawer, ...sections]);

      if (isMobileFilterOpen) {
        const enterTl = gsap.timeline();
        enterTl.fromTo(
          backdrop,
          { opacity: 0 },
          { opacity: 1, duration: reduceMotion ? 0.08 : 0.22, ease: 'power2.out' },
          0
        );
        enterTl.fromTo(
          drawer,
          { xPercent: reduceMotion ? 0 : 100, opacity: reduceMotion ? 0 : 1 },
          {
            xPercent: 0,
            opacity: 1,
            duration: reduceMotion ? 0.08 : 0.32,
            ease: 'expo.out',
            clearProps: 'transform',
          },
          0
        );

        if (sections.length > 0 && !reduceMotion) {
          enterTl.fromTo(
            sections,
            { opacity: 0, x: 14 },
            {
              opacity: 1,
              x: 0,
              duration: 0.24,
              stagger: 0.04,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            },
            0.06
          );
        }
      } else {
        const exitTl = gsap.timeline({
          onComplete: () => {
            setIsMobileFilterMounted(false);
          },
        });

        exitTl.to(
          drawer,
          {
            xPercent: reduceMotion ? 0 : 100,
            opacity: reduceMotion ? 0 : 1,
            duration: reduceMotion ? 0.06 : 0.22,
            ease: 'power3.in',
          },
          0
        );
        exitTl.to(
          backdrop,
          { opacity: 0, duration: reduceMotion ? 0.06 : 0.2, ease: 'power2.in' },
          '<0.03'
        );
      }
    },
    { scope: containerRef, dependencies: [isMobileFilterOpen, isMobileFilterMounted] }
  );

  return (
    <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
      {/* Page Header */}
      <div data-explore-header className="mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--ink-primary)] tracking-[-0.02em]">
              Danh Sách Địa Điểm Du Lịch Quảng Ngãi
            </h1>
            <p className="text-sm sm:text-base text-[var(--ink-secondary)] mt-1.5">
              Tra cứu thắng cảnh biển đảo, di tích lịch sử, cao nguyên sinh thái và ẩm thực xứ Quảng
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div
              ref={viewSwitcherRef}
              className="relative bg-[var(--bg-surface-muted)] p-1 rounded-lg grid grid-cols-2 items-center border border-[var(--border-subtle)]"
              role="group"
              aria-label="Chế độ hiển thị"
            >
              <span
                ref={viewPillRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-[var(--bg-surface)] shadow-soft-sm"
              />
              <button
                ref={gridBtnRef}
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`relative z-10 min-h-10 min-w-10 px-2.5 rounded-md transition-colors duration-200 flex items-center justify-center cursor-pointer ${
                  viewMode === 'grid'
                    ? 'text-[var(--accent-jade)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                }`}
                title="Hiển thị dạng lưới"
                aria-label="Hiển thị dạng lưới"
              >
                <Grid3X3 className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                ref={listBtnRef}
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={`relative z-10 min-h-10 min-w-10 px-2.5 rounded-md transition-colors duration-200 flex items-center justify-center cursor-pointer ${
                  viewMode === 'list'
                    ? 'text-[var(--accent-jade)]'
                    : 'text-[var(--ink-muted)] hover:text-[var(--ink-primary)]'
                }`}
                title="Hiển thị dạng danh sách"
                aria-label="Hiển thị dạng danh sách"
              >
                <List className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={openMobileFilter}
              className="ui-interactive-press lg:hidden flex items-center gap-2 px-4 min-h-12 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] text-sm font-semibold cursor-pointer"
            >
              <Filter className="w-4 h-4" aria-hidden="true" />
              <span>Bộ lọc ({activeFiltersCount})</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 1. DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block lg:col-span-1 min-w-0 space-y-6">
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-5 sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 font-semibold text-[var(--ink-primary)] text-sm">
                <SlidersHorizontal className="w-4 h-4 text-[var(--accent-jade)]" aria-hidden="true" />
                <span>Bộ Lọc Điểm Đến</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[var(--accent-jade)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label
                htmlFor="explore-keyword-input"
                className="block text-xs font-semibold text-[var(--ink-secondary)] mb-2"
              >
                Từ khóa tìm kiếm
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="w-4 h-4 text-[var(--ink-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  id="explore-keyword-input"
                  type="text"
                  value={search}
                  onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
                  placeholder="Tên địa điểm, đặc sản..."
                  className="w-full min-h-11 pl-9 pr-9 py-2 text-sm rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleFilterChange(() => setSearch(''))}
                    aria-label="Xóa từ khóa"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <div className="block text-xs font-semibold text-[var(--ink-secondary)] mb-2">
                Danh mục
              </div>
              <div ref={categoryListRef} className="relative space-y-1">
                <span
                  ref={categoryPillRef}
                  aria-hidden="true"
                  style={{ transformOrigin: 'top center' }}
                  className="pointer-events-none absolute top-0 left-0 right-0 h-10 rounded-lg bg-[var(--accent-jade-soft)] border border-[var(--accent-jade)]/25 opacity-0"
                />
                <button
                  ref={(el) => {
                    categoryBtnRefs.current['all'] = el;
                  }}
                  type="button"
                  onClick={() => handleFilterChange(() => setCategory('all'))}
                  aria-pressed={category === 'all'}
                  className={`relative z-10 w-full min-h-10 text-left px-3 py-2 rounded-lg text-xs transition-colors duration-200 flex items-center justify-between gap-2 cursor-pointer ${
                    category === 'all'
                      ? 'text-[var(--accent-jade-ink)] font-semibold'
                      : 'text-[var(--ink-secondary)] font-medium hover:bg-[var(--bg-surface-muted)]/60 hover:text-[var(--ink-primary)]'
                  }`}
                >
                  <span className="truncate">Tất cả danh mục</span>
                  <span className="text-xs shrink-0 tabular-nums font-semibold opacity-80">
                    {places.length}
                  </span>
                </button>
                {categories.map((cat: Category) => {
                  const isActive = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      ref={(el) => {
                        categoryBtnRefs.current[cat.id] = el;
                      }}
                      type="button"
                      onClick={() => handleFilterChange(() => setCategory(cat.id))}
                      aria-pressed={isActive}
                      className={`relative z-10 w-full min-h-10 text-left px-3 py-2 rounded-lg text-xs transition-colors duration-200 flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'text-[var(--accent-jade-ink)] font-semibold'
                          : 'text-[var(--ink-secondary)] font-medium hover:bg-[var(--bg-surface-muted)]/60 hover:text-[var(--ink-primary)]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-xs shrink-0 tabular-nums font-semibold opacity-80">
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* District Filter */}
            <div>
              <label
                htmlFor="explore-district-select"
                className="block text-xs font-semibold text-[var(--ink-secondary)] mb-2"
              >
                Khu vực địa lý
              </label>
              <div className="relative min-w-0">
                <select
                  id="explore-district-select"
                  value={district}
                  onChange={(e) => handleFilterChange(() => setDistrict(e.target.value))}
                  className="w-full min-h-11 min-w-0 max-w-full truncate px-3 py-2 text-sm rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] appearance-none pr-8 cursor-pointer transition-colors"
                >
                  <option value="all">Toàn bộ tỉnh Quảng Ngãi</option>
                  {districts.map((d: District) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="w-4 h-4 text-[var(--ink-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label
                htmlFor="explore-price-select"
                className="block text-xs font-semibold text-[var(--ink-secondary)] mb-2"
              >
                Mức chi phí
              </label>
              <div className="relative min-w-0">
                <select
                  id="explore-price-select"
                  value={priceRange}
                  onChange={(e) => handleFilterChange(() => setPriceRange(e.target.value))}
                  className="w-full min-h-11 min-w-0 max-w-full truncate px-3 py-2 text-sm rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] appearance-none pr-8 cursor-pointer transition-colors"
                >
                  <option value="all">Tất cả mức giá</option>
                  <option value="free">Miễn phí vé tham quan</option>
                  <option value="budget">Tiết kiệm (&lt; 100.000đ)</option>
                  <option value="moderate">Trung bình (100k - 500k)</option>
                  <option value="luxury">Cao cấp (&gt; 500.000đ)</option>
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="w-4 h-4 text-[var(--ink-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <div className="block text-xs font-semibold text-[var(--ink-secondary)] mb-2">
                Đánh giá tối thiểu
              </div>
              <div
                ref={ratingGroupRef}
                className="relative bg-[var(--bg-surface-muted)] p-1 rounded-lg grid grid-cols-3 gap-1 text-xs border border-[var(--border-subtle)]"
              >
                <span
                  ref={ratingPillRef}
                  aria-hidden="true"
                  style={{ width: 'calc((100% - 16px) / 3)' }}
                  className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-md bg-[#F59E0B] shadow-soft-sm"
                />
                {RATING_OPTIONS.map((stars) => {
                  const isActive = minRating === stars;
                  return (
                    <button
                      key={stars}
                      ref={(el) => {
                        ratingBtnRefs.current[stars] = el;
                      }}
                      type="button"
                      onClick={() => handleFilterChange(() => setMinRating(stars))}
                      aria-pressed={isActive}
                      className={`relative z-10 min-h-9 py-1.5 px-2 rounded-md text-center transition-colors duration-200 cursor-pointer tabular-nums ${
                        isActive
                          ? 'text-[#16201D] font-bold'
                          : 'text-[var(--ink-secondary)] font-medium hover:text-[var(--ink-primary)]'
                      }`}
                    >
                      {stars === 0 ? 'Tất cả' : `★ ${stars}+`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* 2. RESULTS SECTION */}
        <section aria-label="Danh sách địa điểm" className="lg:col-span-3 min-w-0 space-y-6">
          <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm text-[var(--ink-secondary)] tabular-nums">
              Hiển thị{' '}
              <strong className="text-[var(--ink-primary)] font-semibold">
                {totalItems === 0
                  ? 0
                  : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}–${Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      totalItems
                    )}`}
              </strong>{' '}
              trong <strong className="text-[var(--ink-primary)] font-semibold">{totalItems}</strong> địa điểm
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <label
                htmlFor="explore-sort-select"
                className="text-xs text-[var(--ink-muted)] font-semibold shrink-0"
              >
                Sắp xếp:
              </label>
              <div className="relative min-w-0 max-w-full">
                <select
                  id="explore-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="max-w-full min-w-0 min-h-10 truncate text-xs font-semibold text-[var(--ink-primary)] bg-[var(--bg-canvas)] border border-[var(--border-subtle)] px-3 py-1.5 rounded-lg focus:outline-none focus:border-[var(--accent-jade)] appearance-none pr-8 cursor-pointer transition-colors"
                >
                  <option value="featured">Nổi bật nhất</option>
                  <option value="rating-desc">Đánh giá cao nhất</option>
                  <option value="reviews-desc">Nhiều đánh giá nhất</option>
                  <option value="name-asc">Tên (A đến Z)</option>
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="w-3.5 h-3.5 text-[var(--ink-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>
          </div>

          <div ref={resultsContainerRef} className="min-w-0">
            {paginatedPlaces.length === 0 ? (
              <div
                data-empty-state
                className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-12 text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--accent-ochre-soft)] text-[var(--accent-ochre)] flex items-center justify-center mx-auto">
                  <Search className="w-7 h-7" aria-hidden="true" />
                </div>
                <h2 className="font-serif font-semibold text-[var(--ink-primary)] text-xl">
                  Không tìm thấy địa điểm phù hợp
                </h2>
                <p className="text-sm text-[var(--ink-secondary)] max-w-md mx-auto">
                  Không có kết quả nào khớp với tiêu chí tìm kiếm hiện tại. Thử từ khóa khác hoặc đặt lại bộ lọc.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="ui-interactive-press min-h-11 px-5 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Đặt lại bộ lọc</span>
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedPlaces.map((place) => (
                  <div key={`${place.id}-grid`} data-place-card className="h-full min-w-0">
                    <PlaceCard place={place} viewMode="grid" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedPlaces.map((place) => (
                  <div key={`${place.id}-list`} data-place-card className="min-w-0">
                    <PlaceCard place={place} viewMode="list" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Phân trang kết quả"
              className="pt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)]"
            >
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="ui-interactive-press min-h-11 px-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Trang trước</span>
              </button>

              <div
                ref={paginationGroupRef}
                className="relative flex items-center gap-1 bg-[var(--bg-surface-muted)] p-1 rounded-lg border border-[var(--border-subtle)]"
              >
                <span
                  ref={pagePillRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1 left-1 w-10 h-10 rounded-md bg-[var(--accent-jade)]"
                />
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    ref={(el) => {
                      pageBtnRefs.current[page] = el;
                    }}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    aria-label={`Trang ${page}`}
                    className={`relative z-10 w-10 h-10 rounded-md text-xs sm:text-sm font-semibold tabular-nums transition-colors duration-200 flex items-center justify-center cursor-pointer ${
                      currentPage === page
                        ? 'text-[#FFFDF9]'
                        : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="ui-interactive-press min-h-11 px-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs sm:text-sm font-semibold text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
              >
                <span>Trang sau</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </nav>
          )}
        </section>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isMobileFilterMounted && (
        <div
          ref={mobileBackdropRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMobileFilter();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Bộ lọc địa điểm"
          className={`fixed inset-0 z-50 lg:hidden flex justify-end bg-[#111A18]/65 backdrop-blur-xs ${
            isMobileFilterOpen ? '' : 'pointer-events-none'
          }`}
        >
          <div
            ref={mobileDrawerRef}
            className="w-full max-w-sm bg-[var(--bg-surface)] h-full p-6 flex flex-col justify-between overflow-y-auto overscroll-contain shadow-soft-2xl"
          >
            <div className="space-y-6">
              <div
                data-drawer-section
                className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]"
              >
                <div className="flex items-center gap-2 font-serif font-semibold text-[var(--ink-primary)] text-lg">
                  <SlidersHorizontal className="w-5 h-5 text-[var(--accent-jade)]" aria-hidden="true" />
                  <span>Bộ Lọc Địa Điểm</span>
                </div>
                <button
                  type="button"
                  onClick={closeMobileFilter}
                  aria-label="Đóng bộ lọc"
                  className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-[var(--ink-secondary)] hover:bg-[var(--bg-surface-muted)] cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <div data-drawer-section>
                <label
                  htmlFor="explore-mobile-keyword"
                  className="block text-xs font-semibold text-[var(--ink-secondary)] mb-2"
                >
                  Từ khóa
                </label>
                <input
                  id="explore-mobile-keyword"
                  type="text"
                  value={search}
                  onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
                  placeholder="Tên địa danh..."
                  className="w-full min-h-12 px-3.5 py-2 text-base rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] transition-colors"
                />
              </div>

              <div data-drawer-section>
                <label
                  htmlFor="explore-mobile-category"
                  className="block text-xs font-semibold text-[var(--ink-secondary)] mb-2"
                >
                  Danh mục
                </label>
                <div className="relative w-full min-w-0">
                  <select
                    id="explore-mobile-category"
                    value={category}
                    onChange={(e) => handleFilterChange(() => setCategory(e.target.value))}
                    className="w-full min-h-12 min-w-0 max-w-full truncate px-3.5 py-2 text-base rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] appearance-none pr-9 cursor-pointer"
                  >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map((c: Category) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="w-4 h-4 text-[var(--ink-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>

              <div data-drawer-section>
                <label
                  htmlFor="explore-mobile-district"
                  className="block text-xs font-semibold text-[var(--ink-secondary)] mb-2"
                >
                  Khu vực
                </label>
                <div className="relative w-full min-w-0">
                  <select
                    id="explore-mobile-district"
                    value={district}
                    onChange={(e) => handleFilterChange(() => setDistrict(e.target.value))}
                    className="w-full min-h-12 min-w-0 max-w-full truncate px-3.5 py-2 text-base rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] appearance-none pr-9 cursor-pointer"
                  >
                    <option value="all">Toàn bộ tỉnh Quảng Ngãi</option>
                    {districts.map((d: District) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    aria-hidden="true"
                    className="w-4 h-4 text-[var(--ink-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <div data-drawer-section className="pt-6 border-t border-[var(--border-subtle)] flex gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 min-h-12 border border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] rounded-lg text-sm font-semibold cursor-pointer"
              >
                Đặt lại
              </button>
              <button
                type="button"
                onClick={closeMobileFilter}
                className="flex-1 min-h-12 bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] rounded-lg text-sm font-semibold cursor-pointer"
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
