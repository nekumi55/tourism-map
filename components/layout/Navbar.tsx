'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Compass, Info, Home, Menu, X, Compass as LogoIcon, Search, Route } from 'lucide-react';
import { useData } from '@/context/DataContext';

const NAV_LINKS = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/explore', label: 'Khám phá', icon: Compass },
  { href: '/map', label: 'Bản đồ số', icon: Map },
  { href: '/itinerary', label: 'Lịch trình tour', icon: Route },
  { href: '/about', label: 'Giới thiệu', icon: Info },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useData();

  return (
    <header suppressHydrationWarning className="sticky top-0 z-50 w-full overflow-x-clip bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-soft-sm transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-3 h-16 md:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0 flex-1 lg:flex-initial lg:max-w-[250px] xl:max-w-[325px]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-teal-600 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 group-hover:shadow-glow transition-all shrink-0">
              <LogoIcon className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-base xl:text-lg tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                {settings.siteTitle}
              </span>
              <span className="text-[10px] md:text-[11px] text-slate-500 uppercase tracking-wider font-semibold truncate">
                {settings.siteSubtitle}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Protected from wrapping) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'text-teal-800 bg-teal-50/90 shadow-soft-sm font-bold border border-teal-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'} shrink-0`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
            <Link
              href="/explore"
              className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors shrink-0"
              title="Tìm kiếm địa điểm"
            >
              <Search className="w-5 h-5" />
            </Link>
            <Link
              href="/itinerary"
              className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-all shadow-soft-sm whitespace-nowrap shrink-0"
            >
              <Route className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Lên Lịch Trình</span>
            </Link>
            <Link
              href="/map"
              className="flex items-center gap-1.5 px-3.5 xl:px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs xl:text-sm font-bold shadow-soft transition-all hover:shadow-soft-xl active:scale-95 whitespace-nowrap shrink-0"
            >
              <Map className="w-4 h-4 shrink-0" />
              <span>Mở Bản Đồ</span>
            </Link>
          </div>

          {/* Mobile & Tablet (< lg) Menu Button */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <Link
              href="/map"
              className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <Map className="w-3.5 h-3.5" />
              <span>Bản đồ</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top duration-200 shadow-xl">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'text-teal-800 bg-teal-50 font-bold border border-teal-200/60'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
