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
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PLACES: 'tourism_map_places_v4',
  CATEGORIES: 'tourism_map_categories_v4',
  DISTRICTS: 'tourism_map_districts_v4',
  SETTINGS: 'tourism_map_settings_v4',
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

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (typeof data !== 'object' || data === null) {
        return false;
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
