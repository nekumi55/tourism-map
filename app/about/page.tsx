import React from 'react';
import { Metadata } from 'next';
import {
  Compass,
  Code2,
  Sparkles,
  CheckCircle2,
  Milestone,
} from 'lucide-react';
import ContactForm from '@/components/about/ContactForm';

export const metadata: Metadata = {
  title: 'Giới Thiệu Dự Án Bản Đồ Số Du Lịch Tỉnh Quảng Ngãi | Mục Tiêu & Lộ Trình',
  description:
    'Tìm hiểu sứ mệnh số hóa du lịch tỉnh Quảng Ngãi, vương quốc tỏi Lý Sơn, di sản văn hóa Sa Huỳnh và danh thắng núi Thiên Ấn.',
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold mb-6">
            <Compass className="w-4 h-4" />
            <span>Về Dự Án Bản Đồ Số Du Lịch</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Số Hóa & Nâng Tầm Du Lịch{' '}
            <span className="bg-gradient-to-r from-teal-300 via-emerald-200 to-amber-200 bg-clip-text text-transparent">
              Tỉnh Quảng Ngãi
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Nền tảng bản đồ số tương tác thông minh, kết nối du khách với vương quốc biển đảo Lý Sơn, đệ nhất danh sơn Thiên Ấn, bờ biển Mỹ Khê và văn hóa Sa Huỳnh ngàn năm.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-12">
        {/* Project Objectives */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft-xl">
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
              Mục tiêu chiến lược
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sứ Mệnh Nền Tảng Bản Đồ Số Du Lịch
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Dự án được triển khai nhằm thúc đẩy chuyển đổi số du lịch tỉnh Quảng Ngãi, hỗ trợ du khách tiếp cận thông tin địa lý, lịch sử và tự tạo lịch trình khám phá thông minh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-teal-50/50 border border-teal-100 space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-soft-sm">
                01
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Trực quan hóa không gian du lịch
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Định vị các điểm đến trên bản đồ số thời gian thực, cho phép chuyển đổi lớp Vệ tinh, Địa hình và tự động tính cự ly di chuyển từng chặng.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-emerald-50/50 border border-emerald-100 space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-soft-sm">
                02
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Quảng bá di sản & đặc sản xứ Quảng
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Tôn vinh vương quốc tỏi Lý Sơn, văn hóa Sa Huỳnh 3.000 năm, đặc sản don sông Trà, bún cá ngừ và thác Trắng đại ngàn.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100 space-y-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-soft-sm">
                03
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Lập lịch trình tour tự động
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Công cụ tự động gợi ý lịch trình, tính toán khoảng cách và kết nối trực tiếp với Google Maps chỉ đường từng chặng cho du khách.
              </p>
            </div>
          </div>
        </div>

        {/* Development Roadmap */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-soft-xl">
          <div className="max-w-3xl mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
              Tiến độ triển khai
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lộ Trình Phát Triển Nền Tảng
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Phase 1 */}
            <div className="p-6 rounded-3xl bg-teal-50 border-2 border-teal-500 space-y-3 relative shadow-soft">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-600 text-white text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Giai Đoạn 1 (Hoàn thành)
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Bản Đồ Số & Tạo Lịch Trình Tour
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Bản đồ Leaflet đa lớp: Vệ tinh, Địa hình, Đường bộ</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tính năng lập tour tự động & chỉ dẫn Google Maps</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>CMS Quản trị trực quan cho toàn bộ website</span>
                </li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-soft-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                <Milestone className="w-3.5 h-3.5 text-teal-600" /> Giai Đoạn 2 (Mở rộng)
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Tích Hợp Supabase & Dữ Liệu Lớn
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Đồng bộ Supabase Database & PostGIS</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Hệ thống đánh giá & bình luận cộng đồng du khách</span>
                </li>
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-soft-sm">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Giai Đoạn 3 (Dài hạn)
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                Trợ Lý Ảo AI Hướng Dẫn Viên
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Trợ lý du lịch ảo thông minh giải đáp thắc mắc</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Ứng dụng di động PWA tải nhanh không cần mạng</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Code2 className="w-5 h-5 text-teal-600" />
              <span>Tiêu Chuẩn Nền Tảng Công Nghệ Hiện Đại</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Website được phát triển trên kiến trúc Next.js App Router, React 19, TypeScript và Leaflet GIS Engine. Mọi thông tin địa lý và danh lam thắng cảnh được tối ưu hóa cho trải nghiệm di động, máy tính bảng và màn hình lớn.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">
              Liên Hệ & Đóng Góp Ý Kiến
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn có địa điểm mới hoặc muốn đề xuất cải tiến bản đồ? Hãy gửi thông tin cho chúng tôi.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
