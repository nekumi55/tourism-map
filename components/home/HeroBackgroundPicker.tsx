'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Image as ImageIcon, Check, X } from 'lucide-react';
import { useData } from '@/context/DataContext';

export const HERO_TEMPLATES = [
  {
    id: 'thien-an',
    name: 'Núi Thiên Ấn & Sông Trà',
    desc: 'Đệ nhất thắng cảnh thiêng liêng Quảng Ngãi',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    thumbnail:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'ly-son-sea',
    name: 'Biển Ngọc Lý Sơn',
    desc: 'Vương quốc tỏi & biển xanh trong vắt',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85',
    thumbnail:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'to-vo-sunset',
    name: 'Hoàng Hôn Cổng Tò Vò',
    desc: 'Kiệt tác nham thạch núi lửa triệu năm',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=85',
    thumbnail:
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'my-khe-beach',
    name: 'Bãi Biển Mỹ Khê',
    desc: 'Bờ cát mịn trải dài dưới rừng dương xanh',
    url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=2000&q=85',
    thumbnail:
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'thac-trang',
    name: 'Rừng Đại Ngàn Măng Đen',
    desc: 'Sương mù và rừng thông xứ lạnh 1.200m',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=85',
    thumbnail:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'ocean-gradient',
    name: 'Nền Ngọc Bích Tối Giản',
    desc: 'Dải màu tĩnh êm dịu, tải tức thì',
    url: 'linear-gradient(135deg, #0D5C53 0%, #111A18 100%)',
    thumbnail: '',
    isGradient: true,
  },
];

interface HeroBackgroundPickerProps {
  buttonVariant?: 'floating' | 'inline';
}

export default function HeroBackgroundPicker({ buttonVariant = 'floating' }: HeroBackgroundPickerProps) {
  const { settings, updateSettings } = useData();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectTemplate = (url: string) => {
    updateSettings({ heroBgImage: url });
  };

  return (
    <>
      {buttonVariant === 'floating' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ui-interactive-press absolute top-4 right-4 sm:top-6 sm:right-6 z-30 min-h-11 px-3.5 py-2 rounded-lg bg-[#111A18]/75 hover:bg-[#111A18]/90 backdrop-blur-md border border-white/25 text-[#F5F2EB] text-xs font-semibold flex items-center gap-2 cursor-pointer"
          title="Đổi khung cảnh trang chủ"
          aria-label="Đổi khung cảnh trang chủ"
        >
          <ImageIcon className="w-4 h-4 text-[#A3D9CE]" aria-hidden="true" />
          <span className="hidden sm:inline">Đổi khung cảnh</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ui-interactive-press min-h-10 px-3 py-1.5 rounded-lg bg-[#111A18]/70 hover:bg-[#111A18]/90 border border-white/25 text-[#F5F2EB] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ImageIcon className="w-3.5 h-3.5 text-[#A3D9CE]" aria-hidden="true" />
          <span>Khung cảnh</span>
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hero-picker-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          className="fixed inset-0 z-50 bg-[#111A18]/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[var(--bg-surface)] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-soft-2xl animate-in fade-in duration-200 border border-[var(--border-subtle)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h2
                  id="hero-picker-title"
                  className="font-serif font-semibold text-[var(--ink-primary)] text-xl"
                >
                  Chọn Khung Cảnh Trang Chủ
                </h2>
                <p className="text-sm text-[var(--ink-muted)] mt-0.5">
                  Lựa chọn cảnh sắc tiêu biểu của Quảng Ngãi làm ảnh nền đầu trang
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Đóng hộp thoại chọn ảnh nền"
                className="min-h-11 min-w-11 rounded-lg hover:bg-[var(--bg-surface-muted)] text-[var(--ink-secondary)] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {HERO_TEMPLATES.map((tmpl) => {
                const isSelected = settings.heroBgImage === tmpl.url;

                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.url)}
                    aria-pressed={isSelected}
                    className={`relative rounded-lg overflow-hidden border text-left cursor-pointer transition-all flex flex-col group p-2.5 ${
                      isSelected
                        ? 'border-[var(--accent-jade)] ring-2 ring-[var(--accent-jade)]/20 bg-[var(--accent-jade-soft)]/50'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="relative w-full h-24 rounded-md overflow-hidden mb-2.5 bg-[var(--bg-basalt)]">
                      {tmpl.isGradient ? (
                        <div className="w-full h-full" style={{ background: tmpl.url }} />
                      ) : (
                        <Image
                          src={tmpl.thumbnail}
                          alt={tmpl.name}
                          fill
                          sizes="220px"
                          className="object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--accent-jade)] text-[#FFFDF9] flex items-center justify-center shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 w-full">
                      <span className="font-semibold text-[var(--ink-primary)] text-sm truncate">
                        {tmpl.name}
                      </span>
                      {isSelected && (
                        <span className="text-xs font-semibold text-[var(--accent-jade-ink)] shrink-0">
                          Đang chọn
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--ink-muted)] truncate mt-0.5 w-full">
                      {tmpl.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ui-interactive-press min-h-11 px-5 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] font-semibold text-sm cursor-pointer"
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
