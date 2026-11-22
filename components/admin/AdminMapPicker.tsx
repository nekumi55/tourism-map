'use client';

import React, { useEffect, useRef, useState } from 'react';
import type * as LType from 'leaflet';
import { Place } from '@/types';
import { Layers, MapPin, Check } from 'lucide-react';

interface AdminMapPickerProps {
  places: Place[];
  selectedPlaceId: string;
  onUpdateCoordinates: (placeId: string, lat: number, lng: number) => void;
}

const TILE_LAYERS = {
  standard: {
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps Đường bộ',
    maxZoom: 20,
  },
  satellite: {
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps Vệ tinh Hybrid',
    maxZoom: 20,
  },
  terrain: {
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps Địa hình',
    maxZoom: 20,
  },
};

export default function AdminMapPicker({
  places,
  selectedPlaceId,
  onUpdateCoordinates,
}: AdminMapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const tileLayerRef = useRef<LType.TileLayer | null>(null);
  const markersLayerRef = useRef<LType.LayerGroup | null>(null);
  const [activeLayer, setActiveLayer] = useState<'standard' | 'satellite' | 'terrain'>('standard');
  const [lastClickedCoords, setLastClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Keep latest callbacks and props in refs to avoid re-triggering map initialization
  const selectedPlaceIdRef = useRef(selectedPlaceId);
  selectedPlaceIdRef.current = selectedPlaceId;
  const onUpdateCoordinatesRef = useRef(onUpdateCoordinates);
  onUpdateCoordinatesRef.current = onUpdateCoordinates;
  const placesRef = useRef(places);
  placesRef.current = places;

  // Initialize Map ONCE
  useEffect(() => {
    if (!containerRef.current) return;

    let isCancelled = false;

    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    import('leaflet').then((L) => {
      if (isCancelled || !containerRef.current) return;

      if ((containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }

      // Default center: Quảng Ngãi
      const initialPlace = placesRef.current.find((p) => p.id === selectedPlaceIdRef.current);
      const centerLat = initialPlace ? initialPlace.latitude : 15.1205;
      const centerLng = initialPlace ? initialPlace.longitude : 108.8000;

      const map = L.map(containerRef.current, {
        center: [centerLat, centerLng],
        zoom: initialPlace ? 12 : 10,
        zoomControl: true,
      });

      const layerConfig = TILE_LAYERS[activeLayer];
      const tileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        subdomains: layerConfig.subdomains,
        maxZoom: layerConfig.maxZoom,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;

      // Handle Click on Real Map to update Coordinates
      map.on('click', (e: LType.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const currentSelectedId = selectedPlaceIdRef.current;
        if (!currentSelectedId) return;

        const roundedLat = Number(lat.toFixed(5));
        const roundedLng = Number(lng.toFixed(5));

        setLastClickedCoords({ lat: roundedLat, lng: roundedLng });
        onUpdateCoordinatesRef.current(currentSelectedId, roundedLat, roundedLng);
      });

      // Force size invalidation
      [100, 300, 600].forEach((delay) => {
        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, delay);
      });

      // Draw initial markers
      renderMarkers(L, map, markersLayer);
    });

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (containerRef.current && (containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Switch Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const layerConfig = TILE_LAYERS[activeLayer];
      const newLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        subdomains: layerConfig.subdomains,
        maxZoom: layerConfig.maxZoom,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newLayer;
      mapInstanceRef.current.invalidateSize();
    });
  }, [activeLayer]);

  // Redraw Markers when places or selectedPlaceId changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      renderMarkers(L, mapInstanceRef.current, markersLayerRef.current);
    });
  }, [places, selectedPlaceId]);

  const renderMarkers = (
    L: typeof LType,
    map: LType.Map,
    markersGroup: LType.LayerGroup
  ) => {
    markersGroup.clearLayers();

    const currentPlaces = placesRef.current;
    const currentSelectedId = selectedPlaceIdRef.current;

    currentPlaces.forEach((place) => {
      const isSelected = place.id === currentSelectedId;
      const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');

      const markerHtml = `
        <div style="transform: translate(-50%, -50%); position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isSelected
              ? '<span style="position: absolute; inset: -10px; border-radius: 9999px; background: rgba(245, 158, 11, 0.5); animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>'
              : ''
          }
          <div style="width: ${isSelected ? '36px' : '26px'}; height: ${
            isSelected ? '36px' : '26px'
          }; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2.5px solid #ffffff; background: ${
            isSelected ? '#f59e0b' : '#0d9488'
          }; color: #ffffff;">
            <svg width="${isSelected ? '18' : '14'}" height="${
              isSelected ? '18' : '14'
            }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 4px; padding: 3px 8px; border-radius: 6px; background: ${
            isSelected ? '#f59e0b' : 'rgba(15, 23, 42, 0.92)'
          }; color: ${
            isSelected ? '#0f172a' : '#ffffff'
          }; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.3); pointer-events: none; border: 1px solid rgba(255,255,255,0.2);">
            ${cleanName} ${isSelected ? '(Đang chỉnh)' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-pin-marker',
        html: markerHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker([place.latitude, place.longitude], {
        icon: customIcon,
        draggable: isSelected, // Allow dragging the active place marker!
      });

      if (isSelected) {
        marker.on('dragend', (event) => {
          const newPos = event.target.getLatLng();
          const rLat = Number(newPos.lat.toFixed(5));
          const rLng = Number(newPos.lng.toFixed(5));
          setLastClickedCoords({ lat: rLat, lng: rLng });
          onUpdateCoordinatesRef.current(place.id, rLat, rLng);
        });
      }

      markersGroup.addLayer(marker);
    });

    // Pan to selected place
    const selectedPlace = currentPlaces.find((p) => p.id === currentSelectedId);
    if (selectedPlace) {
      map.panTo([selectedPlace.latitude, selectedPlace.longitude], {
        animate: true,
        duration: 0.6,
      });
    }
  };

  const selectedPlace = places.find((p) => p.id === selectedPlaceId);

  return (
    <div className="space-y-4">
      {/* Real Map Frame */}
      <div className="relative aspect-16/10 rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-700 shadow-2xl min-h-[500px]">
        <div ref={containerRef} className="absolute inset-0 w-full h-full z-10 cursor-crosshair" />

        {/* Floating Controls: Layer Switcher */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 text-xs font-bold text-slate-700">
          <button
            type="button"
            onClick={() => setActiveLayer('standard')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeLayer === 'standard'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'hover:bg-slate-100'
            }`}
          >
            Đường bộ
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('satellite')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeLayer === 'satellite'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'hover:bg-slate-100'
            }`}
          >
            Vệ tinh thật
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer('terrain')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeLayer === 'terrain'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'hover:bg-slate-100'
            }`}
          >
            Địa hình đồi núi
          </button>
        </div>

        {/* Floating Status Bar at Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="pointer-events-auto bg-slate-950/85 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-semibold border border-slate-700 flex items-center gap-2 shadow-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>
              Đang chỉnh: <strong className="text-amber-300">{selectedPlace?.name}</strong> (Tọa độ: {selectedPlace?.latitude.toFixed(5)}, {selectedPlace?.longitude.toFixed(5)})
            </span>
          </div>

          {lastClickedCoords && (
            <div className="pointer-events-auto bg-emerald-600/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xl animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-200" />
              <span>Đã lưu tọa độ: {lastClickedCoords.lat}, {lastClickedCoords.lng}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between gap-2">
        <span>
          💡 <strong>Mẹo chuyên nghiệp:</strong> Bạn có thể <strong>nhấp chuột trực tiếp</strong> lên bản đồ thực tế hoặc <strong>kéo thả trực tiếp ghim màu vàng</strong> để đưa điểm đến vào đúng bãi biển, mỏm đá hoặc hòn đảo mong muốn!
        </span>
      </div>
    </div>
  );
}
