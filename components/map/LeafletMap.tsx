'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import type * as LType from 'leaflet';
import { Place } from '@/types';
import { RouteNode } from '@/utils/itinerary';
import { RouteSegment } from '@/utils/roadRouting';

interface LeafletMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  itineraryPlaces: Place[];
  mapLayer: 'standard' | 'satellite' | 'terrain';
  showMarkers?: boolean;
  showItineraryMarkers?: boolean;
  routeSegments?: RouteSegment[];
  transitPorts?: RouteNode[];
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
  showMarkers = true,
  showItineraryMarkers = false,
  routeSegments,
  transitPorts,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LType.Map | null>(null);
  const tileLayerRef = useRef<LType.TileLayer | null>(null);
  const markersLayerRef = useRef<LType.LayerGroup | null>(null);
  const routeLayerRef = useRef<LType.LayerGroup | null>(null);
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
  const showMarkersRef = useRef(showMarkers);
  const showItineraryMarkersRef = useRef(showItineraryMarkers);
  const routeSegmentsRef = useRef(routeSegments);
  const transitPortsRef = useRef(transitPorts);

  useEffect(() => {
    placesRef.current = places;
    selectedPlaceRef.current = selectedPlace;
    itineraryPlacesRef.current = itineraryPlaces;
    onSelectPlaceRef.current = onSelectPlace;
    mapLayerRef.current = mapLayer;
    showMarkersRef.current = showMarkers;
    showItineraryMarkersRef.current = showItineraryMarkers;
    routeSegmentsRef.current = routeSegments;
    transitPortsRef.current = transitPorts;
  }, [
    places,
    selectedPlace,
    itineraryPlaces,
    onSelectPlace,
    mapLayer,
    showMarkers,
    showItineraryMarkers,
    routeSegments,
    transitPorts,
  ]);

  const applyInitialViewport = useCallback(
    (L: typeof LType, map: LType.Map, container: HTMLDivElement) => {
      if (hasFittedInitialRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      map.invalidateSize({ animate: false });

      const currentSelected = selectedPlaceRef.current;
      const currentPlaces = placesRef.current.filter((p) => p.has_coordinates !== false);

      if (currentSelected && currentSelected.has_coordinates !== false) {
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

  // Helper: Draw markers and route polylines
  const drawMarkersAndRoute = useCallback(
    (L: typeof LType, map: LType.Map, markersGroup: LType.LayerGroup) => {
      markersGroup.clearLayers();

      // 1. Draw Route Polylines (road vs maritime)
      if (routeLayerRef.current) {
        routeLayerRef.current.clearLayers();
      }

      const routeTarget = routeLayerRef.current ?? map;
      const currentItinerary = itineraryPlacesRef.current;
      const currentSegments = routeSegmentsRef.current;

      if (currentSegments && currentSegments.length > 0) {
        currentSegments.forEach((seg) => {
          if (seg.coordinates.length < 2) return;
          const isSea = seg.kind === 'sea';
          L.polyline(seg.coordinates, {
            color: isSea ? '#0284c7' : '#0d9488',
            weight: isSea ? 4 : 5,
            opacity: isSea ? 0.92 : 0.9,
            dashArray: isSea || seg.isFallback ? '8, 8' : undefined,
            lineJoin: 'round',
            lineCap: 'round',
          }).addTo(routeTarget);
        });
      } else if (currentItinerary.length >= 2) {
        const latlngs: [number, number][] = currentItinerary.map((p) => [
          p.latitude,
          p.longitude,
        ]);

        L.polyline(latlngs, {
          color: '#0d9488',
          weight: 5,
          opacity: 0.95,
          dashArray: '8, 8',
        }).addTo(routeTarget);
      }

      // 2. Draw Markers (only places with verified coordinates)
      const currentPlaces = placesRef.current.filter((p) => p.has_coordinates !== false);
      const currentSelected = selectedPlaceRef.current;
      const validSelected =
        currentSelected && currentSelected.has_coordinates !== false ? currentSelected : null;
      const currentShowMarkers = showMarkersRef.current;
      const currentShowItineraryMarkers = showItineraryMarkersRef.current;
      const selectedChanged =
        Boolean(currentSelected?.id) && prevSelectedIdRef.current !== currentSelected?.id;
      prevSelectedIdRef.current = currentSelected?.id ?? null;

      let placesToRender: Place[] = [];
      if (currentShowMarkers) {
        placesToRender =
          validSelected && !currentPlaces.some((p) => p.id === validSelected.id)
            ? [...currentPlaces, validSelected]
            : currentPlaces;
      } else {
        const byId = new Map<string, Place>();
        if (currentShowItineraryMarkers) {
          currentItinerary
            .filter((p) => p.has_coordinates !== false)
            .forEach((p) => byId.set(p.id, p));
        }
        if (validSelected) {
          byId.set(validSelected.id, validSelected);
        }
        placesToRender = Array.from(byId.values());
      }

      placesToRender.forEach((place) => {
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

      // Draw automatically inserted maritime transit ports (Cảng Sa Kỳ, Bến tàu Lý Sơn, Cầu tàu Đảo Bé)
      const currentTransitPorts = transitPortsRef.current ?? [];
      if (currentTransitPorts.length > 0) {
        const renderedIds = new Set(placesToRender.map((p) => p.id));
        currentTransitPorts.forEach((port) => {
          if (renderedIds.has(port.id)) return;
          const portHtml = `
            <div class="map-pin-wrap">
              <div class="map-pin-dot" style="width: 30px; height: 30px; background: #0284c7;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/></svg>
              </div>
              <div class="map-pin-label">
                ${port.name}
              </div>
            </div>
          `;
          const portIcon = L.divIcon({
            className: 'custom-pin-marker',
            html: portHtml,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
          });
          const portMarker = L.marker([port.latitude, port.longitude], {
            icon: portIcon,
            title: port.name,
            alt: port.name,
            zIndexOffset: 420,
          });
          portMarker.on('click', () => {
            const matchedPlace = placesRef.current.find((p) => p.id === port.id);
            if (matchedPlace) {
              if (selectedPlaceRef.current?.id !== matchedPlace.id) {
                mapClickedIdRef.current = matchedPlace.id;
              }
              onSelectPlaceRef.current(matchedPlace);
            }
          });
          markersGroup.addLayer(portMarker);
        });
      }

      const currentSelectedId = currentSelected?.id ?? null;
      const selectionChanged = currentSelectedId !== lastHandledSelectedIdRef.current;

      const wasClickedOnMap =
        currentSelectedId !== null && mapClickedIdRef.current === currentSelectedId;
      if (wasClickedOnMap || currentSelectedId === null) {
        mapClickedIdRef.current = null;
      }

      const isContainerVisible =
        Boolean(containerRef.current) && (containerRef.current?.clientWidth ?? 0) > 0;

      if (selectionChanged && (isContainerVisible || wasClickedOnMap || currentSelectedId === null)) {
        lastHandledSelectedIdRef.current = currentSelectedId;
      }

      // Pan (and zoom in if at province-wide zoom) when a place is chosen outside the map (e.g. sidebar list)
      if (
        selectionChanged &&
        !wasClickedOnMap &&
        currentSelected &&
        hasFittedInitialRef.current &&
        isContainerVisible
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

      // Add route & markers layer groups (route sits underneath markers)
      const routeLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      tileLayerRef.current = tileLayer;
      routeLayerRef.current = routeLayer;
      markersLayerRef.current = markersLayer;

      // Fit full province bounds once container has visible dimensions
      applyInitialViewport(L, map, container);

      // Handle ResizeObserver to avoid blank/gray tile rendering and handle hidden-tab reveals
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          if (!isCancelled && mapInstanceRef.current) {
            const mapInstance = mapInstanceRef.current;
            mapInstance.invalidateSize({ animate: false });
            if (!hasFittedInitialRef.current) {
              applyInitialViewport(L, mapInstance, container);
            } else if (
              container.clientWidth > 0 &&
              selectedPlaceRef.current &&
              selectedPlaceRef.current.id !== lastHandledSelectedIdRef.current
            ) {
              const pending = selectedPlaceRef.current;
              lastHandledSelectedIdRef.current = pending.id;
              const reduceMotion =
                typeof window !== 'undefined' &&
                window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
              mapInstance.setView(
                [pending.latitude, pending.longitude],
                Math.max(mapInstance.getZoom(), 13),
                {
                  animate: !reduceMotion,
                  duration: reduceMotion ? 0 : 0.55,
                }
              );
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

  // Redraw Markers & Route when places or selection or itinerary or visibility changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    import('leaflet').then((L) => {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      drawMarkersAndRoute(L, mapInstanceRef.current, markersLayerRef.current);
    });
  }, [
    places,
    selectedPlace,
    itineraryPlaces,
    showMarkers,
    showItineraryMarkers,
    routeSegments,
    transitPorts,
    drawMarkersAndRoute,
  ]);

  return (
    <div className="w-full h-full relative min-h-[380px]" data-lenis-prevent>
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-10" data-lenis-prevent />
    </div>
  );
}
