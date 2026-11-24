'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Compass, Phone } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function Footer() {
  const { settings, categories } = useData();

  return (
    <footer suppressHydrationWarning className="bg-slate-950 text-slate-300 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                {settings.siteTitle}
              </span>
            </Link>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {settings.heroSubheading}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4">
              Điều hướng
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-400 hover:text-white transition-colors">
                  Khám phá địa điểm
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-slate-400 hover:text-white transition-colors">
                  Bản đồ số tương tác
                </Link>
              </li>
              <li>
                <Link href="/itinerary" className="text-slate-400 hover:text-white transition-colors">
                  Du lịch theo lịch trình
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-white transition-colors">
                  Về dự án & Giới thiệu
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4">
              Danh mục trải nghiệm
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/explore?category=${cat.id}`}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-xs tracking-wider uppercase mb-4">
              Thông tin liên hệ
            </h3>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>{settings.contactOffice}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{settings.contactPhone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar (Bỏ hoàn toàn khu vực admin và các lưu ý thừa) */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{settings.copyrightText}</p>
          <div className="flex items-center gap-3 text-teal-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Bản Đồ Số Du Lịch Thông Minh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
