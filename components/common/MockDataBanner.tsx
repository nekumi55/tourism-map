'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function MockDataBanner() {
  const { settings } = useData();

  if (!settings.showBanner) return null;

  return (
    <div suppressHydrationWarning className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong className="font-semibold text-amber-800">Thông báo hệ thống:</strong> {settings.bannerText}
        </span>
      </div>
    </div>
  );
}
