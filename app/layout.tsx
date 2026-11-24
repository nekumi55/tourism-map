import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MockDataBanner from '@/components/common/MockDataBanner';
import { DataProvider } from '@/context/DataContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Quảng Ngãi Tourism Map - Cổng Thông Tin & Bản Đồ Số Du Lịch Tỉnh Quảng Ngãi',
  description:
    'Khám phá danh lam thắng cảnh, vương quốc tỏi Lý Sơn, núi Thiên Ấn, bãi biển Mỹ Khê và văn hóa Sa Huỳnh tỉnh Quảng Ngãi với bản đồ số tương tác thông minh.',
  keywords: [
    'du lịch Quảng Ngãi',
    'bản đồ du lịch Quảng Ngãi',
    'bản đồ số',
    'địa điểm du lịch Quảng Ngãi',
    'Lý Sơn',
    'Thiên Ấn',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 selection:bg-teal-100 selection:text-teal-900 font-sans">
        <DataProvider>
          <MockDataBanner />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </DataProvider>
      </body>
    </html>
  );
}
