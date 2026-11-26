'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Place, Category, District } from '@/types';
import { SiteSettings } from '@/types/settings';
import { MOCK_PLACES } from '@/data/places';
import { CATEGORIES } from '@/data/categories';
import { DISTRICTS } from '@/data/districts';
import { DEFAULT_SITE_SETTINGS } from '@/data/settings';

interface DataContextType {
  places: Place[];
  categories: Category[];
  districts: District[];
  settings: SiteSettings;
  // Places CRUD
  addPlace: (place: Omit<Place, 'id' | 'created_at' | 'updated_at'>) => Place;
  updatePlace: (id: string, updatedFields: Partial<Place>) => void;
  deletePlace: (id: string) => void;
  // Categories CRUD
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, updatedFields: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Districts CRUD
  addDistrict: (dist: Omit<District, 'id'>) => District;
  updateDistrict: (id: string, updatedFields: Partial<District>) => void;
  deleteDistrict: (id: string) => void;
  // Settings
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  // Backup & Reset
  resetAllToDefault: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
  importPlacesJson: (jsonString: string) => { success: boolean; count: number; error?: string };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLACES: 'tourism_map_places_v9',
  CATEGORIES: 'tourism_map_categories_v9',
  DISTRICTS: 'tourism_map_districts_v9',
  SETTINGS: 'tourism_map_settings_v9',
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  // Initialize with static defaults to ensure consistent SSR and client hydration
  const [places, setPlaces] = useState<Place[]>(MOCK_PLACES);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [districts, setDistricts] = useState<District[]>(DISTRICTS);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Sync from localStorage after component mounts on client (avoids hydration mismatch)
  useEffect(() => {
    try {
      const savedPlaces = localStorage.getItem(STORAGE_KEYS.PLACES);
      if (savedPlaces) {
        const parsed = JSON.parse(savedPlaces);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPlaces(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading places from localStorage:', e);
    }

    try {
      const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading categories from localStorage:', e);
    }

    try {
      const savedDistricts = localStorage.getItem(STORAGE_KEYS.DISTRICTS);
      if (savedDistricts) {
        const parsed = JSON.parse(savedDistricts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDistricts(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading districts from localStorage:', e);
    }

    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed && typeof parsed === 'object') {
          setSettings(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading settings from localStorage:', e);
    }
  }, []);

  // Dynamically compute category counts based on current active places list
  const dynamicCategories = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      count: places.filter((p) => p.category_id === cat.id).length,
    }));
  }, [categories, places]);

  // Save changes to LocalStorage
  const persist = (key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  };

  // --- PLACES ---
  const addPlace = (placeData: Omit<Place, 'id' | 'created_at' | 'updated_at'>): Place => {
    const newPlace: Place = {
      ...placeData,
      id: `pl-${Date.now().toString(36)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_mock_data: true,
    };
    const next = [newPlace, ...places];
    setPlaces(next);
    persist(STORAGE_KEYS.PLACES, next);
    return newPlace;
  };

  const updatePlace = (id: string, updatedFields: Partial<Place>) => {
    const next = places.map((p) =>
      p.id === id ? { ...p, ...updatedFields, updated_at: new Date().toISOString() } : p
    );
    setPlaces(next);
    persist(STORAGE_KEYS.PLACES, next);
  };

  const deletePlace = (id: string) => {
    const next = places.filter((p) => p.id !== id);
    setPlaces(next);
    persist(STORAGE_KEYS.PLACES, next);
  };

  // --- CATEGORIES ---
  const addCategory = (catData: Omit<Category, 'id'>): Category => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now().toString(36)}`,
      count: 0,
    };
    const next = [...categories, newCat];
    setCategories(next);
    persist(STORAGE_KEYS.CATEGORIES, next);
    return newCat;
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    const next = categories.map((c) => (c.id === id ? { ...c, ...updatedFields } : c));
    setCategories(next);
    persist(STORAGE_KEYS.CATEGORIES, next);
  };

  const deleteCategory = (id: string) => {
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);
    persist(STORAGE_KEYS.CATEGORIES, next);
  };

  // --- DISTRICTS ---
  const addDistrict = (distData: Omit<District, 'id'>): District => {
    const newDist: District = {
      ...distData,
      id: `dist-${Date.now().toString(36)}`,
    };
    const next = [...districts, newDist];
    setDistricts(next);
    persist(STORAGE_KEYS.DISTRICTS, next);
    return newDist;
  };

  const updateDistrict = (id: string, updatedFields: Partial<District>) => {
    const next = districts.map((d) => (d.id === id ? { ...d, ...updatedFields } : d));
    setDistricts(next);
    persist(STORAGE_KEYS.DISTRICTS, next);
  };

  const deleteDistrict = (id: string) => {
    const next = districts.filter((d) => d.id !== id);
    setDistricts(next);
    persist(STORAGE_KEYS.DISTRICTS, next);
  };

  // --- SETTINGS ---
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const next = { ...settings, ...newSettings };
    setSettings(next);
    persist(STORAGE_KEYS.SETTINGS, next);
  };

  // --- BACKUP & RESET ---
  const resetAllToDefault = () => {
    setPlaces(MOCK_PLACES);
    setCategories(CATEGORIES);
    setDistricts(DISTRICTS);
    setSettings(DEFAULT_SITE_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PLACES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.DISTRICTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  };

  const exportDataJson = () => {
    return JSON.stringify(
      {
        places,
        categories: dynamicCategories,
        districts,
        settings,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importPlacesJson = (
    jsonString: string
  ): { success: boolean; count: number; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      let list: unknown[] | null = null;
      if (Array.isArray(data)) {
        list = data;
      } else if (typeof data === 'object' && data !== null && Array.isArray((data as Record<string, unknown>).places)) {
        list = (data as Record<string, unknown>).places as unknown[];
      }

      if (!list || !Array.isArray(list) || list.length === 0) {
        return {
          success: false,
          count: 0,
          error: 'File JSON không chứa danh sách địa điểm hợp lệ (cần là mảng [ ... ] hoặc object { places: [ ... ] })',
        };
      }

      const validPlaces: Place[] = [];
      for (const item of list) {
        if (typeof item === 'object' && item !== null) {
          const p = item as Record<string, unknown>;
          if (p.name && typeof p.name === 'string') {
            const placeItem: Place = {
              id: p.id ? String(p.id) : `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              name: String(p.name),
              slug: p.slug ? String(p.slug) : String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              category_id: p.category_id ? String(p.category_id) : 'cat-history',
              district_id: p.district_id ? String(p.district_id) : 'dist-tp-quang-ngai',
              description: p.description ? String(p.description) : '',
              content: p.content ? String(p.content) : (p.description ? String(p.description) : ''),
              highlights: Array.isArray(p.highlights) ? p.highlights.map(String) : [],
              tips: Array.isArray(p.tips) ? p.tips.map(String) : [],
              address: p.address ? String(p.address) : 'Quảng Ngãi',
              latitude: typeof p.latitude === 'number' ? p.latitude : 15.12,
              longitude: typeof p.longitude === 'number' ? p.longitude : 108.80,
              rating: typeof p.rating === 'number' ? p.rating : 4.8,
              review_count: typeof p.review_count === 'number' ? p.review_count : 100,
              price_range: (['free', 'budget', 'moderate', 'luxury'] as const).includes(p.price_range as any)
                ? (p.price_range as 'free' | 'budget' | 'moderate' | 'luxury')
                : 'budget',
              price_label: p.price_label ? String(p.price_label) : 'Miễn phí',
              opening_hours: p.opening_hours ? String(p.opening_hours) : '07:00 - 18:00',
              phone: p.phone ? String(p.phone) : undefined,
              website: p.website ? String(p.website) : undefined,
              tags: Array.isArray(p.tags) ? p.tags.map(String) : ['Du lịch', 'Quảng Ngãi'],
              amenities: Array.isArray(p.amenities) ? p.amenities.map(String) : ['Bãi đỗ xe'],
              cover_image: p.cover_image ? String(p.cover_image) : 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
              gallery: Array.isArray(p.gallery) ? p.gallery.map(String) : [
                p.cover_image ? String(p.cover_image) : 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80'
              ],
              is_featured: Boolean(p.is_featured),
              is_open_now: p.is_open_now !== undefined ? Boolean(p.is_open_now) : true,
              created_at: p.created_at ? String(p.created_at) : new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_mock_data: true,
            };
            validPlaces.push(placeItem);
          }
        }
      }

      if (validPlaces.length === 0) {
        return { success: false, count: 0, error: 'Không tìm thấy địa điểm nào có tên (name) hợp lệ trong file JSON!' };
      }

      setPlaces(validPlaces);
      persist(STORAGE_KEYS.PLACES, validPlaces);
      return { success: true, count: validPlaces.length };
    } catch (e: unknown) {
      console.error('Lỗi nạp places.json:', e);
      return { success: false, count: 0, error: e instanceof Error ? e.message : 'Lỗi cú pháp file JSON!' };
    }
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) {
        return false;
      }

      // If user uploaded direct places array into general import
      if (Array.isArray(data)) {
        const res = importPlacesJson(jsonString);
        return res.success;
      }

      if (Array.isArray(data.places)) {
        const validPlaces = data.places.filter(
          (p: unknown) =>
            typeof p === 'object' &&
            p !== null &&
            'id' in p &&
            'name' in p &&
            'category_id' in p
        );
        if (validPlaces.length > 0) {
          setPlaces(validPlaces as Place[]);
          persist(STORAGE_KEYS.PLACES, validPlaces);
        }
      }

      if (Array.isArray(data.categories)) {
        const validCats = data.categories.filter(
          (c: unknown) =>
            typeof c === 'object' && c !== null && 'id' in c && 'name' in c
        );
        if (validCats.length > 0) {
          setCategories(validCats as Category[]);
          persist(STORAGE_KEYS.CATEGORIES, validCats);
        }
      }

      if (Array.isArray(data.districts)) {
        const validDistricts = data.districts.filter(
          (d: unknown) =>
            typeof d === 'object' && d !== null && 'id' in d && 'name' in d
        );
        if (validDistricts.length > 0) {
          setDistricts(validDistricts as District[]);
          persist(STORAGE_KEYS.DISTRICTS, validDistricts);
        }
      }

      if (data.settings && typeof data.settings === 'object') {
        setSettings(data.settings as SiteSettings);
        persist(STORAGE_KEYS.SETTINGS, data.settings);
      }

      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        places,
        categories: dynamicCategories,
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
        importPlacesJson,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
