import React, { Suspense } from 'react';
import { Metadata } from 'next';
import ItineraryPageContent from '@/components/itinerary/ItineraryPageContent';

export const metadata: Metadata = {
  title: 'Lập Lịch Trình Du Lịch Quảng Ngãi & Chỉ Dẫn Bản Đồ Trực Quan',
  description:
    'Công cụ tự động lên lịch trình du lịch Quảng Ngãi: chọn thứ tự các điểm dừng, thống kê tổng cự ly di chuyển (km), thời gian và chỉ dẫn đường đi trên bản đồ số.',
};

export default function ItineraryPage() {
  return (
    <div className="w-full flex-1 bg-slate-50 min-h-screen">
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
            Đang tải công cụ lập lịch trình du lịch...
          </div>
        }
      >
        <ItineraryPageContent />
      </Suspense>
    </div>
  );
}
