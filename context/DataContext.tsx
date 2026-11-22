'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [places, setPlaces] = useState<Place[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.PLACES);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_PLACES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return CATEGORIES;
  });

  const [districts, setDistricts] = useState<District[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.DISTRICTS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DISTRICTS;
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_SITE_SETTINGS;
  });

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
        categories,
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
      if (data.places) {
        setPlaces(data.places);
        persist(STORAGE_KEYS.PLACES, data.places);
      }
      if (data.categories) {
        setCategories(data.categories);
        persist(STORAGE_KEYS.CATEGORIES, data.categories);
      }
      if (data.districts) {
        setDistricts(data.districts);
        persist(STORAGE_KEYS.DISTRICTS, data.districts);
      }
      if (data.settings) {
        setSettings(data.settings);
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
