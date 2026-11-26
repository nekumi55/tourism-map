'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { Place } from '@/types';

const ITINERARY_STORAGE_KEY = 'tourism_map_itinerary_ids_v1';
const EMPTY_IDS: string[] = [];

let cachedRaw: string | null | undefined = undefined;
let cachedIds: string[] = EMPTY_IDS;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function readIdsFromStorage(): string[] {
  if (typeof window === 'undefined') return EMPTY_IDS;
  try {
    const raw = window.localStorage.getItem(ITINERARY_STORAGE_KEY);
    if (raw === cachedRaw) return cachedIds;
    cachedRaw = raw;
    if (!raw) {
      cachedIds = EMPTY_IDS;
      return cachedIds;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const valid = parsed.filter((id): id is string => typeof id === 'string');
      cachedIds = valid.length > 0 ? Array.from(new Set(valid)) : EMPTY_IDS;
    } else {
      cachedIds = EMPTY_IDS;
    }
    return cachedIds;
  } catch {
    cachedRaw = null;
    cachedIds = EMPTY_IDS;
    return cachedIds;
  }
}

function writeIdsToStorage(nextIds: string[]) {
  const deduped = nextIds.length > 0 ? Array.from(new Set(nextIds)) : EMPTY_IDS;
  const raw = JSON.stringify(deduped);
  cachedRaw = raw;
  cachedIds = deduped;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ITINERARY_STORAGE_KEY, raw);
    } catch (e) {
      console.error('Failed to persist itinerary:', e);
    }
  }
  notifyListeners();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (typeof window === 'undefined') {
    return () => {
      listeners.delete(listener);
    };
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === ITINERARY_STORAGE_KEY || e.key === null) {
      cachedRaw = undefined;
      listener();
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

function getServerSnapshot(): string[] {
  return EMPTY_IDS;
}

/**
 * Shared persisted itinerary store backed by localStorage.
 * Starts empty when no itinerary has been saved by the user,
 * preserves selections across page reloads, and syncs between Map and Itinerary views.
 */
export function usePersistedItinerary(availablePlaces: Place[]) {
  const ids = useSyncExternalStore(subscribe, readIdsFromStorage, getServerSnapshot);

  const byId = useMemo(
    () => new Map(availablePlaces.map((p) => [p.id, p])),
    [availablePlaces]
  );

  const itinerary = useMemo(
    () => ids.map((id) => byId.get(id)).filter((p): p is Place => Boolean(p)),
    [ids, byId]
  );

  const setItinerary = useCallback(
    (updater: Place[] | ((prev: Place[]) => Place[])) => {
      if (typeof updater === 'function') {
        const currentIds = readIdsFromStorage();
        const currentPlaces = currentIds
          .map((id) => byId.get(id))
          .filter((p): p is Place => Boolean(p));
        const nextPlaces = updater(currentPlaces);
        writeIdsToStorage(nextPlaces.map((p) => p.id));
        return;
      }
      writeIdsToStorage(updater.map((p) => p.id));
    },
    [byId]
  );

  return [itinerary, setItinerary] as const;
}
