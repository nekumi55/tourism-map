import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ExploreContainer from '@/components/explore/ExploreContainer';

export const metadata: Metadata = {
  title: 'Khám Phá Địa Điểm Du Lịch Tỉnh Quảng Ngãi | Danh Sách & Bộ Lọc',
  description:
    'Tra cứu toàn bộ danh lam thắng cảnh, bãi biển Lý Sơn, di tích lịch sử và ẩm thực đặc sản tỉnh Quảng Ngãi theo khu vực, danh mục và xếp hạng.',
};

export default function ExplorePage() {
  return (
    <div className="w-full flex-1 bg-[var(--bg-canvas)]">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[var(--ink-muted)] text-sm">
            Đang tải danh sách địa điểm...
          </div>
        }
      >
        <ExploreContainer />
      </Suspense>
    </div>
  );
}
