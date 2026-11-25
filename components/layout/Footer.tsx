'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function Footer() {
  const { settings, categories } = useData();

  return (
    <footer
      suppressHydrationWarning
      className="bg-[var(--bg-basalt)] text-[var(--ink-on-dark)] border-t border-[#24332F]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div
                aria-hidden="true"
                className="w-9 h-9 rounded-lg bg-[var(--accent-jade)] text-[#FFFDF9] flex items-center justify-center shrink-0"
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
              <span className="font-serif font-semibold text-xl text-[#FFFDF9] tracking-tight group-hover:text-[#A3D9CE] transition-colors">
                {settings.siteTitle}
              </span>
            </Link>
            <p className="text-[var(--ink-on-dark-muted)] text-sm leading-relaxed">
              {settings.heroSubheading}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[#FFFDF9] font-semibold text-sm mb-4">
              Điều hướng
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="inline-block py-1 text-[var(--ink-on-dark-muted)] hover:text-[#FFFDF9] hover:underline underline-offset-4 decoration-[#7CC4B8]/70 transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="inline-block py-1 text-[var(--ink-on-dark-muted)] hover:text-[#FFFDF9] hover:underline underline-offset-4 decoration-[#7CC4B8]/70 transition-colors"
                >
                  Khám phá địa điểm
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="inline-block py-1 text-[var(--ink-on-dark-muted)] hover:text-[#FFFDF9] hover:underline underline-offset-4 decoration-[#7CC4B8]/70 transition-colors"
                >
                  Bản đồ số tương tác
                </Link>
              </li>
              <li>
                <Link
                  href="/itinerary"
                  className="inline-block py-1 text-[var(--ink-on-dark-muted)] hover:text-[#FFFDF9] hover:underline underline-offset-4 decoration-[#7CC4B8]/70 transition-colors"
                >
                  Lên lịch trình tour
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="inline-block py-1 text-[var(--ink-on-dark-muted)] hover:text-[#FFFDF9] hover:underline underline-offset-4 decoration-[#7CC4B8]/70 transition-colors"
                >
                  Giới thiệu nền tảng
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[#FFFDF9] font-semibold text-sm mb-4">
              Danh mục trải nghiệm
            </h3>
            <ul className="space-y-2 text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/explore?category=${cat.id}`}
                    className="inline-block py-1 text-[var(--ink-on-dark-muted)] hover:text-[#FFFDF9] hover:underline underline-offset-4 decoration-[#7CC4B8]/70 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[#FFFDF9] font-semibold text-sm mb-4">
              Thông tin liên hệ
            </h3>
            <div className="space-y-3 text-sm text-[var(--ink-on-dark-muted)]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#7CC4B8] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{settings.contactOffice}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#7CC4B8] shrink-0" aria-hidden="true" />
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:text-[#FFFDF9] hover:underline underline-offset-4 decoration-[#7CC4B8]/70 transition-colors"
                >
                  {settings.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-2.5 tabular-nums">
                <Phone className="w-4 h-4 text-[#7CC4B8] shrink-0" aria-hidden="true" />
                <span>{settings.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Colophon */}
        <div className="mt-12 pt-8 border-t border-[#24332F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-[var(--ink-on-dark-muted)]">
          <p>{settings.copyrightText}</p>
          <p className="text-xs text-[var(--ink-on-dark-muted)]">
            Ảnh minh họa tuyển chọn từ Unsplash · Dữ liệu bản đồ OpenStreetMap
          </p>
        </div>
      </div>
    </footer>
  );
}
