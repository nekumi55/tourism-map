'use client';

import React, { useEffect, useRef } from 'react';
import type * as LType from 'leaflet';
import { Place } from '@/types';

interface LeafletMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  itineraryPlaces: Place[];
  mapLayer: 'standard' | 'satellite' | 'terrain';
}

// Highly reliable, ultra-fast tile servers with verified 200 OK in Vietnam
const TILE_LAYERS = {
  standard: {
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps &mdash; Bản đồ số Quảng Ngãi',
    maxZoom: 20,
  },
  satellite: {
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps &mdash; Vệ tinh & Địa danh thật',
    maxZoom: 20,
  },
  terrain: {
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps &mdash; Địa hình đồi núi Quảng Ngãi',
    maxZoom: 20,
  },
};

export default function LeafletMap({
  places,
  selectedPlace,
  onSelectPlace,
  itineraryPlaces,
  mapLayer,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const tileLayerRef = useRef<LType.TileLayer | null>(null);
  const markersLayerRef = useRef<LType.LayerGroup | null>(null);
  const polylineRef = useRef<LType.Polyline | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Store latest props in refs to avoid re-triggering map initialization
  const placesRef = useRef(places);
  placesRef.current = places;
  const selectedPlaceRef = useRef(selectedPlace);
  selectedPlaceRef.current = selectedPlace;
  const itineraryPlacesRef = useRef(itineraryPlaces);
  itineraryPlacesRef.current = itineraryPlaces;
  const onSelectPlaceRef = useRef(onSelectPlace);
  onSelectPlaceRef.current = onSelectPlace;

  // Initialize Map ONCE on mount
  useEffect(() => {
    if (!containerRef.current) return;

    let isCancelled = false;

    // Reset container if previously tagged by Leaflet
    if ((containerRef.current as any)._leaflet_id) {
      delete (containerRef.current as any)._leaflet_id;
    }

    import('leaflet').then((L) => {
      if (isCancelled || !containerRef.current) return;

      // Double-check clean container
      if ((containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }

      // Initialize map centered at Quảng Ngãi
      const map = L.map(containerRef.current, {
        center: [15.1205, 108.8000],
        zoom: 10,
        zoomControl: true,
      });

      // Add tile layer
      const layerConfig = TILE_LAYERS[mapLayer];
      const tileLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        subdomains: layerConfig.subdomains,
        maxZoom: layerConfig.maxZoom,
      }).addTo(map);

      // Add markers layer group
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      markersLayerRef.current = markersLayer;

      // Handle ResizeObserver to avoid blank/gray tile rendering
      if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
        const ro = new ResizeObserver(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        ro.observe(containerRef.current);
        resizeObserverRef.current = ro;
      }

      // Staged invalidateSize calls to guarantee tile coverage after layout paints
      [50, 200, 600].forEach((delay) => {
        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, delay);
      });

      // Render initial markers
      drawMarkersAndRoute(L, map, markersLayer);
    });

    return () => {
      isCancelled = true;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (containerRef.current && (containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Switch Tile Layer when mapLayer changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current) return;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const layerConfig = TILE_LAYERS[mapLayer];
      const newLayer = L.tileLayer(layerConfig.url, {
        attribution: layerConfig.attribution,
        subdomains: layerConfig.subdomains,
        maxZoom: layerConfig.maxZoom,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newLayer;
      mapInstanceRef.current.invalidateSize();
    });
  }, [mapLayer]);

  // Redraw Markers & Route when places or selection or itinerary changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      drawMarkersAndRoute(L, mapInstanceRef.current, markersLayerRef.current);
    });
  }, [places, selectedPlace, itineraryPlaces]);

  // Helper: Draw markers and route polyline
  const drawMarkersAndRoute = (
    L: typeof LType,
    map: LType.Map,
    markersGroup: LType.LayerGroup
  ) => {
    markersGroup.clearLayers();

    // 1. Draw Route Polyline
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const currentItinerary = itineraryPlacesRef.current;
    if (currentItinerary.length >= 2) {
      const latlngs: [number, number][] = currentItinerary.map((p) => [
        p.latitude,
        p.longitude,
      ]);

      const polyline = L.polyline(latlngs, {
        color: '#0d9488',
        weight: 5,
        opacity: 0.95,
        dashArray: '8, 8',
      }).addTo(map);

      polylineRef.current = polyline;
    }

    // 2. Draw Markers
    const currentPlaces = placesRef.current;
    const currentSelected = selectedPlaceRef.current;

    currentPlaces.forEach((place) => {
      const isSelected = currentSelected?.id === place.id;
      const itineraryIdx = currentItinerary.findIndex((p) => p.id === place.id);
      const isItinerary = itineraryIdx !== -1;
      const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');

      const markerHtml = `
        <div style="transform: translate(-50%, -50%); position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          ${
            isSelected
              ? '<span style="position: absolute; inset: -8px; border-radius: 9999px; background: rgba(20, 184, 166, 0.45); animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>'
              : ''
          }
          <div style="width: ${isItinerary || isSelected ? '34px' : '28px'}; height: ${
            isItinerary || isSelected ? '34px' : '28px'
          }; border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2.5px solid #ffffff; background: ${
            isItinerary ? '#f59e0b' : isSelected ? '#0d9488' : '#0284c7'
          }; color: #ffffff;">
            ${
              isItinerary
                ? `#${itineraryIdx + 1}`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
            }
          </div>
          <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); margin-top: 4px; padding: 3px 8px; border-radius: 6px; background: rgba(15, 23, 42, 0.92); color: #ffffff; font-size: 11px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.35); pointer-events: none; border: 1px solid rgba(255,255,255,0.15);">
            ${cleanName}
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
      });

      marker.on('click', () => {
        onSelectPlaceRef.current(place);
      });

      markersGroup.addLayer(marker);
    });

    // Pan smoothly if a place is selected
    if (currentSelected) {
      map.panTo([currentSelected.latitude, currentSelected.longitude], {
        animate: true,
        duration: 0.8,
      });
    }
  };

  return (
    <div className="w-full h-full relative min-h-[450px]">
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
}
