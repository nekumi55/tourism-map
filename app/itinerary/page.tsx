import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ItineraryPageContent from '@/components/itinerary/ItineraryPageContent';

export const metadata: Metadata = {
  title: 'Lập Lộ Trình Du Lịch Quảng Ngãi & Chỉ Dẫn Bản Đồ Trực Quan',
  description:
    'Công cụ lên lộ trình du lịch Quảng Ngãi: sắp xếp thứ tự các điểm dừng, tính tổng cự ly di chuyển (km), thời gian dự kiến và chỉ đường trên bản đồ số.',
};

export default function ItineraryPage() {
  return (
    <div className="w-full flex-1 bg-[var(--bg-canvas)] min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[var(--ink-muted)] text-sm">
            Đang tải công cụ lập lộ trình du lịch...
          </div>
        }
      >
        <ItineraryPageContent />
      </Suspense>
    </div>
  );
}
