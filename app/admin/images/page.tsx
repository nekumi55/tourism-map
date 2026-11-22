import React from 'react';
import { Metadata } from 'next';
import ImageManager from '@/components/admin/ImageManager';

export const metadata: Metadata = {
  title: 'Công Cụ Quản Lý & Chỉnh Sửa Hình Ảnh Trực Quan | Non Xanh Map',
  description:
    'Giao diện trực quan cho phép thêm mới, xóa, thay đổi thứ tự và chọn ảnh đại diện cho các địa điểm du lịch.',
};

export default function AdminImagesPage() {
  return (
    <div className="w-full flex-1 bg-slate-50 min-h-screen">
      <ImageManager />
    </div>
  );
}
