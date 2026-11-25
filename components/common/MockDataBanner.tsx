'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function MockDataBanner() {
  const { settings } = useData();

  if (!settings.showBanner) return null;

  return (
    <div
      suppressHydrationWarning
      className="bg-[var(--accent-ochre-soft)] border-b border-[var(--accent-ochre)]/25 text-[var(--ink-primary)] px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-[var(--accent-ochre)] shrink-0" aria-hidden="true" />
        <span>
          <strong className="font-semibold text-[var(--accent-ochre-ink)]">Thông báo:</strong>{' '}
          {settings.bannerText}
        </span>
      </div>
    </div>
  );
}
