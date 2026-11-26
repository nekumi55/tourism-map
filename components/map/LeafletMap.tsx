'use client';

import React, { useCallback, useEffect, useRef } from 'react';
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
  const hasFittedInitialRef = useRef(false);
  const mapClickedIdRef = useRef<string | null>(null);
  const lastHandledSelectedIdRef = useRef<string | null>(selectedPlace?.id ?? null);
  const prevSelectedIdRef = useRef<string | null>(selectedPlace?.id ?? null);

  // Store latest props in refs to avoid re-triggering map initialization
  const placesRef = useRef(places);
  const selectedPlaceRef = useRef(selectedPlace);
  const itineraryPlacesRef = useRef(itineraryPlaces);
  const onSelectPlaceRef = useRef(onSelectPlace);
  const mapLayerRef = useRef(mapLayer);

  useEffect(() => {
    placesRef.current = places;
    selectedPlaceRef.current = selectedPlace;
    itineraryPlacesRef.current = itineraryPlaces;
    onSelectPlaceRef.current = onSelectPlace;
    mapLayerRef.current = mapLayer;
  }, [places, selectedPlace, itineraryPlaces, onSelectPlace, mapLayer]);

  const applyInitialViewport = useCallback(
    (L: typeof LType, map: LType.Map, container: HTMLDivElement) => {
      if (hasFittedInitialRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      map.invalidateSize({ animate: false });

      const currentSelected = selectedPlaceRef.current;
      const currentPlaces = placesRef.current;

      if (currentSelected) {
        map.setView(
          [currentSelected.latitude, currentSelected.longitude],
          width < 640 ? 12.5 : 13,
          { animate: false }
        );
        hasFittedInitialRef.current = true;
        return;
      }

      if (currentPlaces.length > 0) {
        const bounds = L.latLngBounds(
          currentPlaces.map((p) => [p.latitude, p.longitude] as [number, number])
        );
        if (bounds.isValid()) {
          const isCompact = width < 640;
          map.fitBounds(bounds, {
            paddingTopLeft: isCompact ? [36, 68] : [60, 56],
            paddingBottomRight: isCompact ? [36, 50] : [60, 56],
            maxZoom: isCompact ? 9.5 : 9.25,
            animate: false,
          });
          hasFittedInitialRef.current = true;
        }
      }
    },
    []
  );

  // Helper: Draw markers and route polyline
  const drawMarkersAndRoute = useCallback(
    (L: typeof LType, map: LType.Map, markersGroup: LType.LayerGroup) => {
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
      const selectedChanged =
        Boolean(currentSelected?.id) && prevSelectedIdRef.current !== currentSelected?.id;
      prevSelectedIdRef.current = currentSelected?.id ?? null;

      currentPlaces.forEach((place) => {
        const isSelected = currentSelected?.id === place.id;
        const itineraryIdx = currentItinerary.findIndex((p) => p.id === place.id);
        const isItinerary = itineraryIdx !== -1;
        const cleanName = place.name.replace(/\[Minh Họa\]\s*/g, '');
        const pinSize = isItinerary || isSelected ? 34 : 28;
        const pinBg = isItinerary ? '#f59e0b' : isSelected ? '#0d9488' : '#0284c7';
        const dotClasses = [
          'map-pin-dot',
          isSelected ? 'map-pin-dot--selected' : '',
          isSelected && selectedChanged ? 'map-pin-dot--entering' : '',
        ]
          .filter(Boolean)
          .join(' ');

        const markerHtml = `
          <div class="map-pin-wrap">
            ${isSelected ? '<div class="marker-selected-ring"></div>' : ''}
            <div class="${dotClasses}" style="width: ${pinSize}px; height: ${pinSize}px; background: ${pinBg};">
              ${
                isItinerary
                  ? `#${itineraryIdx + 1}`
                  : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
              }
            </div>
            <div class="map-pin-label${isSelected ? ' map-pin-label--selected' : ''}">
              ${cleanName}
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-pin-marker',
          html: markerHtml,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([place.latitude, place.longitude], {
          icon: customIcon,
          title: cleanName,
          alt: cleanName,
          zIndexOffset: isSelected ? 1000 : isItinerary ? 500 : 0,
        });

        marker.on('click', () => {
          if (selectedPlaceRef.current?.id !== place.id) {
            mapClickedIdRef.current = place.id;
          }
          onSelectPlaceRef.current(place);
        });

        markersGroup.addLayer(marker);
      });

      const currentSelectedId = currentSelected?.id ?? null;
      const selectionChanged = currentSelectedId !== lastHandledSelectedIdRef.current;
      lastHandledSelectedIdRef.current = currentSelectedId;

      const wasClickedOnMap =
        currentSelectedId !== null && mapClickedIdRef.current === currentSelectedId;
      if (wasClickedOnMap || currentSelectedId === null) {
        mapClickedIdRef.current = null;
      }

      // Pan (and zoom in if at province-wide zoom) when a place is chosen outside the map (e.g. sidebar list)
      if (
        selectionChanged &&
        !wasClickedOnMap &&
        currentSelected &&
        hasFittedInitialRef.current &&
        containerRef.current &&
        containerRef.current.clientWidth > 0
      ) {
        const reduceMotion =
          typeof window !== 'undefined' &&
          window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const targetZoom = Math.max(map.getZoom(), 13);
        map.setView([currentSelected.latitude, currentSelected.longitude], targetZoom, {
          animate: !reduceMotion,
          duration: reduceMotion ? 0 : 0.65,
        });
      }
    },
    []
  );

  // Initialize Map ONCE on mount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isCancelled = false;

    // Reset container if previously tagged by Leaflet
    if ((container as unknown as Record<string, unknown>)._leaflet_id) {
      delete (container as unknown as Record<string, unknown>)._leaflet_id;
    }

    import('leaflet').then((L) => {
      if (isCancelled || !container) return;

      // Double-check clean container
      if ((container as unknown as Record<string, unknown>)._leaflet_id) {
        delete (container as unknown as Record<string, unknown>)._leaflet_id;
      }

      // Initialize map centered to cover both coastal and highland regions
      const map = L.map(container, {
        center: [14.85, 108.40],
        zoom: 8,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        zoomControl: true,
      });

      // Add tile layer
      const layerConfig = TILE_LAYERS[mapLayerRef.current];
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

      // Fit full province bounds once container has visible dimensions
      applyInitialViewport(L, map, container);

      // Handle ResizeObserver to avoid blank/gray tile rendering and handle hidden-tab reveals
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ animate: false });
            if (!hasFittedInitialRef.current) {
              applyInitialViewport(L, mapInstanceRef.current, container);
            }
          }
        });
        ro.observe(container);
        resizeObserverRef.current = ro;
      }

      // Staged invalidateSize calls to guarantee tile coverage after layout paints
      [50, 200, 600].forEach((delay) => {
        setTimeout(() => {
          if (!isCancelled && mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize({ animate: false });
            if (!hasFittedInitialRef.current) {
              applyInitialViewport(L, mapInstanceRef.current, container);
            }
          }
        }, delay);
      });

      // Render initial markers
      drawMarkersAndRoute(L, map, markersLayer);
    });

    return () => {
      isCancelled = true;
      hasFittedInitialRef.current = false;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if ((container as unknown as Record<string, unknown>)._leaflet_id) {
        delete (container as unknown as Record<string, unknown>)._leaflet_id;
      }
    };
  }, [applyInitialViewport, drawMarkersAndRoute]);

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
  }, [places, selectedPlace, itineraryPlaces, drawMarkersAndRoute]);

  return (
    <div className="w-full h-full relative min-h-[380px]" data-lenis-prevent>
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-10" data-lenis-prevent />
    </div>
  );
}
