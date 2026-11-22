'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Grid,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ExternalLink,
  Eye,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Layers,
  Map,
  Sparkles,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Place, Category, District } from '@/types';
import { SiteSettings } from '@/types/settings';
import { HERO_TEMPLATES } from '@/components/home/HeroBackgroundPicker';

const AdminMapPicker = dynamic(() => import('@/components/admin/AdminMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-16/10 min-h-[500px] flex flex-col items-center justify-center bg-slate-900 text-teal-300 rounded-3xl">
      <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
      <span className="text-sm font-bold">Đang tải bản đồ số Google Maps để chỉnh tọa độ...</span>
    </div>
  ),
});

// Map normalization constants for Quảng Ngãi Province
const MIN_LAT = 14.60;
const MAX_LAT = 15.50;
const MIN_LNG = 108.40;
const MAX_LNG = 109.25;

function coordsToPercent(lat: number, lng: number) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
  const y = 100 - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * 100;
  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
  };
}

function percentToCoords(xPercent: number, yPercent: number) {
  const lng = MIN_LNG + (xPercent / 100) * (MAX_LNG - MIN_LNG);
  const lat = MAX_LAT - (yPercent / 100) * (MAX_LAT - MIN_LAT);
  return {
    lat: Number(lat.toFixed(4)),
    lng: Number(lng.toFixed(4)),
  };
}

export default function AdminDashboard() {
  const {
    places,
    categories,
    districts,
    settings,
    addPlace,
    updatePlace,
    deletePlace,
    addCategory,
    updateCategory,
    deleteCategory,
    addDistrict,
    updateDistrict,
    deleteDistrict,
    updateSettings,
    resetAllToDefault,
    exportDataJson,
    importDataJson,
  } = useData();

  const [activeTab, setActiveTab] = useState<'places' | 'map-picker' | 'categories' | 'districts' | 'settings'>('places');
  const [notification, setNotification] = useState<string | null>(null);

  // Search & Filter for Places Tab
  const [placeSearch, setPlaceSearch] = useState('');
  const [placeCatFilter, setPlaceCatFilter] = useState('all');

  // Place Modal State
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [placeForm, setPlaceForm] = useState<Partial<Place>>({});

  // Category Modal State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState<Partial<Category>>({});

  // District Modal State
  const [isDistModalOpen, setIsDistModalOpen] = useState(false);
  const [editingDist, setEditingDist] = useState<District | null>(null);
  const [distForm, setDistForm] = useState<Partial<District>>({});

  // Map Picker Selected Place
  const [mapPickerPlaceId, setMapPickerPlaceId] = useState<string>(places[0]?.id || '');

  // Settings Local Form State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(settings);

  // Notification helper
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- PLACES HANDLERS ---
  const handleOpenAddPlace = () => {
    setEditingPlace(null);
    setPlaceForm({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      district_id: districts[0]?.id || '',
      description: '',
      content: '',
      highlights: ['Điểm ngắm cảnh đẹp', 'Dịch vụ chuyên nghiệp'],
      tips: ['Nên đến vào sáng sớm'],
      address: 'Xã mới, Tỉnh Non Xanh (Mô phỏng)',
      latitude: 12.2350,
      longitude: 109.1950,
      rating: 4.8,
      review_count: 10,
      price_range: 'budget',
      price_label: '50.000đ - 100.000đ',
      opening_hours: '07:00 - 18:00 hàng ngày',
      phone: '0258.123.456',
      website: 'https://example.com',
      tags: ['Khám phá', 'Check-in'],
      amenities: ['Bãi đỗ xe', 'Wifi'],
      cover_image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      ],
      is_featured: false,
      is_open_now: true,
      is_mock_data: true,
    });
    setIsPlaceModalOpen(true);
  };

  const handleOpenEditPlace = (place: Place) => {
    setEditingPlace(place);
    setPlaceForm({ ...place });
    setIsPlaceModalOpen(true);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeForm.name?.trim()) return;

    if (editingPlace) {
      updatePlace(editingPlace.id, placeForm);
      notify(`Đã cập nhật thông tin: ${placeForm.name}`);
    } else {
      const created = addPlace(placeForm as Omit<Place, 'id' | 'created_at' | 'updated_at'>);
      notify(`Đã thêm địa điểm mới: ${created.name}`);
    }
    setIsPlaceModalOpen(false);
  };

  const handleDeletePlace = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa địa điểm "${name}"?`)) {
      deletePlace(id);
      notify(`Đã xóa địa điểm "${name}"`);
    }
  };

  // --- MAP PICKER CLICK ---
  const handleMapCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const coords = percentToCoords(xPercent, yPercent);
    if (mapPickerPlaceId) {
      updatePlace(mapPickerPlaceId, {
        latitude: coords.lat,
        longitude: coords.lng,
      });
      notify(`Đã cập nhật tọa độ mới cho địa điểm: ${coords.lat}°N, ${coords.lng}°E`);
    }
  };

  // --- CATEGORIES HANDLERS ---
  const handleOpenAddCategory = () => {
    setEditingCat(null);
    setCatForm({
      name: '',
      slug: '',
      description: '',
      icon: 'Compass',
      color: 'emerald',
      count: 0,
    });
    setIsCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setCatForm({ ...cat });
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name?.trim()) return;

    if (editingCat) {
      updateCategory(editingCat.id, catForm);
      notify(`Đã cập nhật danh mục: ${catForm.name}`);
    } else {
      addCategory(catForm as Omit<Category, 'id'>);
      notify(`Đã tạo danh mục mới: ${catForm.name}`);
    }
    setIsCatModalOpen(false);
  };

  // --- DISTRICTS HANDLERS ---
  const handleOpenAddDistrict = () => {
    setEditingDist(null);
    setDistForm({
      name: '',
      slug: '',
      description: '',
      center_lat: 12.2388,
      center_lng: 109.1967,
    });
    setIsDistModalOpen(true);
  };

  const handleOpenEditDistrict = (dist: District) => {
    setEditingDist(dist);
    setDistForm({ ...dist });
    setIsDistModalOpen(true);
  };

  const handleSaveDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distForm.name?.trim()) return;

    if (editingDist) {
      updateDistrict(editingDist.id, distForm);
      notify(`Đã cập nhật khu vực: ${distForm.name}`);
    } else {
      addDistrict(distForm as Omit<District, 'id'>);
      notify(`Đã tạo khu vực mới: ${distForm.name}`);
    }
    setIsDistModalOpen(false);
  };

  // --- SETTINGS HANDLERS ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    notify('Đã lưu cấu hình chung của website thành công!');
  };

  // Export JSON file
  const handleDownloadBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nonxanh-tourism-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    notify('Đã tải xuống file sao lưu dữ liệu toàn bộ website.');
  };

  // Import JSON file
  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content && importDataJson(content)) {
          notify('Nhập dữ liệu sao lưu thành công!');
        } else {
          alert('File JSON không hợp lệ!');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredPlaces = places.filter((p) => {
    const matchSearch =
      placeSearch === '' ||
      p.name.toLowerCase().includes(placeSearch.toLowerCase()) ||
      p.address.toLowerCase().includes(placeSearch.toLowerCase());
    const matchCat = placeCatFilter === 'all' || p.category_id === placeCatFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-teal-600 text-white font-semibold text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom duration-300">
          <Check className="w-4 h-4 text-emerald-200" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-600 mb-1">
            <Sliders className="w-4 h-4" />
            <span>Trung Tâm Điều Hành & Chỉnh Sửa Trực Quan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Trị Toàn Bộ Trang Web (Admin CMS)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Thay đổi địa điểm, danh mục, khu vực, vị trí trên bản đồ và thông tin chung website trong thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trang chủ khách</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất file JSON</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('places')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'places'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>1. Địa Điểm Du Lịch ({places.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('map-picker')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'map-picker'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>2. Chỉnh Tọa Độ Trên Bản Đồ</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'categories'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>3. Danh Mục Trải Nghiệm ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('districts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'districts'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>4. Khu Vực Hành Chính ({districts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>5. Thông Tin Toàn Bộ Trang Web</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PLACES MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'places' && (
        <div className="space-y-6">
          {/* Action & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 w-full sm:w-auto items-center gap-3">
              <input
                type="text"
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                placeholder="Tìm kiếm địa điểm theo tên hoặc địa chỉ..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500"
              />
              <select
                value={placeCatFilter}
                onChange={(e) => setPlaceCatFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddPlace}
              className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Địa Điểm Mới</span>
            </button>
          </div>

          {/* Places Table / List */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Hình ảnh & Tên địa điểm</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4">Khu vực</th>
                    <th className="p-4">Tọa độ GPS</th>
                    <th className="p-4">Đánh giá</th>
                    <th className="p-4">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPlaces.map((place) => {
                    const cat = categories.find((c) => c.id === place.category_id);
                    const dist = districts.find((d) => d.id === place.district_id);
                    return (
                      <tr key={place.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={place.cover_image}
                              alt={place.name}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-2xs border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-sm line-clamp-1">
                                {place.name}
                              </div>
                              <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {place.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-teal-800">
                          {cat?.name || 'Chưa gán'}
                        </td>
                        <td className="p-4 text-slate-700">
                          {dist?.name || 'Chưa gán'}
                        </td>
                        <td className="p-4 font-mono text-[11px]">
                          {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                        </td>
                        <td className="p-4 font-bold text-amber-500">
                          ★ {place.rating} ({place.review_count})
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              place.is_open_now
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {place.is_open_now ? 'Mở cửa' : 'Đóng cửa'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/places/${place.id}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-slate-100"
                              title="Xem trang chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleOpenEditPlace(place)}
                              className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePlace(place.id, place.name)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                              title="Xóa địa điểm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: VISUAL MAP COORDINATE PICKER */}
      {/* ======================================================== */}
      {activeTab === 'map-picker' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Map className="w-5 h-5 text-teal-600" />
              <span>Chỉnh Sửa Tọa Độ Bằng Cách Nhấp Chuột Lên Bản Đồ</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Hướng dẫn:</strong> Chọn một địa điểm bên dưới, sau đó <strong>nhấp chuột trực tiếp vào bất kỳ vị trí nào trên bản đồ</strong> để di chuyển ghim (pin) và cập nhật tọa độ GPS (Latitude & Longitude) ngay lập tức cho địa điểm đó!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Địa điểm đang chọn chỉnh tọa độ:
              </label>
              <select
                value={mapPickerPlaceId}
                onChange={(e) => setMapPickerPlaceId(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 rounded-xl"
              >
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Hiện tại: {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real Interactive Leaflet Google Maps Coordinate Picker */}
          <AdminMapPicker
            places={places}
            selectedPlaceId={mapPickerPlaceId}
            onUpdateCoordinates={(placeId, lat, lng) => {
              updatePlace(placeId, { latitude: lat, longitude: lng });
              const foundPlace = places.find((p) => p.id === placeId);
              notify(`Đã lưu tọa độ GPS mới cho "${foundPlace?.name}": ${lat}, ${lng}`);
            }}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CATEGORIES MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Danh Sách Danh Mục Trải Nghiệm</h2>
              <p className="text-xs text-slate-500">Chỉnh sửa danh mục, icon và màu sắc đại diện</p>
            </div>
            <button
              onClick={handleOpenAddCategory}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Danh Mục Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
                      Icon: {cat.icon} · Màu: {cat.color}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                            notify(`Đã xóa danh mục "${cat.name}"`);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{cat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Slug: /{cat.slug}</span>
                  <span>{places.filter((p) => p.category_id === cat.id).length} địa điểm</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: DISTRICTS MANAGEMENT */}
      {/* ======================================================== */}
      {activeTab === 'districts' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Danh Sách Khu Vực Hành Chính (Huyện/Thị xã/Thành phố)</h2>
              <p className="text-xs text-slate-500">Chỉnh sửa phân vùng địa lý và tọa độ trung tâm</p>
            </div>
            <button
              onClick={handleOpenAddDistrict}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Khu Vực Mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {districts.map((dist) => (
              <div
                key={dist.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      Tọa độ: {dist.center_lat}°N, {dist.center_lng}°E
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditDistrict(dist)}
                        className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa khu vực "${dist.name}"?`)) {
                            deleteDistrict(dist.id);
                            notify(`Đã xóa khu vực "${dist.name}"`);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{dist.name}</h3>
                  <p className="text-xs text-slate-600 mt-1">{dist.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Slug: /{dist.slug}</span>
                  <span>{places.filter((p) => p.district_id === dist.id).length} địa điểm thuộc khu vực này</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SITE SETTINGS (CHỈNH SỬA TOÀN BỘ WEBSITE) */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-8">
          {/* Section 1: Branding & Hero */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              1. Thương Hiệu & Phần Đầu Trang (Hero Banner)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên website (Title)
                </label>
                <input
                  type="text"
                  value={settingsForm.siteTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Khẩu hiệu thương hiệu (Subtitle)
                </label>
                <input
                  type="text"
                  value={settingsForm.siteSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteSubtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tiêu đề lớn Hero Section (Heading)
                </label>
                <input
                  type="text"
                  value={settingsForm.heroHeading}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroHeading: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 font-extrabold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đoạn mô tả Hero Section (Subheading)
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.heroSubheading}
                  onChange={(e) => setSettingsForm({ ...settingsForm, heroSubheading: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              {/* Visual Hero Background Template Picker */}
              <div className="sm:col-span-2 space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Chọn Mẫu Ảnh Nền Trang Chủ (Chỉ Admin có quyền đổi):</span>
                  </label>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    6 Mẫu tiêu biểu Quảng Ngãi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {HERO_TEMPLATES.map((tmpl) => {
                    const isSelected = settingsForm.heroBgImage === tmpl.url;
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setSettingsForm({ ...settingsForm, heroBgImage: tmpl.url })}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col ${
                          isSelected
                            ? 'border-teal-600 ring-4 ring-teal-500/25 bg-teal-50/50 shadow-md'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                        }`}
                      >
                        <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2 bg-slate-800">
                          {tmpl.isGradient ? (
                            <div className="w-full h-full" style={{ background: tmpl.url }} />
                          ) : (
                            <img
                              src={tmpl.thumbnail}
                              alt={tmpl.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {tmpl.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-black text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md shrink-0">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 truncate mt-0.5">
                          {tmpl.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Direct URL input fallback */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Hoặc nhập URL ảnh tùy chỉnh:
                  </label>
                  <input
                    type="text"
                    value={settingsForm.heroBgImage}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBgImage: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Banner Cảnh Báo Dữ Liệu */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg">
                2. Thanh Thông Báo Dữ Liệu Mô Phỏng (Top Banner)
              </h3>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsForm.showBanner}
                  onChange={(e) => setSettingsForm({ ...settingsForm, showBanner: e.target.checked })}
                  className="w-4 h-4 rounded text-teal-600"
                />
                <span>Hiển thị thanh banner</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nội dung thanh thông báo
              </label>
              <textarea
                rows={2}
                value={settingsForm.bannerText}
                onChange={(e) => setSettingsForm({ ...settingsForm, bannerText: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
              />
            </div>
          </div>

          {/* Section 3: Contact & Footer */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              3. Thông Tin Liên Hệ & Chân Trang (Footer)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={settingsForm.contactEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Số điện thoại hotline
                </label>
                <input
                  type="text"
                  value={settingsForm.contactPhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đơn vị chủ quản
                </label>
                <input
                  type="text"
                  value={settingsForm.contactOffice}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactOffice: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Bản quyền chân trang (Copyright)
                </label>
                <input
                  type="text"
                  value={settingsForm.copyrightText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, copyrightText: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Backup & Reset */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              4. Sao Lưu & Phục Hồi Toàn Bộ Trang Web
            </h3>

            <div className="flex flex-wrap gap-3">
              <label className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Nhập dữ liệu từ file JSON</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleUploadBackup}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Khôi phục toàn bộ trang web về dữ liệu gốc ban đầu?')) {
                    resetAllToDefault();
                    notify('Đã khôi phục toàn bộ dữ liệu về mặc định ban đầu.');
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Khôi phục dữ liệu ban đầu</span>
              </button>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all cursor-pointer"
            >
              Lưu Cấu Hình Toàn Bộ Website
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT / ADD PLACE */}
      {/* ======================================================== */}
      {isPlaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-900 text-xl">
                {editingPlace ? `Chỉnh Sửa Địa Điểm: ${editingPlace.name}` : 'Thêm Mới Địa Điểm Du Lịch'}
              </h3>
              <button
                onClick={() => setIsPlaceModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tên địa điểm *</label>
                  <input
                    type="text"
                    required
                    value={placeForm.name || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Slug đường dẫn</label>
                  <input
                    type="text"
                    value={placeForm.slug || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Danh mục du lịch</label>
                  <select
                    value={placeForm.category_id || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Khu vực hành chính</label>
                  <select
                    value={placeForm.district_id || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, district_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tọa độ Vĩ độ (Latitude) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={placeForm.latitude || 12.2}
                    onChange={(e) => setPlaceForm({ ...placeForm, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tọa độ Kinh độ (Longitude) *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={placeForm.longitude || 109.2}
                    onChange={(e) => setPlaceForm({ ...placeForm, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Giá vé hiển thị (Price label)</label>
                  <input
                    type="text"
                    value={placeForm.price_label || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, price_label: e.target.value })}
                    placeholder="Miễn phí hoặc 50.000đ - 100.000đ"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    value={placeForm.opening_hours || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, opening_hours: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    value={placeForm.address || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Mô tả ngắn</label>
                  <textarea
                    rows={2}
                    value={placeForm.description || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">Bài viết chi tiết (Nội dung)</label>
                  <textarea
                    rows={4}
                    value={placeForm.content || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, content: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">URL ảnh đại diện (Cover Image)</label>
                  <input
                    type="url"
                    value={placeForm.cover_image || ''}
                    onChange={(e) => setPlaceForm({ ...placeForm, cover_image: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 font-bold cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={placeForm.is_featured || false}
                      onChange={(e) => setPlaceForm({ ...placeForm, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600"
                    />
                    <span>Đánh dấu là Địa Điểm Nổi Bật (Featured)</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 font-bold cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={placeForm.is_open_now || false}
                      onChange={(e) => setPlaceForm({ ...placeForm, is_open_now: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600"
                    />
                    <span>Trạng thái đang mở cửa</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaceModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Lưu Thông Tin Địa Điểm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT / ADD CATEGORY */}
      {/* ======================================================== */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">
              {editingCat ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={catForm.name || ''}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Slug</label>
                <input
                  type="text"
                  value={catForm.slug || ''}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Mô tả</label>
                <textarea
                  rows={2}
                  value={catForm.description || ''}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Tên Icon</label>
                  <select
                    value={catForm.icon || 'Compass'}
                    onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="Trees">Trees (Cây cối / Sinh thái)</option>
                    <option value="Palmtree">Palmtree (Cọ biển / Biển đảo)</option>
                    <option value="Landmark">Landmark (Di tích / Cổ tự)</option>
                    <option value="Utensils">Utensils (Ẩm thực / Chợ đêm)</option>
                    <option value="Compass">Compass (Khám phá / Giải trí)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Màu chủ đạo</label>
                  <select
                    value={catForm.color || 'emerald'}
                    onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                  >
                    <option value="emerald">Emerald (Xanh ngọc lục)</option>
                    <option value="cyan">Cyan (Xanh biển ngọc)</option>
                    <option value="amber">Amber (Vàng hổ phách)</option>
                    <option value="rose">Rose (Đỏ hồng ấm)</option>
                    <option value="indigo">Indigo (Chàm hiện đại)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT / ADD DISTRICT */}
      {/* ======================================================== */}
      {isDistModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg">
              {editingDist ? 'Sửa Khu Vực Hành Chính' : 'Thêm Khu Vực Mới'}
            </h3>

            <form onSubmit={handleSaveDistrict} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Tên khu vực (Huyện/Thị/TP) *</label>
                <input
                  type="text"
                  required
                  value={distForm.name || ''}
                  onChange={(e) => setDistForm({ ...distForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Slug</label>
                <input
                  type="text"
                  value={distForm.slug || ''}
                  onChange={(e) => setDistForm({ ...distForm, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Mô tả khu vực</label>
                <textarea
                  rows={2}
                  value={distForm.description || ''}
                  onChange={(e) => setDistForm({ ...distForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Vĩ độ trung tâm</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={distForm.center_lat || 12.2}
                    onChange={(e) => setDistForm({ ...distForm, center_lat: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Kinh độ trung tâm</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={distForm.center_lng || 109.2}
                    onChange={(e) => setDistForm({ ...distForm, center_lng: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDistModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
