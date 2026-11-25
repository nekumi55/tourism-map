import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  Map,
  Compass,
  Route,
  MapPin,
  Layers,
  ArrowRight,
  Palmtree,
  Landmark,
  Trees,
} from 'lucide-react';
import ContactForm from '@/components/about/ContactForm';
import AnimatedContent from '@/components/ui/AnimatedContent/AnimatedContent';

export const metadata: Metadata = {
  title: 'Giới Thiệu Bản Đồ Số Du Lịch Tỉnh Quảng Ngãi | Tổng Quan & Góp Ý',
  description:
    'Thông tin về nền tảng bản đồ số du lịch tỉnh Quảng Ngãi, kết nối vùng biển đảo Lý Sơn, di sản Sa Huỳnh và cao nguyên Măng Đen – Chư Mom Ray.',
};

export default function AboutPage() {
  return (
    <div className="bg-[var(--bg-canvas)] min-h-screen pb-20">
      {/* Header Band */}
      <section className="bg-[var(--bg-basalt)] text-[var(--ink-on-dark)] border-b border-[#24332F] py-16 md:py-22">
        <AnimatedContent
          trigger="mount"
          distance={16}
          duration={0.42}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="font-serif text-3xl sm:text-5xl font-semibold tracking-[-0.025em] leading-[1.15] text-[#FFFDF9]">
            Bản Đồ Số Di Sản &amp; Du Lịch Tỉnh Quảng Ngãi
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[var(--ink-on-dark-muted)] leading-relaxed max-w-2xl mx-auto">
            Cổng tra cứu địa danh và lập lịch trình tương tác, kết nối du khách với biển đảo Lý Sơn, di tích Sa Huỳnh, núi Thiên Ấn và cao nguyên đại ngàn Măng Đen.
          </p>
        </AnimatedContent>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 space-y-12">
        {/* Core Capabilities for Travelers */}
        <section className="bg-[var(--bg-surface)] rounded-xl p-6 sm:p-10 border border-[var(--border-subtle)] space-y-8">
          <div className="max-w-3xl">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tracking-[-0.02em]">
              Tính Năng Dành Cho Du Khách
            </h2>
            <p className="text-sm sm:text-base text-[var(--ink-secondary)] mt-2 leading-relaxed">
              Mọi công cụ trên trang được thiết kế gọn nhẹ để phục vụ tra cứu trước chuyến đi lẫn xem bản đồ ngoài thực địa trên điện thoại.
            </p>
          </div>

          <AnimatedContent
            distance={18}
            duration={0.38}
            threshold={0.12}
            stagger={0.06}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="p-6 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-jade-soft)] text-[var(--accent-jade)] flex items-center justify-center">
                <Layers className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif font-semibold text-[var(--ink-primary)] text-lg">
                Bản đồ tương tác đa lớp
              </h3>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                Định vị trực quan từng danh thắng theo hệ tọa độ chuẩn WGS84, chuyển đổi nhanh giữa lớp đường bộ, địa hình đồi núi và ảnh vệ tinh.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-ochre-soft)] text-[var(--accent-ochre)] flex items-center justify-center">
                <Compass className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif font-semibold text-[var(--ink-primary)] text-lg">
                Tra cứu địa danh &amp; đặc sản
              </h3>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                Tìm kiếm tiếng Việt không dấu hoặc có dấu theo danh mục thiên nhiên, biển đảo, di tích lịch sử, ẩm thực cùng thông tin giờ mở cửa và chi phí.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-jade-soft)] text-[var(--accent-jade)] flex items-center justify-center">
                <Route className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif font-semibold text-[var(--ink-primary)] text-lg">
                Sắp xếp lộ trình &amp; dẫn đường
              </h3>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                Tự chọn thứ tự các điểm dừng, ước lượng cự ly di chuyển từng chặng và mở ngay chỉ đường toàn tuyến trên Google Maps.
              </p>
            </div>
          </AnimatedContent>
        </section>

        {/* Three Landscapes & Feedback Form */}
        <AnimatedContent
          distance={20}
          duration={0.42}
          threshold={0.12}
          stagger={0.07}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Geographic Zones */}
          <section className="lg:col-span-7 bg-[var(--bg-surface)] rounded-xl p-6 sm:p-8 border border-[var(--border-subtle)] space-y-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--ink-primary)] tracking-[-0.02em]">
                Ba Miền Cảnh Quan Quảng Ngãi
              </h2>
              <p className="text-sm sm:text-base text-[var(--ink-secondary)] mt-2 leading-relaxed">
                Từ bờ biển dài và đảo tiền tiêu đến vùng cao nguyên rừng thông phía Tây, bản đồ tổng hợp 7 khu vực trọng điểm của tỉnh.
              </p>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              <div className="py-5 first:pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[#E1EFEF] text-[#0E5A63] flex items-center justify-center shrink-0 mt-0.5">
                    <Palmtree className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--ink-primary)] text-base">
                      Biển đảo Lý Sơn &amp; Vùng ven biển Sa Huỳnh
                    </h3>
                    <p className="text-sm text-[var(--ink-secondary)] mt-1 leading-relaxed">
                      Cổng Tò Vò, Chùa Hang, đỉnh Thới Lới, bãi biển Mỹ Khê và di sản văn hóa – đồng muối Sa Huỳnh.
                    </p>
                  </div>
                </div>
                <Link
                  href="/explore?district=dist-ly-son"
                  className="group text-xs font-semibold text-[var(--accent-jade)] hover:text-[var(--accent-jade-hover)] hover:underline inline-flex items-center gap-1 shrink-0 min-h-10 transition-colors"
                >
                  <span>Xem điểm đến</span>
                  <ArrowRight className="w-3.5 h-3.5 motion-safe:group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              </div>

              <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-ochre-soft)] text-[var(--accent-ochre)] flex items-center justify-center shrink-0 mt-0.5">
                    <Landmark className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--ink-primary)] text-base">
                      Dải sông Trà – Thành phố &amp; Di tích lịch sử
                    </h3>
                    <p className="text-sm text-[var(--ink-secondary)] mt-1 leading-relaxed">
                      Núi Thiên Ấn – Chùa Thiên Ấn, Khu chứng tích Sơn Mỹ, Khu lưu niệm Thủ tướng Phạm Văn Đồng và ẩm thực cá bống sông Trà.
                    </p>
                  </div>
                </div>
                <Link
                  href="/explore?district=dist-tp-quang-ngai"
                  className="group text-xs font-semibold text-[var(--accent-jade)] hover:text-[var(--accent-jade-hover)] hover:underline inline-flex items-center gap-1 shrink-0 min-h-10 transition-colors"
                >
                  <span>Xem điểm đến</span>
                  <ArrowRight className="w-3.5 h-3.5 motion-safe:group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              </div>

              <div className="py-5 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-jade-soft)] text-[var(--accent-jade)] flex items-center justify-center shrink-0 mt-0.5">
                    <Trees className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--ink-primary)] text-base">
                      Cao nguyên Măng Đen &amp; Đại ngàn phía Tây
                    </h3>
                    <p className="text-sm text-[var(--ink-secondary)] mt-1 leading-relaxed">
                      Rừng thông Măng Đen, Vườn quốc gia Chư Mom Ray, Nhà thờ gỗ Kon Tum, cầu treo Kon Klor và văn hóa cồng chiêng.
                    </p>
                  </div>
                </div>
                <Link
                  href="/explore?district=dist-mang-den"
                  className="group text-xs font-semibold text-[var(--accent-jade)] hover:text-[var(--accent-jade-hover)] hover:underline inline-flex items-center gap-1 shrink-0 min-h-10 transition-colors"
                >
                  <span>Xem điểm đến</span>
                  <ArrowRight className="w-3.5 h-3.5 motion-safe:group-hover:translate-x-0.5 transition-transform duration-200 motion-reduce:transition-none" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-3">
              <Link
                href="/map"
                className="ui-interactive-press min-h-11 px-4 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] text-sm font-semibold inline-flex items-center gap-2"
              >
                <Map className="w-4 h-4" aria-hidden="true" />
                <span>Mở bản đồ số</span>
              </Link>
              <Link
                href="/itinerary"
                className="ui-interactive-press min-h-11 px-4 rounded-lg border border-[var(--border-strong)] hover:bg-[var(--bg-surface-muted)] text-[var(--ink-primary)] text-sm font-semibold inline-flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-[var(--accent-jade)]" aria-hidden="true" />
                <span>Tạo lịch trình tour</span>
              </Link>
            </div>
          </section>

          {/* Contact & Suggestion Form */}
          <section className="lg:col-span-5 bg-[var(--bg-surface)] rounded-xl p-6 sm:p-8 border border-[var(--border-subtle)] space-y-5">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--ink-primary)]">
                Đóng Góp Thông Tin Địa Điểm
              </h2>
              <p className="text-sm text-[var(--ink-secondary)] mt-1.5 leading-relaxed">
                Bạn biết danh thắng mới hoặc muốn góp ý cập nhật thông tin? Hãy gửi phản hồi cho ban biên tập.
              </p>
            </div>
            <ContactForm />
          </section>
        </AnimatedContent>
      </div>
    </div>
  );
}
