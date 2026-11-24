'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Search,
  Sparkles,
  Link as LinkIcon,
  Filter,
} from 'lucide-react';
import { PRESET_IMAGE_LIBRARY, LibraryImage } from '@/data/imageLibrary';

interface ImageLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  currentImage?: string;
  title?: string;
}

export default function ImageLibraryModal({
  isOpen,
  onClose,
  onSelect,
  currentImage,
  title = 'Thư Viện Hình Ảnh Địa Danh & Tải Lên',
}: ImageLibraryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentImage || '');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [uploadedImages, setUploadedImages] = useState<LibraryImage[]>(() => {
    // Check if there are previously uploaded images in session
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('tourism_session_uploaded_imgs');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');

  if (!isOpen) return null;

  // Handle local file upload (from PC / Phone gallery)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chỉ chọn file hình ảnh (PNG, JPG, WEBP)!');
        return;
      }

      // Read file as Data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const newImg: LibraryImage = {
            id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            category: 'nature',
            categoryLabel: 'Ảnh từ máy',
            url: dataUrl,
            thumbnail: dataUrl,
            description: 'Ảnh tải lên trực tiếp từ thiết bị của bạn',
          };

          const nextUploads = [newImg, ...uploadedImages];
          setUploadedImages(nextUploads);
          setSelectedUrl(dataUrl);
          try {
            // Save to session storage (trim if too large)
            if (nextUploads.length <= 15) {
              sessionStorage.setItem('tourism_session_uploaded_imgs', JSON.stringify(nextUploads));
            }
          } catch {
            // Storage quota exceeded on heavy images, keep in React state
          }
          setActiveTab('library');
          setSelectedCategory('upload');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Combine presets with uploaded images
  const allImages = [...uploadedImages, ...PRESET_IMAGE_LIBRARY];

  const filteredImages = allImages.filter((img) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'upload'
        ? img.id.startsWith('upload-')
        : img.category === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (img.description && img.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleApply = () => {
    if (selectedUrl) {
      onSelect(selectedUrl);
      onClose();
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      onSelect(customUrl.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Chọn ảnh đẹp có sẵn hoặc tải ảnh trực tiếp từ thiết bị của bạn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-2.5 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'library'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thư viện ảnh mẫu ({allImages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải ảnh từ máy / điện thoại</span>
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2.5 px-1 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'url'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Dán link URL ngoài</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* TAB 1: LIBRARY VIEW */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Category Filters & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-between">
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'beaches', label: 'Biển đảo & Lý Sơn' },
                    { id: 'nature', label: 'Thiên nhiên' },
                    { id: 'culture', label: 'Di tích & Lễ hội' },
                    { id: 'cuisine', label: 'Ẩm thực' },
                    ...(uploadedImages.length > 0
                      ? [{ id: 'upload', label: `Ảnh từ máy (${uploadedImages.length})` }]
                      : []),
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedCategory === tab.id
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên ảnh..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Grid of Images */}
              {filteredImages.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy hình ảnh phù hợp.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {filteredImages.map((img) => {
                    const isPicked = selectedUrl === img.url;
                    return (
                      <div
                        key={img.id}
                        onClick={() => setSelectedUrl(img.url)}
                        className={`group relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 aspect-4/3 bg-slate-100 ${
                          isPicked
                            ? 'border-teal-600 ring-4 ring-teal-500/25 shadow-md scale-102'
                            : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                        }`}
                      >
                        <Image
                          src={img.thumbnail || img.url}
                          alt={img.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                        {/* Picked Indicator Badge */}
                        {isPicked && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Title & Tag */}
                        <div className="absolute bottom-2 left-2 right-2 text-white">
                          <p className="text-[11px] font-bold truncate drop-shadow-sm leading-tight">
                            {img.title}
                          </p>
                          <span className="text-[9px] text-teal-200 font-medium">
                            {img.categoryLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FROM DEVICE */}
          {activeTab === 'upload' && (
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                Tải ảnh trực tiếp từ máy tính hoặc điện thoại
              </h4>
              <p className="text-xs text-slate-500 max-w-md mb-6">
                Hỗ trợ định dạng JPG, PNG, WEBP. Ảnh được đọc tức thì trên trình duyệt mà không cần đăng ký tài khoản hay tải lên host trung gian.
              </p>

              <label className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md flex items-center gap-2 transition-all hover:scale-105">
                <Upload className="w-4 h-4" />
                <span>Chọn ảnh từ thiết bị của bạn</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedImages.length > 0 && (
                <div className="mt-8 w-full text-left">
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Ảnh bạn vừa tải lên trong phiên này ({uploadedImages.length}):
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {uploadedImages.map((img) => (
                      <div
                        key={img.id}
                        onClick={() => setSelectedUrl(img.url)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 ${
                          selectedUrl === img.url ? 'border-teal-600 ring-2 ring-teal-500' : 'border-slate-200'
                        }`}
                      >
                        <Image src={img.url} alt="Uploaded" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOM URL INPUT */}
          {activeTab === 'url' && (
            <div className="py-6 max-w-lg mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đường dẫn (URL) hình ảnh trực tuyến
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setSelectedUrl(e.target.value);
                    }}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Sử dụng
                  </button>
                </div>
              </div>

              {customUrl && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-600">Xem trước ảnh từ link:</span>
                  <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={customUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => alert('Không thể tải ảnh từ URL này, vui lòng kiểm tra lại link!')}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {selectedUrl ? (
              <>
                <div className="w-11 h-11 rounded-xl overflow-hidden relative shrink-0 border border-slate-200 bg-slate-200">
                  <img src={selectedUrl} alt="Selected preview" className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    Đã chọn ảnh
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium truncate block">
                    {selectedUrl.slice(0, 45)}...
                  </span>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Chưa có ảnh nào được chọn</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={!selectedUrl}
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Áp dụng ảnh này</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
