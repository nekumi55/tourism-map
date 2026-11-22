'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { useData } from '@/context/DataContext';

export const HERO_TEMPLATES = [
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
    name: 'Thác Trắng Minh Long',
    desc: 'Dòng thác bạc giữa núi rừng đại ngàn',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=85',
    thumbnail:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'thien-an',
    name: 'Núi Thiên Ấn & Sông Trà',
    desc: 'Đệ nhất thắng cảnh thiêng liêng Quảng Ngãi',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85',
    thumbnail:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'ocean-gradient',
    name: 'Dải Màu Biển Ngọc (Mặc định)',
    desc: 'Sắc xanh ngọc bích êm dịu, không lo chậm mạng',
    url: 'linear-gradient(135deg, #0f766e 0%, #0891b2 50%, #0369a1 100%)',
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

  const handleSelectTemplate = (url: string) => {
    updateSettings({ heroBgImage: url });
  };

  return (
    <>
      {/* Trigger Button: Floating or Inline */}
      {buttonVariant === 'floating' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/35 backdrop-blur-md border border-white/40 text-white text-xs font-bold flex items-center gap-2 shadow-soft-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Chọn mẫu ảnh nền"
        >
          <ImageIcon className="w-4 h-4 text-teal-300" />
          <span className="hidden sm:inline">Chọn mẫu ảnh nền</span>
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/35 border border-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 cursor-pointer shadow-xs"
        >
          <ImageIcon className="w-3.5 h-3.5 text-teal-300" />
          <span>Mẫu nền</span>
        </button>
      )}

      {/* Modal / Dialog (Only Curated Samples) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in fade-in duration-200 border border-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Chọn Mẫu Ảnh Nền Trang Chủ
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bấm chọn một trong các mẫu cảnh đẹp tiêu biểu của Quảng Ngãi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Curated Templates Grid (No Custom Upload or URL Input) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {HERO_TEMPLATES.map((tmpl) => {
                const isSelected = settings.heroBgImage === tmpl.url;

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.url)}
                    className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all flex flex-col group p-3 ${
                      isSelected
                        ? 'border-teal-600 ring-4 ring-teal-500/20 bg-teal-50/40 shadow-md'
                        : 'border-slate-200 hover:border-teal-300 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    {/* Visual Preview */}
                    <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2.5 bg-slate-800">
                      {tmpl.isGradient ? (
                        <div
                          className="w-full h-full"
                          style={{ background: tmpl.url }}
                        />
                      ) : (
                        <img
                          src={tmpl.thumbnail}
                          alt={tmpl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-3" />
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs truncate">
                        {tmpl.name}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-black text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-md shrink-0">
                          Đang dùng
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[11px] text-slate-500 truncate mt-0.5">
                      {tmpl.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
              >
                Đóng & Xem Trang Chủ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
