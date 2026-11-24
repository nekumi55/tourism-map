import React, { Suspense } from 'react';
import { Metadata } from 'next';
import MapViewer from '@/components/map/MapViewer';

export const metadata: Metadata = {
  title: 'Bản Đồ Số Du Lịch Tỉnh Quảng Ngãi | Tương Tác Trực Quan',
  description:
    'Bản đồ số định vị các điểm đến du lịch, thắng cảnh, bãi biển và di tích văn hóa tỉnh Quảng Ngãi với bộ lọc trực quan và thông tin tọa độ đầy đủ.',
};

export default function MapPage() {
  return (
    <div className="w-full flex-1 flex flex-col overflow-hidden">
      {/* Prevent mobile body scrolling into footer and keep map pinned */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (max-width: 1023px) {
              body {
                overflow: hidden !important;
                overscroll-behavior: none;
              }
              footer {
                display: none !important;
              }
            }
          `,
        }}
      />
      <Suspense
        fallback={
          <div className="w-full h-[calc(100dvh-57px)] lg:h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-slate-900 text-teal-300 p-8 text-center">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm font-bold">Đang tải bản đồ số tương tác...</span>
          </div>
        }
      >
        <MapViewer />
      </Suspense>
    </div>
  );
}