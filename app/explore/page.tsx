import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ExploreContainer from '@/components/explore/ExploreContainer';

export const metadata: Metadata = {
  title: 'Khám Phá Địa Điểm Du Lịch Tỉnh Non Xanh | Danh Sách & Bộ Lọc',
  description:
    'Tra cứu toàn bộ danh lam thắng cảnh, bãi biển, di tích lịch sử và ẩm thực đặc sản tỉnh Non Xanh theo khu vực, danh mục và xếp hạng.',
};

export default function ExplorePage() {
  return (
    <div className="w-full flex-1 bg-slate-50">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
            Đang tải danh sách địa điểm...
          </div>
        }
      >
        <ExploreContainer />
      </Suspense>
    </div>
  );
}
