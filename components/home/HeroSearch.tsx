'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useData } from '@/context/DataContext';
import { matchSearchKeyword } from '@/utils/vietnamese';

gsap.registerPlugin(useGSAP);

interface FilterBarSnapshot {
  categoryName: string;
  districtName: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function HeroSearch() {
  const router = useRouter();
  const { places, categories, districts } = useData();
  const [keyword, setKeyword] = useState('');
  const [dropdownQuery, setDropdownQuery] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownMounted, setIsDropdownMounted] = useState(false);
  const [isClearMounted, setIsClearMounted] = useState(false);

  const [isKeywordFocused, setIsKeywordFocused] = useState(false);
  const [isCategoryFocused, setIsCategoryFocused] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isDistrictFocused, setIsDistrictFocused] = useState(false);
  const [isDistrictMenuOpen, setIsDistrictMenuOpen] = useState(false);

  const [isFilterBarMounted, setIsFilterBarMounted] = useState(false);
  const [filterBarSnapshot, setFilterBarSnapshot] = useState<FilterBarSnapshot>({
    categoryName: '',
    districtName: '',
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearBtnRef = useRef<HTMLButtonElement>(null);
  const clearTweenRef = useRef<gsap.core.Tween | null>(null);
  const wasClearMountedRef = useRef(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownTlRef = useRef<gsap.core.Timeline | null>(null);
  const wasDropdownMountedRef = useRef(false);
  const prevSuggestionSignatureRef = useRef('');

  const categoryBoxRef = useRef<HTMLDivElement>(null);
  const categoryBadgeRef = useRef<HTMLSpanElement>(null);
  const districtBoxRef = useRef<HTMLDivElement>(null);
  const districtBadgeRef = useRef<HTMLSpanElement>(null);
  const filterCountBadgeRef = useRef<HTMLSpanElement>(null);

  const activeFilterBarRef = useRef<HTMLDivElement>(null);
  const filterBarTweenRef = useRef<gsap.core.Tween | null>(null);
  const wasFilterBarMountedRef = useRef(false);

  const hasKeyword = keyword.length > 0;
  const activeFilterCount = (category ? 1 : 0) + (district ? 1 : 0);
  const effectiveQuery = isDropdownOpen ? keyword : dropdownQuery;

  const updateFilters = useCallback(
    (nextCat: string, nextDist: string) => {
      setCategory(nextCat);
      setDistrict(nextDist);
      if (nextCat || nextDist) {
        const catName = categories.find((c) => c.id === nextCat)?.name ?? '';
        const distName = districts.find((d) => d.id === nextDist)?.name ?? '';
        setFilterBarSnapshot({ categoryName: catName, districtName: distName });
        setIsFilterBarMounted(true);
      }
    },
    [categories, districts]
  );

  const openDropdownWithQuery = useCallback((rawQuery: string) => {
    if (rawQuery.trim().length > 0) {
      setDropdownQuery(rawQuery);
      setIsDropdownMounted(true);
      setIsDropdownOpen(true);
    } else {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
        setIsCategoryMenuOpen(false);
        setIsDistrictMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsCategoryMenuOpen(false);
        setIsDistrictMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const suggestedPlaces = useMemo(() => {
    const q = effectiveQuery.trim();
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
  }, [places, effectiveQuery, category, district]);

  const suggestionSignature = useMemo(
    () => suggestedPlaces.map((p) => p.id).join(','),
    [suggestedPlaces]
  );

  useGSAP(
    (_context, contextSafe) => {
      if (!isDropdownMounted) {
        wasDropdownMountedRef.current = false;
        return;
      }

      const panel = dropdownRef.current;
      if (!panel) return;
      const rows = Array.from(panel.querySelectorAll<HTMLElement>('[data-suggestion-row]'));

      dropdownTlRef.current?.kill();
      const reduce = prefersReducedMotion();

      const finalizeClose = contextSafe
        ? contextSafe(() => {
            wasDropdownMountedRef.current = false;
            setIsDropdownMounted(false);
          })
        : () => {
            wasDropdownMountedRef.current = false;
            setIsDropdownMounted(false);
          };

      if (isDropdownOpen) {
        if (!wasDropdownMountedRef.current) {
          wasDropdownMountedRef.current = true;
          gsap.set(panel, {
            autoAlpha: 0,
            y: reduce ? 0 : -10,
            scale: reduce ? 1 : 0.985,
            transformOrigin: 'top center',
          });
          if (rows.length) {
            gsap.set(rows, { autoAlpha: 0, y: reduce ? 0 : 8 });
          }
        }

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set([panel, ...rows], { clearProps: 'willChange' });
          },
        });

        if (reduce) {
          tl.to(panel, { autoAlpha: 1, y: 0, scale: 1, duration: 0.1, ease: 'power1.out' }, 0);
          if (rows.length) {
            tl.to(rows, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power1.out' }, 0);
          }
        } else {
          tl.to(
            panel,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.22,
              ease: 'power3.out',
              willChange: 'transform, opacity',
            },
            0
          );
          if (rows.length) {
            tl.to(
              rows,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.2,
                stagger: 0.035,
                ease: 'power3.out',
                willChange: 'transform, opacity',
              },
              0.04
            );
          }
        }

        dropdownTlRef.current = tl;
      } else {
        const tl = gsap.timeline({
          onComplete: finalizeClose,
        });

        if (reduce) {
          if (rows.length) {
            tl.to(rows, { autoAlpha: 0, duration: 0.08, ease: 'power1.in' }, 0);
          }
          tl.to(panel, { autoAlpha: 0, duration: 0.09, ease: 'power1.in' }, 0);
        } else {
          if (rows.length) {
            tl.to(
              rows,
              {
                autoAlpha: 0,
                y: -4,
                duration: 0.1,
                stagger: { each: 0.015, from: 'end' },
                ease: 'power2.in',
                willChange: 'transform, opacity',
              },
              0
            );
          }
          tl.to(
            panel,
            {
              autoAlpha: 0,
              y: -8,
              scale: 0.985,
              duration: 0.15,
              ease: 'power2.in',
              willChange: 'transform, opacity',
            },
            rows.length ? 0.03 : 0
          );
        }

        dropdownTlRef.current = tl;
      }
    },
    { scope: searchContainerRef, dependencies: [isDropdownOpen, isDropdownMounted] }
  );

  useGSAP(
    () => {
      if (!isDropdownOpen || !isDropdownMounted) {
        prevSuggestionSignatureRef.current = '';
        return;
      }

      if (prevSuggestionSignatureRef.current === '') {
        prevSuggestionSignatureRef.current = suggestionSignature;
        return;
      }

      if (prevSuggestionSignatureRef.current === suggestionSignature) return;
      prevSuggestionSignatureRef.current = suggestionSignature;

      const panel = dropdownRef.current;
      if (!panel) return;
      const rows = Array.from(panel.querySelectorAll<HTMLElement>('[data-suggestion-row]'));
      if (!rows.length) return;

      const reduce = prefersReducedMotion();
      if (reduce) {
        gsap.set(rows, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        rows,
        { autoAlpha: 0.45, y: 6 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.2,
          stagger: 0.03,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'transform,willChange',
        }
      );
    },
    { scope: searchContainerRef, dependencies: [suggestionSignature, isDropdownOpen, isDropdownMounted] }
  );

  useGSAP(
    (_context, contextSafe) => {
      if (!isClearMounted) {
        wasClearMountedRef.current = false;
        return;
      }

      const btn = clearBtnRef.current;
      if (!btn) return;

      clearTweenRef.current?.kill();
      const reduce = prefersReducedMotion();

      const finalize = contextSafe
        ? contextSafe(() => {
            wasClearMountedRef.current = false;
            setIsClearMounted(false);
          })
        : () => {
            wasClearMountedRef.current = false;
            setIsClearMounted(false);
          };

      if (hasKeyword) {
        if (!wasClearMountedRef.current) {
          wasClearMountedRef.current = true;
          gsap.set(btn, {
            autoAlpha: 0,
            scale: reduce ? 1 : 0.7,
          });
        }
        clearTweenRef.current = gsap.to(btn, {
          autoAlpha: 1,
          scale: 1,
          duration: reduce ? 0.1 : 0.18,
          ease: 'power3.out',
          clearProps: 'willChange',
        });
      } else {
        clearTweenRef.current = gsap.to(btn, {
          autoAlpha: 0,
          scale: reduce ? 1 : 0.7,
          duration: reduce ? 0.08 : 0.12,
          ease: 'power2.in',
          onComplete: finalize,
        });
      }
    },
    { scope: searchContainerRef, dependencies: [hasKeyword, isClearMounted] }
  );

  useGSAP(
    () => {
      if (!category) return;
      const reduce = prefersReducedMotion();
      const badge = categoryBadgeRef.current;
      if (badge && !reduce) {
        gsap.fromTo(
          badge,
          { autoAlpha: 0, scale: 0.85 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.2,
            ease: 'power3.out',
            clearProps: 'transform,willChange',
          }
        );
      }
    },
    { scope: searchContainerRef, dependencies: [category] }
  );

  useGSAP(
    () => {
      if (!district) return;
      const reduce = prefersReducedMotion();
      const badge = districtBadgeRef.current;
      if (badge && !reduce) {
        gsap.fromTo(
          badge,
          { autoAlpha: 0, scale: 0.85 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 0.2,
            ease: 'power3.out',
            clearProps: 'transform,willChange',
          }
        );
      }
    },
    { scope: searchContainerRef, dependencies: [district] }
  );

  useGSAP(
    () => {
      if (activeFilterCount <= 0) return;
      const badge = filterCountBadgeRef.current;
      if (!badge || prefersReducedMotion()) return;
      gsap.fromTo(
        badge,
        { autoAlpha: 0, scale: 0.75 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.2,
          ease: 'power3.out',
          clearProps: 'transform,willChange',
        }
      );
    },
    { scope: searchContainerRef, dependencies: [activeFilterCount] }
  );

  useGSAP(
    (_context, contextSafe) => {
      if (!isFilterBarMounted) {
        wasFilterBarMountedRef.current = false;
        return;
      }

      const bar = activeFilterBarRef.current;
      if (!bar) return;

      filterBarTweenRef.current?.kill();
      const reduce = prefersReducedMotion();

      const finalize = contextSafe
        ? contextSafe(() => {
            wasFilterBarMountedRef.current = false;
            setIsFilterBarMounted(false);
          })
        : () => {
            wasFilterBarMountedRef.current = false;
            setIsFilterBarMounted(false);
          };

      if (activeFilterCount > 0) {
        if (!wasFilterBarMountedRef.current) {
          wasFilterBarMountedRef.current = true;
          gsap.set(bar, { autoAlpha: 0, y: reduce ? 0 : -6 });
        }
        filterBarTweenRef.current = gsap.to(bar, {
          autoAlpha: 1,
          y: 0,
          duration: reduce ? 0.1 : 0.22,
          ease: 'power3.out',
          clearProps: 'transform,willChange',
        });
      } else {
        filterBarTweenRef.current = gsap.to(bar, {
          autoAlpha: 0,
          y: reduce ? 0 : -6,
          duration: reduce ? 0.08 : 0.14,
          ease: 'power2.in',
          onComplete: finalize,
        });
      }
    },
    { scope: searchContainerRef, dependencies: [activeFilterCount, isFilterBarMounted] }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (category) params.set('category', category);
    if (district) params.set('district', district);

    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div
      ref={searchContainerRef}
      className={`w-full max-w-4xl relative ${
        isDropdownOpen || isDropdownMounted ? 'z-50' : 'z-20'
      }`}
    >
      <form
        onSubmit={handleSearch}
        className="w-full bg-[var(--bg-surface)] p-2.5 sm:p-3 rounded-xl shadow-soft-2xl border border-[var(--border-subtle)] flex flex-col md:flex-row items-stretch md:items-center gap-2 transition-[box-shadow,border-color] duration-200 text-left"
      >
        {/* Keyword input */}
        <div
          className={`flex-1 w-full min-w-0 flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors duration-200 relative ${
            isKeywordFocused
              ? 'bg-[var(--accent-jade-soft)]/35 border-[var(--accent-jade)]'
              : 'border-transparent hover:bg-[var(--bg-surface-muted)]/60'
          }`}
        >
          <Search
            aria-hidden="true"
            className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${
              isKeywordFocused ? 'text-[var(--accent-jade)]' : 'text-[var(--ink-muted)]'
            }`}
          />
          <div className="w-full min-w-0 flex-1">
            <label
              htmlFor="hero-keyword-input"
              className="block text-xs font-semibold text-[var(--ink-muted)] truncate"
            >
              Bạn muốn đi đâu?
            </label>
            <input
              ref={inputRef}
              id="hero-keyword-input"
              type="text"
              value={keyword}
              onChange={(e) => {
                const next = e.target.value;
                setKeyword(next);
                if (next.length > 0) setIsClearMounted(true);
                openDropdownWithQuery(next);
              }}
              onFocus={() => {
                setIsKeywordFocused(true);
                if (keyword.trim()) openDropdownWithQuery(keyword);
              }}
              onBlur={() => setIsKeywordFocused(false)}
              placeholder="Lý Sơn, Măng Đen, Sa Huỳnh..."
              className="w-full min-w-0 text-base sm:text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] bg-transparent focus:outline-none font-medium"
            />
          </div>
          {isClearMounted && (
            <button
              ref={clearBtnRef}
              type="button"
              onClick={() => {
                setKeyword('');
                setIsDropdownOpen(false);
                inputRef.current?.focus();
              }}
              className="min-h-10 min-w-10 rounded-lg text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] flex items-center justify-center transition-colors shrink-0 cursor-pointer invisible opacity-0"
              title="Xóa từ khóa"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="w-full h-px md:w-px md:h-9 bg-[var(--border-subtle)] shrink-0" aria-hidden="true" />

        {/* Category selector */}
        <div
          ref={categoryBoxRef}
          className={`w-full md:w-52 min-w-0 flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors duration-200 ${
            isCategoryFocused
              ? 'bg-[var(--accent-jade-soft)]/40 border-[var(--accent-jade)]'
              : category
                ? 'bg-[var(--accent-jade-soft)]/30 border-[var(--accent-jade)]/30'
                : 'border-transparent hover:bg-[var(--bg-surface-muted)]/60'
          }`}
        >
          <Grid
            aria-hidden="true"
            className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${
              isCategoryFocused || category ? 'text-[var(--accent-jade)]' : 'text-[var(--ink-muted)]'
            }`}
          />
          <div className="w-full min-w-0 flex-1 relative">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <label
                htmlFor="hero-category-select"
                className="block text-xs font-semibold text-[var(--ink-muted)] truncate"
              >
                Danh mục
              </label>
              {category && (
                <span
                  ref={categoryBadgeRef}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-[var(--accent-jade)] text-[#FFFDF9] text-[10px] font-semibold leading-none shrink-0"
                >
                  Đang lọc
                </span>
              )}
            </div>
            <div className="relative w-full min-w-0">
              <select
                id="hero-category-select"
                value={category}
                onMouseDown={() => setIsCategoryMenuOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
                    setIsCategoryMenuOpen(true);
                  } else if (e.key === 'Escape') {
                    setIsCategoryMenuOpen(false);
                  }
                }}
                onFocus={() => setIsCategoryFocused(true)}
                onBlur={() => {
                  setIsCategoryFocused(false);
                  setIsCategoryMenuOpen(false);
                }}
                onChange={(e) => {
                  updateFilters(e.target.value, district);
                  setIsCategoryMenuOpen(false);
                }}
                className={`w-full min-w-0 max-w-full truncate text-base sm:text-sm bg-transparent focus:outline-none cursor-pointer appearance-none pr-6 transition-colors ${
                  category ? 'text-[var(--accent-jade-ink)] font-semibold' : 'text-[var(--ink-primary)] font-medium'
                }`}
              >
                <option value="" className="text-[var(--ink-primary)] bg-[var(--bg-surface)]">
                  Tất cả danh mục
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="text-[var(--ink-primary)] bg-[var(--bg-surface)]">
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className={`w-4 h-4 text-[var(--ink-muted)] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
                  isCategoryMenuOpen ? 'rotate-180 text-[var(--accent-jade)]' : 'rotate-0'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px md:w-px md:h-9 bg-[var(--border-subtle)] shrink-0" aria-hidden="true" />

        {/* District selector */}
        <div
          ref={districtBoxRef}
          className={`w-full md:w-52 min-w-0 flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-colors duration-200 ${
            isDistrictFocused
              ? 'bg-[var(--accent-jade-soft)]/40 border-[var(--accent-jade)]'
              : district
                ? 'bg-[var(--accent-jade-soft)]/30 border-[var(--accent-jade)]/30'
                : 'border-transparent hover:bg-[var(--bg-surface-muted)]/60'
          }`}
        >
          <MapPin
            aria-hidden="true"
            className={`w-4.5 h-4.5 shrink-0 transition-colors duration-200 ${
              isDistrictFocused || district ? 'text-[var(--accent-jade)]' : 'text-[var(--ink-muted)]'
            }`}
          />
          <div className="w-full min-w-0 flex-1 relative">
            <div className="flex items-center justify-between gap-1.5 min-w-0">
              <label
                htmlFor="hero-district-select"
                className="block text-xs font-semibold text-[var(--ink-muted)] truncate"
              >
                Khu vực
              </label>
              {district && (
                <span
                  ref={districtBadgeRef}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-[var(--accent-jade)] text-[#FFFDF9] text-[10px] font-semibold leading-none shrink-0"
                >
                  Đang lọc
                </span>
              )}
            </div>
            <div className="relative w-full min-w-0">
              <select
                id="hero-district-select"
                value={district}
                onMouseDown={() => setIsDistrictMenuOpen((prev) => !prev)}
                onKeyDown={(e) => {
                  if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
                    setIsDistrictMenuOpen(true);
                  } else if (e.key === 'Escape') {
                    setIsDistrictMenuOpen(false);
                  }
                }}
                onFocus={() => setIsDistrictFocused(true)}
                onBlur={() => {
                  setIsDistrictFocused(false);
                  setIsDistrictMenuOpen(false);
                }}
                onChange={(e) => {
                  updateFilters(category, e.target.value);
                  setIsDistrictMenuOpen(false);
                }}
                className={`w-full min-w-0 max-w-full truncate text-base sm:text-sm bg-transparent focus:outline-none cursor-pointer appearance-none pr-6 transition-colors ${
                  district ? 'text-[var(--accent-jade-ink)] font-semibold' : 'text-[var(--ink-primary)] font-medium'
                }`}
              >
                <option value="" className="text-[var(--ink-primary)] bg-[var(--bg-surface)]">
                  Toàn bộ tỉnh
                </option>
                {districts.map((dist) => (
                  <option key={dist.id} value={dist.id} className="text-[var(--ink-primary)] bg-[var(--bg-surface)]">
                    {dist.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className={`w-4 h-4 text-[var(--ink-muted)] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
                  isDistrictMenuOpen ? 'rotate-180 text-[var(--accent-jade)]' : 'rotate-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="ui-interactive-press group/submit w-full md:w-auto shrink-0 min-h-12 px-6 bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] font-semibold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Tìm địa điểm</span>
          {activeFilterCount > 0 && (
            <span
              ref={filterCountBadgeRef}
              aria-label={`${activeFilterCount} bộ lọc đang bật`}
              className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#FFFDF9]/20 text-[#FFFDF9] text-xs font-bold leading-none tabular-nums"
            >
              {activeFilterCount}
            </span>
          )}
          <ArrowRight
            aria-hidden="true"
            className="w-4 h-4 transition-transform duration-200 motion-safe:group-hover/submit:translate-x-0.5 motion-reduce:transition-none"
          />
        </button>
      </form>

      {/* Active filter chips */}
      {isFilterBarMounted && (
        <div
          ref={activeFilterBarRef}
          className="mt-2.5 flex flex-wrap items-center justify-center gap-2 px-1 invisible opacity-0"
        >
          {filterBarSnapshot.categoryName && (
            <button
              type="button"
              onClick={() => updateFilters('', district)}
              className="ui-interactive-press inline-flex items-center gap-1.5 max-w-full min-w-0 min-h-9 px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--ink-primary)] text-xs font-semibold border border-[var(--border-subtle)] cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
              <span className="truncate">Danh mục: {filterBarSnapshot.categoryName}</span>
              <X className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" aria-hidden="true" />
            </button>
          )}
          {filterBarSnapshot.districtName && (
            <button
              type="button"
              onClick={() => updateFilters(category, '')}
              className="ui-interactive-press inline-flex items-center gap-1.5 max-w-full min-w-0 min-h-9 px-3 py-1 rounded-full bg-[var(--bg-surface)] text-[var(--ink-primary)] text-xs font-semibold border border-[var(--border-subtle)] cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
              <span className="truncate">Khu vực: {filterBarSnapshot.districtName}</span>
              <X className="w-3.5 h-3.5 text-[var(--ink-muted)] shrink-0" aria-hidden="true" />
            </button>
          )}
          {activeFilterCount > 1 && (
            <button
              type="button"
              onClick={() => updateFilters('', '')}
              className="ui-interactive-press min-h-9 px-3 py-1 rounded-full bg-[#111A18]/80 hover:bg-[#111A18] text-[#F5F2EB] text-xs font-semibold border border-white/20 cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}

      {/* Autocomplete Suggestions Dropdown */}
      {isDropdownMounted && effectiveQuery.trim().length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-[calc(100%+8px)] left-0 right-0 w-full bg-[var(--bg-surface)] rounded-xl shadow-soft-2xl border border-[var(--border-subtle)] overflow-hidden z-50 invisible opacity-0 text-left"
        >
          <div className="px-4 py-2.5 bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs text-[var(--ink-muted)] font-medium">
            <span className="flex items-center gap-1.5 min-w-0">
              <Compass className="w-3.5 h-3.5 text-[var(--accent-jade)] shrink-0" aria-hidden="true" />
              <span className="truncate">Gợi ý địa điểm cho &quot;{effectiveQuery}&quot;</span>
            </span>
            <span className="text-xs text-[var(--accent-jade-ink)] font-semibold shrink-0 tabular-nums">
              {suggestedPlaces.length > 0 ? `${suggestedPlaces.length} kết quả` : '0 kết quả'}
            </span>
          </div>

          {suggestedPlaces.length > 0 ? (
            <div className="divide-y divide-[var(--border-subtle)] max-h-80 overflow-y-auto">
              {suggestedPlaces.map((place) => {
                const cat = categories.find((c) => c.id === place.category_id);
                const dist = districts.find((d) => d.id === place.district_id);
                const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');

                return (
                  <div
                    key={place.id}
                    data-suggestion-row
                    className="p-3 hover:bg-[var(--accent-jade-soft)]/35 transition-colors duration-150 flex items-center justify-between gap-3"
                  >
                    <Link
                      href={`/places/${place.id}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 min-w-0 flex-1 group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--bg-surface-muted)]">
                        <Image
                          src={place.cover_image}
                          alt={cleanName}
                          fill
                          sizes="48px"
                          className="object-cover motion-safe:group-hover:scale-103 transition-transform duration-300 motion-reduce:transition-none"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[var(--ink-primary)] group-hover:text-[var(--accent-jade)] transition-colors truncate">
                          {cleanName}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--ink-muted)] min-w-0">
                          {cat && (
                            <span className="text-xs font-medium text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] px-2 py-0.5 rounded-sm truncate max-w-[140px]">
                              {cat.name}
                            </span>
                          )}
                          <span className="truncate">{dist?.name || place.address}</span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex items-center text-xs text-[var(--ink-primary)] font-semibold tabular-nums">
                        <Star
                          aria-hidden="true"
                          className="w-3.5 h-3.5 fill-[var(--accent-ochre-bright)] text-[var(--accent-ochre-bright)] mr-1"
                        />
                        <span>{place.rating}</span>
                      </div>

                      <Link
                        href={`/map?placeId=${place.id}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="ui-interactive-press min-h-10 px-3 rounded-lg text-[var(--accent-jade-ink)] hover:text-[#FFFDF9] hover:bg-[var(--accent-jade)] bg-[var(--accent-jade-soft)] flex items-center gap-1.5 text-xs font-semibold"
                        title="Xem vị trí trên bản đồ số"
                      >
                        <Map className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">Bản đồ</span>
                      </Link>
                    </div>
                  </div>
                );
              })}

              <div className="p-2.5 bg-[var(--bg-canvas)] border-t border-[var(--border-subtle)] text-center">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="min-h-10 px-4 text-xs font-semibold text-[var(--accent-jade)] hover:text-[var(--accent-jade-hover)] hover:underline inline-flex items-center justify-center gap-1.5 mx-auto max-w-full cursor-pointer"
                >
                  <span className="truncate">
                    Xem tất cả kết quả cho &quot;{effectiveQuery}&quot;
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-[var(--ink-muted)]">
              <MapPin className="w-7 h-7 text-[var(--border-strong)] mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--ink-primary)] break-words">
                Không tìm thấy địa điểm khớp với &quot;{effectiveQuery}&quot;
              </p>
              <p className="text-xs text-[var(--ink-muted)] mt-1">Gợi ý tìm kiếm nhanh:</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                {['Lý Sơn', 'Măng Đen', 'Thiên Ấn', 'Sơn Mỹ', 'Sa Huỳnh', 'Kon Tum', 'Sâm Ngọc Linh'].map(
                  (tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setKeyword(tag);
                        setIsClearMounted(true);
                        openDropdownWithQuery(tag);
                        inputRef.current?.focus();
                      }}
                      className="min-h-9 px-3 py-1 rounded-full bg-[var(--bg-surface-muted)] hover:bg-[var(--accent-jade-soft)] hover:text-[var(--accent-jade-ink)] text-[var(--ink-primary)] font-medium transition-colors cursor-pointer"
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
