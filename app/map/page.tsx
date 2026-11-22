import React, { Suspense } from 'react';
import { Metadata } from 'next';
import MapViewer from '@/components/map/MapViewer';

export const metadata: Metadata = {
  title: 'Bản Đồ Số Du Lịch Tỉnh Non Xanh | Tương Tác Trực Quan',
  description:
    'Bản đồ số định vị các điểm đến du lịch, thắng cảnh, bãi biển và di tích văn hóa tỉnh Non Xanh với bộ lọc trực quan và thông tin tọa độ đầy đủ.',
};

export default function MapPage() {
  return (
    <div className="w-full h-full flex flex-col">
      <Suspense
        fallback={
          <div className="w-full h-[600px] flex items-center justify-center bg-slate-900 text-white text-sm">
            Đang tải bản đồ số tương tác...
          </div>
        }
      >
        <MapViewer />
      </Suspense>
    </div>
  );
}
