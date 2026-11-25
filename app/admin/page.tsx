import React from 'react';
import { Metadata } from 'next';
import AdminAuthGate from '@/components/admin/AdminAuthGate';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Bảng Điều Khiển Quản Trị Hệ Thống | Quảng Ngãi Atlas',
  description:
    'Khu vực quản trị cho phép thêm sửa xóa địa điểm, gán tọa độ trực quan trên bản đồ, quản lý danh mục và cấu hình toàn bộ trang web.',
};

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <AdminDashboard />
    </AdminAuthGate>
  );
}
