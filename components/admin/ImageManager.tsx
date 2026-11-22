'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Upload,
  Link as LinkIcon,
  Check,
  Copy,
  RotateCcw,
  Eye,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { MOCK_PLACES } from '@/data/places';
import { Place } from '@/types';
import PlaceCard from '@/components/place/PlaceCard';

const STORAGE_KEY = 'tourism_map_custom_places';

export default function ImageManager() {
  const [places, setPlaces] = useState<Place[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return MOCK_PLACES;
  });

  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(MOCK_PLACES[0].id);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const selectedPlace = places.find((p) => p.id === selectedPlaceId) || places[0];

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const updateSelectedPlace = (updatedFields: Partial<Place>) => {
    const updatedPlaces = places.map((p) =>
      p.id === selectedPlace.id ? { ...p, ...updatedFields } : p
    );
    setPlaces(updatedPlaces);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlaces));
    }
    showNotification('Đã cập nhật hình ảnh thành công!');
  };

  // Add new image to gallery
  const handleAddImage = (url: string) => {
    if (!url.trim()) return;
    const newGallery = [...selectedPlace.gallery, url.trim()];
    updateSelectedPlace({ gallery: newGallery });
    setNewImageUrl('');
  };

  // Set image as cover
  const handleSetCover = (imgUrl: string) => {
    updateSelectedPlace({ cover_image: imgUrl });
    showNotification('Đã đặt làm ảnh đại diện!');
  };

  // Remove image from gallery
  const handleRemoveImage = (indexToRemove: number) => {
    const newGallery = selectedPlace.gallery.filter((_, idx) => idx !== indexToRemove);
    updateSelectedPlace({
      gallery: newGallery,
      cover_image:
        selectedPlace.cover_image === selectedPlace.gallery[indexToRemove]
          ? newGallery[0] || selectedPlace.cover_image
          : selectedPlace.cover_image,
    });
  };

  // Move image order
  const handleMoveImage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= selectedPlace.gallery.length) return;
    const newGallery = [...selectedPlace.gallery];
    const item = newGallery.splice(fromIdx, 1)[0];
    newGallery.splice(toIdx, 0, item);
    updateSelectedPlace({ gallery: newGallery });
  };

  // Upload local file (via FileReader as base64 preview)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          handleAddImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset to default mock data
  const handleResetDefaults = () => {
    if (confirm('Bạn có chắc muốn đặt lại toàn bộ hình ảnh về mặc định ban đầu?')) {
      setPlaces(MOCK_PLACES);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      showNotification('Đã khôi phục hình ảnh ban đầu.');
    }
  };

  // Export JSON
  const handleCopyJson = () => {
    const codeString = JSON.stringify(
      places.map((p) => ({
        id: p.id,
        name: p.name,
        cover_image: p.cover_image,
        gallery: p.gallery,
      })),
      null,
      2
    );
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            <Sliders className="w-4 h-4" />
            <span>Công Cụ Trực Quan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý & Chỉnh Sửa Hình Ảnh Địa Điểm
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Xem trước trực quan, thêm mới qua URL hoặc tải từ máy tính, sắp xếp thứ tự và chọn ảnh đại diện
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại mặc định</span>
          </button>
          <button
            onClick={handleCopyJson}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép JSON!' : 'Sao chép cấu hình'}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-teal-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Selector & Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLUMNS: EDITING CONTROLS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Select Place Dropdown */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Chọn địa điểm cần thay đổi hình ảnh:
            </label>
            <select
              value={selectedPlaceId}
              onChange={(e) => setSelectedPlaceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold focus:outline-hidden focus:border-teal-500 focus:bg-white"
            >
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name} ({place.gallery.length} ảnh)
                </option>
              ))}
            </select>
          </div>

          {/* Add Image Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-teal-600" />
              <span>2. Thêm hình ảnh mới vào bộ sưu tập</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Option A: URL Input */}
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Dán URL ảnh (https://images.unsplash.com/...)"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <button
                  onClick={() => handleAddImage(newImageUrl)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
                >
                  Thêm URL
                </button>
              </div>

              {/* Option B: Local File Upload */}
              <label className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Tải từ máy tính</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Unsplash Inspiration Presets */}
            <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <span>Gợi ý mẫu ảnh đẹp:</span>
              {[
                { label: 'Bãi biển', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
                { label: 'Núi rừng', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80' },
                { label: 'Đền chùa', url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80' },
                { label: 'Ẩm thực', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleAddImage(preset.url)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  +{preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Images Management Grid */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal-600" />
                <span>3. Danh sách ảnh hiện tại ({selectedPlace.gallery.length} ảnh)</span>
              </h3>
              <span className="text-xs text-slate-400">
                Ảnh có ngôi sao vàng là <strong>Ảnh đại diện (Cover)</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedPlace.gallery.map((img, idx) => {
                const isCover = selectedPlace.cover_image === img;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-2xl overflow-hidden border-2 transition-all p-2 bg-slate-50 flex flex-col justify-between gap-2 ${
                      isCover
                        ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-slate-200">
                      <img
                        src={img}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/70 text-white text-[10px] font-semibold">
                        #{idx + 1}
                      </div>
                      {isCover && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-white" />
                          <span>Ảnh bìa</span>
                        </div>
                      )}
                    </div>

                    {/* Actions Toolbar */}
                    <div className="flex items-center justify-between gap-1 pt-1">
                      {/* Left / Right Move */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveImage(idx, idx - 1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Di chuyển sang trái"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveImage(idx, idx + 1)}
                          disabled={idx === selectedPlace.gallery.length - 1}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Di chuyển sang phải"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Set Cover & Delete */}
                      <div className="flex items-center gap-1.5">
                        {!isCover && (
                          <button
                            onClick={() => handleSetCover(img)}
                            className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-700 text-slate-700 text-[11px] font-semibold transition-colors flex items-center gap-1"
                          >
                            <Star className="w-3 h-3 text-amber-500" />
                            <span>Đặt làm bìa</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME PREVIEW CARD */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-teal-600" />
                <span>Xem trước thời gian thực (Live Preview)</span>
              </h3>
              <Link
                href={`/places/${selectedPlace.id}`}
                target="_blank"
                className="text-xs text-teal-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Mở trang chi tiết</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Place Card Live Preview */}
            <div className="max-w-sm mx-auto">
              <PlaceCard place={selectedPlace} />
            </div>

            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/80 text-xs text-teal-900 space-y-1.5 leading-relaxed">
              <div className="font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span>Cách áp dụng vào mã nguồn vĩnh viễn:</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Bấm nút <strong>&quot;Sao chép cấu hình&quot;</strong> ở trên, sau đó dán các đường dẫn ảnh đã chọn vào file <code>data/places.ts</code>. Khi chuyển sang giai đoạn 2 kết nối Supabase, các ảnh sẽ được tải trực tiếp lên Supabase Storage qua API.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
