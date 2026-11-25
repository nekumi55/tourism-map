'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Compass, Info, Home, Menu, X, Search, Route } from 'lucide-react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useData } from '@/context/DataContext';

gsap.registerPlugin(useGSAP);

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/explore', label: 'Khám phá', icon: Compass },
  { href: '/map', label: 'Bản đồ số', icon: Map },
  { href: '/itinerary', label: 'Lịch trình', icon: Route },
  { href: '/about', label: 'Giới thiệu', icon: Info },
];

const BASE_INDICATOR_WIDTH = 96;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDrawerRendered, setIsDrawerRendered] = useState(false);
  const { settings } = useData();

  const desktopNavRef = useRef<HTMLElement>(null);
  const activeIndicatorRef = useRef<HTMLSpanElement>(null);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const hasPlacedIndicatorRef = useRef(false);
  const indicatorTweenRef = useRef<gsap.core.Tween | null>(null);

  const scrimRef = useRef<HTMLDivElement>(null);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const drawerItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const drawerTlRef = useRef<gsap.core.Timeline | null>(null);
  const wasDrawerMountedRef = useRef(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const activeIndex = NAV_LINKS.findIndex(
    (link) => pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
  );
  const activeIndexRef = useRef(activeIndex);

  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const placeIndicator = useCallback((targetIndex: number, animate: boolean) => {
    const navEl = desktopNavRef.current;
    const indicatorEl = activeIndicatorRef.current;
    if (!navEl || !indicatorEl) return;

    const targetEl = targetIndex >= 0 ? navItemRefs.current[targetIndex] : null;
    const reduce = prefersReducedMotion();

    if (!targetEl || targetEl.offsetWidth === 0 || navEl.offsetWidth === 0) {
      indicatorTweenRef.current?.kill();
      if (targetIndex < 0 && hasPlacedIndicatorRef.current && animate) {
        indicatorTweenRef.current = gsap.to(indicatorEl, {
          autoAlpha: 0,
          scaleX: 0.3,
          duration: reduce ? 0.14 : 0.18,
          ease: 'power2.out',
          overwrite: true,
          onComplete: () => {
            gsap.set(indicatorEl, { clearProps: 'willChange' });
          },
        });
      } else {
        gsap.set(indicatorEl, { autoAlpha: 0 });
      }
      hasPlacedIndicatorRef.current = false;
      return;
    }

    const inset = 12;
    const barWidth = Math.max(24, targetEl.offsetWidth - inset * 2);
    const targetX = targetEl.offsetLeft + inset;
    const targetScaleX = barWidth / BASE_INDICATOR_WIDTH;

    indicatorTweenRef.current?.kill();

    if (!hasPlacedIndicatorRef.current || !animate) {
      hasPlacedIndicatorRef.current = true;
      gsap.set(indicatorEl, {
        x: targetX,
        scaleX: targetScaleX,
        autoAlpha: 1,
        transformOrigin: 'left center',
        clearProps: 'willChange',
      });
      return;
    }

    indicatorTweenRef.current = gsap.to(indicatorEl, {
      x: targetX,
      scaleX: targetScaleX,
      autoAlpha: 1,
      duration: reduce ? 0.2 : 0.32,
      ease: 'power3.out',
      willChange: 'transform, opacity',
      overwrite: true,
      onComplete: () => {
        gsap.set(indicatorEl, { clearProps: 'willChange' });
      },
    });
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerRendered(true);
    setIsMobileMenuOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleDrawer = useCallback(() => {
    if (isMobileMenuOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }, [isMobileMenuOpen, closeDrawer, openDrawer]);

  useGSAP(
    () => {
      placeIndicator(activeIndex, true);
    },
    { scope: desktopNavRef, dependencies: [activeIndex, placeIndicator] }
  );

  useEffect(() => {
    const handleResize = () => {
      placeIndicator(activeIndexRef.current, false);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [placeIndicator]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer();
        menuButtonRef.current?.focus();
      }
    };

    const handlePopState = () => {
      closeDrawer();
    };

    const lgQuery = window.matchMedia('(min-width: 1024px)');
    const handleBreakpointChange = (e: MediaQueryListEvent) => {
      if (e.matches) closeDrawer();
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    lgQuery.addEventListener('change', handleBreakpointChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      lgQuery.removeEventListener('change', handleBreakpointChange);
    };
  }, [isMobileMenuOpen, closeDrawer]);

  useGSAP(
    (_context, contextSafe) => {
      if (!isDrawerRendered) {
        wasDrawerMountedRef.current = false;
        return;
      }

      const scrim = scrimRef.current;
      const panel = drawerPanelRef.current;
      const items = drawerItemRefs.current.filter(
        (el): el is HTMLAnchorElement => el !== null
      );
      if (!scrim || !panel) return;

      drawerTlRef.current?.kill();
      const reduce = prefersReducedMotion();

      const finalizeClose = contextSafe
        ? contextSafe(() => {
            wasDrawerMountedRef.current = false;
            setIsDrawerRendered(false);
          })
        : () => {
            wasDrawerMountedRef.current = false;
            setIsDrawerRendered(false);
          };

      if (isMobileMenuOpen) {
        if (!wasDrawerMountedRef.current) {
          wasDrawerMountedRef.current = true;
          gsap.set(scrim, { autoAlpha: 0 });
          gsap.set(panel, { autoAlpha: 0, y: reduce ? 0 : -10 });
          gsap.set(items, { autoAlpha: 0, y: reduce ? 0 : -6 });
        }

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set([panel, ...items], { clearProps: 'willChange' });
          },
        });

        if (reduce) {
          tl.to(scrim, { autoAlpha: 1, duration: 0.1, ease: 'power1.out' }, 0)
            .to(panel, { autoAlpha: 1, y: 0, duration: 0.1, ease: 'power1.out' }, 0)
            .to(items, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'power1.out' }, 0);
        } else {
          tl.to(scrim, { autoAlpha: 1, duration: 0.22, ease: 'power2.out' }, 0)
            .to(
              panel,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.26,
                ease: 'power3.out',
                willChange: 'transform, opacity',
              },
              0
            )
            .to(
              items,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.22,
                stagger: 0.035,
                ease: 'power3.out',
                willChange: 'transform, opacity',
              },
              0.04
            );
        }

        drawerTlRef.current = tl;
      } else {
        const tl = gsap.timeline({
          onComplete: finalizeClose,
        });

        if (reduce) {
          tl.to(items, { autoAlpha: 0, duration: 0.08, ease: 'power1.in' }, 0)
            .to(panel, { autoAlpha: 0, duration: 0.09, ease: 'power1.in' }, 0)
            .to(scrim, { autoAlpha: 0, duration: 0.09, ease: 'power1.out' }, 0);
        } else {
          tl.to(
            items,
            {
              autoAlpha: 0,
              y: -4,
              duration: 0.12,
              stagger: { each: 0.02, from: 'end' },
              ease: 'power2.in',
              willChange: 'transform, opacity',
            },
            0
          )
            .to(
              panel,
              {
                autoAlpha: 0,
                y: -8,
                duration: 0.18,
                ease: 'power2.in',
                willChange: 'transform, opacity',
              },
              0.03
            )
            .to(
              scrim,
              {
                autoAlpha: 0,
                duration: 0.18,
                ease: 'power2.out',
              },
              0.02
            );
        }

        drawerTlRef.current = tl;
      }
    },
    { dependencies: [isMobileMenuOpen, isDrawerRendered] }
  );

  return (
    <>
      <header
        suppressHydrationWarning
        className="sticky top-0 z-50 w-full overflow-x-clip border-b border-[var(--border-subtle)] bg-[#FFFDF9]/95 backdrop-blur-md"
      >
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3 h-16 md:h-20">
              {/* Architectural Brand Lockup */}
              <Link
                href="/"
                onClick={isMobileMenuOpen ? closeDrawer : undefined}
                className="flex items-center gap-3 group min-w-0 flex-1 lg:flex-initial lg:max-w-[260px] xl:max-w-[320px] py-1 rounded-lg"
              >
                <div
                  aria-hidden="true"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-[var(--accent-jade)] text-[#FFFDF9] flex items-center justify-center shrink-0 transition-transform duration-200 ease-[var(--motion-ease-out)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-5 h-5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <polygon points="15.5 8.5 13.4 13.4 8.5 15.5 10.6 10.6 15.5 8.5" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-sans font-extrabold text-sm md:text-base tracking-tight text-[var(--ink-primary)] group-hover:text-[var(--accent-jade)] transition-colors duration-200 truncate">
                    {settings.siteTitle}
                  </span>
                  <span className="hidden sm:block text-[11px] text-[var(--ink-muted)] font-medium truncate">
                    Tỉnh Quảng Ngãi · Bản đồ Di sản & Du lịch
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav
                ref={desktopNavRef}
                aria-label="Điều hướng chính"
                className="hidden lg:flex items-center gap-1 shrink-0 relative p-1 rounded-xl bg-[var(--bg-surface-muted)]/80 border border-[var(--border-subtle)]"
              >
                <span
                  ref={activeIndicatorRef}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 bottom-1 h-[2.5px] w-24 rounded-full bg-[var(--accent-jade)] invisible opacity-0 z-20"
                />
                {NAV_LINKS.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = index === activeIndex;
                  return (
                    <Link
                      key={link.href}
                      ref={(el) => {
                        navItemRefs.current[index] = el;
                      }}
                      href={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative z-10 flex items-center gap-1.5 px-3 xl:px-3.5 min-h-9 rounded-lg text-[13px] xl:text-sm whitespace-nowrap transition-[color,background-color,box-shadow] duration-200 shrink-0 border ${
                        isActive
                          ? 'bg-[var(--bg-surface)] text-[var(--accent-jade)] font-bold border-[var(--border-subtle)] shadow-soft-sm'
                          : 'text-[var(--ink-secondary)] font-medium border-transparent hover:text-[var(--ink-primary)] hover:bg-[var(--bg-surface)]/65'
                      }`}
                    >
                      <Icon
                        aria-hidden="true"
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[var(--accent-jade)]' : 'text-[var(--ink-muted)]'
                        }`}
                      />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Right Action Controls */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <Link
                  href="/explore"
                  className="ui-interactive-press min-h-11 min-w-11 px-2.5 rounded-lg text-[var(--ink-secondary)] hover:text-[var(--accent-jade)] hover:bg-[var(--bg-surface-muted)]/70 flex items-center justify-center motion-reduce:transition-none shrink-0"
                  title="Tìm kiếm địa điểm"
                  aria-label="Tìm kiếm địa điểm"
                >
                  <Search className="w-4.5 h-4.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/map"
                  className="ui-interactive-press flex items-center gap-2 px-4 min-h-11 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] text-sm font-semibold whitespace-nowrap shrink-0"
                >
                  <Map className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Mở bản đồ</span>
                </Link>
              </div>

              {/* Mobile & Tablet (< lg) Controls */}
              <div className="flex lg:hidden items-center gap-2 shrink-0">
                <Link
                  href="/map"
                  onClick={isMobileMenuOpen ? closeDrawer : undefined}
                  className="ui-interactive-press min-h-11 px-3.5 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] text-xs sm:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Map className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Bản đồ</span>
                </Link>
                <button
                  ref={menuButtonRef}
                  type="button"
                  onClick={toggleDrawer}
                  className="ui-interactive-press min-h-11 min-w-11 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--ink-primary)] hover:bg-[var(--bg-surface-muted)] cursor-pointer"
                  aria-label={isMobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-nav-drawer"
                >
                  <span className="relative flex items-center justify-center w-5 h-5" aria-hidden="true">
                    <Menu
                      className={`w-5 h-5 absolute transition-[opacity,transform] duration-200 ease-[var(--motion-ease-out)] motion-reduce:duration-75 motion-reduce:rotate-0 motion-reduce:scale-100 ${
                        isMobileMenuOpen
                          ? 'opacity-0 rotate-90 scale-75'
                          : 'opacity-100 rotate-0 scale-100'
                      }`}
                    />
                    <X
                      className={`w-5 h-5 absolute transition-[opacity,transform] duration-200 ease-[var(--motion-ease-out)] motion-reduce:duration-75 motion-reduce:rotate-0 motion-reduce:scale-100 ${
                        isMobileMenuOpen
                          ? 'opacity-100 rotate-0 scale-100'
                          : 'opacity-0 -rotate-90 scale-75'
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isDrawerRendered && (
          <div
            id="mobile-nav-drawer"
            ref={drawerPanelRef}
            role="dialog"
            aria-modal="false"
            aria-label="Menu điều hướng"
            className="lg:hidden absolute top-full left-0 right-0 z-0 border-t border-[var(--border-subtle)] bg-[#FFFDF9] px-4 pt-3 pb-6 space-y-1.5 shadow-soft-2xl max-h-[calc(100dvh-4rem)] overflow-y-auto invisible opacity-0"
          >
            {NAV_LINKS.map((link, index) => {
              const Icon = link.icon;
              const isActive = index === activeIndex;
              return (
                <Link
                  key={link.href}
                  ref={(el) => {
                    drawerItemRefs.current[index] = el;
                  }}
                  href={link.href}
                  onClick={closeDrawer}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-4 min-h-12 rounded-lg text-base font-medium min-w-0 transition-colors duration-150 border ${
                    isActive
                      ? 'text-[var(--accent-jade-ink)] bg-[var(--accent-jade-soft)] font-semibold border-[var(--accent-jade)]/25'
                      : 'text-[var(--ink-primary)] border-transparent hover:bg-[var(--bg-surface-muted)]/70'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-[var(--accent-jade)]' : 'text-[var(--ink-muted)]'
                    }`}
                  />
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Mobile Drawer Scrim */}
      {isDrawerRendered && (
        <div
          ref={scrimRef}
          onClick={closeDrawer}
          aria-hidden="true"
          className="fixed inset-0 z-40 lg:hidden bg-[#111A18]/40 backdrop-blur-[2px] invisible opacity-0"
        />
      )}
    </>
  );
}
