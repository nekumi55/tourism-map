'use client';

import { useEffect, useMemo, useState } from 'react';
import { Place } from '@/types';
import {
  GeoZone,
  MARITIME_PORTS,
  OptimizeItineraryResult,
  RouteNode,
  expandItineraryLegs,
  expandTransitionSubLegs,
  getSeaChannelCoordinates,
  getSeaChannelDistanceKm,
  getSeaLegMinutes,
  rawDistanceKm,
  runTspWithCostMatrix,
  toRouteNode,
} from '@/utils/itinerary';

const OSRM_BASE_URL = 'https://router.project-osrm.org';

export interface RouteSegment {
  kind: 'road' | 'sea';
  coordinates: [number, number][];
  from: RouteNode;
  to: RouteNode;
  distanceKm: number;
  durationMinutes: number;
  label?: string;
  isFallback?: boolean;
}

export interface ComputedStopLegStep {
  kind: 'road' | 'sea';
  label: string;
  distanceKm: number;
  durationMinutes: number;
}

export interface ComputedStopLeg {
  fromPlaceId: string;
  toPlaceId: string;
  distanceKm: number;
  durationMinutes: number;
  hasSeaCrossing: boolean;
  steps: ComputedStopLegStep[];
}

export interface FullItineraryRoute {
  segments: RouteSegment[];
  transitPorts: RouteNode[];
  stopLegs: ComputedStopLeg[];
  totalDistanceKm: number;
  totalTravelMinutes: number;
  isApproximate: boolean;
}

interface CachedRoadSegment {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
}

const roadSegmentCache = new Map<string, CachedRoadSegment>();
const zoneTableCache = new Map<string, number[][]>();

function coordKey(node: { latitude: number; longitude: number }): string {
  return `${node.latitude.toFixed(5)},${node.longitude.toFixed(5)}`;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  externalSignal?: AbortSignal
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      clearTimeout(timer);
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }
}

export async function fetchRoadSegment(
  from: RouteNode,
  to: RouteNode,
  signal?: AbortSignal
): Promise<RouteSegment> {
  const key = `${coordKey(from)}->${coordKey(to)}`;
  const cached = roadSegmentCache.get(key);
  if (cached) {
    return {
      kind: 'road',
      from,
      to,
      coordinates: cached.coordinates,
      distanceKm: cached.distanceKm,
      durationMinutes: cached.durationMinutes,
    };
  }

  const fallbackDist = Number(rawDistanceKm(from, to).toFixed(1));
  const fallbackSegment: RouteSegment = {
    kind: 'road',
    from,
    to,
    coordinates: [
      [from.latitude, from.longitude],
      [to.latitude, to.longitude],
    ],
    distanceKm: fallbackDist,
    durationMinutes: Math.max(1, Math.round((fallbackDist / 35) * 60)),
    isFallback: true,
  };

  try {
    const url = `${OSRM_BASE_URL}/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
    const res = await fetchWithTimeout(url, 6500, signal);
    if (!res.ok) return fallbackSegment;

    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{
        distance: number;
        duration: number;
        geometry?: { coordinates?: [number, number][] };
      }>;
    };

    const route = data.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (data.code !== 'Ok' || !route || !Array.isArray(coords) || coords.length < 2) {
      return fallbackSegment;
    }

    const leafletCoords: [number, number][] = coords.map(([lng, lat]) => [lat, lng]);
    const distanceKm = Number((route.distance / 1000).toFixed(1));
    const durationMinutes = Math.max(1, Math.round(route.duration / 60));

    roadSegmentCache.set(key, {
      coordinates: leafletCoords,
      distanceKm,
      durationMinutes,
    });

    return {
      kind: 'road',
      from,
      to,
      coordinates: leafletCoords,
      distanceKm,
      durationMinutes,
    };
  } catch {
    return fallbackSegment;
  }
}

function buildSeaSegment(
  from: RouteNode,
  to: RouteNode,
  label?: string
): RouteSegment {
  const coordinates = getSeaChannelCoordinates(from, to);
  const distanceKm = Number(getSeaChannelDistanceKm(from, to).toFixed(1));
  const durationMinutes = getSeaLegMinutes(distanceKm, from.id, to.id);

  return {
    kind: 'sea',
    from,
    to,
    coordinates,
    distanceKm,
    durationMinutes,
    label,
  };
}

function collectRouteSummary(
  places: Place[],
  segmentsByLeg: RouteSegment[][],
  isApproximate: boolean
): FullItineraryRoute {
  const stopIdSet = new Set(places.map((p) => p.id));
  const transitPortsMap = new Map<string, RouteNode>();
  const allSegments: RouteSegment[] = [];
  const stopLegs: ComputedStopLeg[] = [];
  let totalDistanceKm = 0;
  let totalTravelMinutes = 0;

  for (let i = 0; i < places.length - 1; i++) {
    const legSegments = segmentsByLeg[i] ?? [];
    let legDist = 0;
    let legDuration = 0;
    let hasSeaCrossing = false;
    const steps: ComputedStopLegStep[] = [];

    for (const seg of legSegments) {
      allSegments.push(seg);
      legDist += seg.distanceKm;
      legDuration += seg.durationMinutes;
      if (seg.kind === 'sea') hasSeaCrossing = true;

      if (seg.from.isTransitPort && !stopIdSet.has(seg.from.id)) {
        transitPortsMap.set(seg.from.id, seg.from);
      }
      if (seg.to.isTransitPort && !stopIdSet.has(seg.to.id)) {
        transitPortsMap.set(seg.to.id, seg.to);
      }

      steps.push({
        kind: seg.kind,
        label:
          seg.label ??
          (seg.kind === 'road'
            ? `Đường bộ: ${seg.from.name} → ${seg.to.name}`
            : `${seg.from.name} → ${seg.to.name}`),
        distanceKm: seg.distanceKm,
        durationMinutes: seg.durationMinutes,
      });
    }

    const roundedLegDist = Number(legDist.toFixed(1));
    totalDistanceKm += roundedLegDist;
    totalTravelMinutes += legDuration;

    stopLegs.push({
      fromPlaceId: places[i].id,
      toPlaceId: places[i + 1].id,
      distanceKm: roundedLegDist,
      durationMinutes: legDuration,
      hasSeaCrossing,
      steps,
    });
  }

  return {
    segments: allSegments,
    transitPorts: Array.from(transitPortsMap.values()),
    stopLegs,
    totalDistanceKm: Number(totalDistanceKm.toFixed(1)),
    totalTravelMinutes,
    isApproximate,
  };
}

export function buildFallbackItineraryRoute(places: Place[]): FullItineraryRoute {
  if (places.length < 2) {
    return {
      segments: [],
      transitPorts: [],
      stopLegs: [],
      totalDistanceKm: 0,
      totalTravelMinutes: 0,
      isApproximate: false,
    };
  }

  const expandedLegs = expandItineraryLegs(places);
  const segmentsByLeg: RouteSegment[][] = expandedLegs.map((leg) =>
    leg.subLegs.map((sub) => {
      if (sub.kind === 'sea') {
        return buildSeaSegment(sub.from, sub.to, sub.label);
      }
      const dist = Number(rawDistanceKm(sub.from, sub.to).toFixed(1));
      return {
        kind: 'road',
        from: sub.from,
        to: sub.to,
        coordinates: [
          [sub.from.latitude, sub.from.longitude],
          [sub.to.latitude, sub.to.longitude],
        ],
        distanceKm: dist,
        durationMinutes: Math.max(1, Math.round((dist / 35) * 60)),
        isFallback: true,
      };
    })
  );

  return collectRouteSummary(places, segmentsByLeg, true);
}

export async function buildFullItineraryRoute(
  places: Place[],
  signal?: AbortSignal
): Promise<FullItineraryRoute> {
  if (places.length < 2) {
    return buildFallbackItineraryRoute(places);
  }

  const expandedLegs = expandItineraryLegs(places);
  let anyFallback = false;

  const segmentsByLeg = await Promise.all(
    expandedLegs.map((leg) =>
      Promise.all(
        leg.subLegs.map(async (sub) => {
          if (sub.kind === 'sea') {
            return buildSeaSegment(sub.from, sub.to, sub.label);
          }
          const seg = await fetchRoadSegment(sub.from, sub.to, signal);
          if (seg.isFallback) anyFallback = true;
          return seg;
        })
      )
    )
  );

  return collectRouteSummary(places, segmentsByLeg, anyFallback);
}

async function fetchZoneRoadMatrix(
  nodes: RouteNode[],
  signal?: AbortSignal
): Promise<number[][]> {
  const n = nodes.length;
  if (n <= 1) return [[0]];

  const fallbackMatrix = (): number[][] =>
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) =>
        i === j ? 0 : rawDistanceKm(nodes[i], nodes[j]) * 1.25
      )
    );

  const key = nodes.map(coordKey).join(';');
  const cached = zoneTableCache.get(key);
  if (cached) return cached;

  try {
    const coordParam = nodes.map((node) => `${node.longitude},${node.latitude}`).join(';');
    const url = `${OSRM_BASE_URL}/table/v1/driving/${coordParam}?annotations=distance`;
    const res = await fetchWithTimeout(url, 7000, signal);
    if (!res.ok) return fallbackMatrix();

    const data = (await res.json()) as {
      code?: string;
      distances?: (number | null)[][];
    };

    if (data.code !== 'Ok' || !Array.isArray(data.distances) || data.distances.length !== n) {
      return fallbackMatrix();
    }

    const matrix: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => {
        if (i === j) return 0;
        const meters = data.distances?.[i]?.[j];
        if (typeof meters === 'number' && Number.isFinite(meters)) {
          return meters / 1000;
        }
        return rawDistanceKm(nodes[i], nodes[j]) * 1.25;
      })
    );

    zoneTableCache.set(key, matrix);
    return matrix;
  } catch {
    return fallbackMatrix();
  }
}

/**
 * Optimizes itinerary stop order using actual OSRM map road distances per geographic zone
 * combined with mandatory maritime port corridor costs (Sa Kỳ <-> Lý Sơn Lớn <-> Đảo Bé).
 */
export async function optimizeItineraryOrderAsync(
  places: Place[],
  signal?: AbortSignal
): Promise<OptimizeItineraryResult> {
  if (places.length < 3) {
    return runTspWithCostMatrix(
      places,
      places.map(() => places.map(() => 0))
    );
  }

  const stopNodes = places.map(toRouteNode);
  const zoneGroups: Record<GeoZone, RouteNode[]> = {
    mainland: [],
    'ly-son-lon': [],
    'dao-be': [],
  };

  const zoneNodeIndex = new Map<string, { zone: GeoZone; index: number }>();

  const registerNode = (node: RouteNode) => {
    const key = `${node.zone}:${coordKey(node)}`;
    if (zoneNodeIndex.has(key)) return;
    const list = zoneGroups[node.zone];
    zoneNodeIndex.set(key, { zone: node.zone, index: list.length });
    list.push(node);
  };

  registerNode(MARITIME_PORTS.SA_KY);
  registerNode(MARITIME_PORTS.LY_SON_PORT);
  registerNode(MARITIME_PORTS.DAO_BE_PIER);
  stopNodes.forEach(registerNode);

  const [mainlandMatrix, lySonMatrix, daoBeMatrix] = await Promise.all([
    fetchZoneRoadMatrix(zoneGroups.mainland, signal),
    fetchZoneRoadMatrix(zoneGroups['ly-son-lon'], signal),
    fetchZoneRoadMatrix(zoneGroups['dao-be'], signal),
  ]);

  const matrices: Record<GeoZone, number[][]> = {
    mainland: mainlandMatrix,
    'ly-son-lon': lySonMatrix,
    'dao-be': daoBeMatrix,
  };

  const getRoadKm = (a: RouteNode, b: RouteNode): number => {
    const infoA = zoneNodeIndex.get(`${a.zone}:${coordKey(a)}`);
    const infoB = zoneNodeIndex.get(`${b.zone}:${coordKey(b)}`);
    if (!infoA || !infoB || infoA.zone !== infoB.zone) {
      return rawDistanceKm(a, b);
    }
    return matrices[infoA.zone][infoA.index][infoB.index];
  };

  const n = stopNodes.length;
  const costMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const subLegs = expandTransitionSubLegs(stopNodes[i], stopNodes[j]);
      costMatrix[i][j] = subLegs.reduce(
        (sum, leg) =>
          sum +
          (leg.kind === 'sea'
            ? getSeaChannelDistanceKm(leg.from, leg.to)
            : getRoadKm(leg.from, leg.to)),
        0
      );
    }
  }

  return runTspWithCostMatrix(places, costMatrix);
}

export function useItineraryRoute(places: Place[]): {
  route: FullItineraryRoute;
  isRouting: boolean;
} {
  const routeKey = useMemo(
    () =>
      places
        .map((p) => `${p.id}:${p.latitude.toFixed(5)},${p.longitude.toFixed(5)}`)
        .join('|'),
    [places]
  );

  const fallbackRoute = useMemo(() => buildFallbackItineraryRoute(places), [places]);

  const [resolved, setResolved] = useState<{
    key: string;
    route: FullItineraryRoute;
  } | null>(null);

  useEffect(() => {
    if (places.length < 2) return;
    const controller = new AbortController();

    buildFullItineraryRoute(places, controller.signal)
      .then((route) => {
        if (!controller.signal.aborted) {
          setResolved({ key: routeKey, route });
        }
      })
      .catch(() => {
        // Fallback route remains active when OSRM fails or is aborted
      });

    return () => {
      controller.abort();
    };
  }, [places, routeKey]);

  const activeRoute =
    places.length >= 2 && resolved && resolved.key === routeKey
      ? resolved.route
      : fallbackRoute;

  const isRouting = places.length >= 2 && (!resolved || resolved.key !== routeKey);

  return { route: activeRoute, isRouting };
}
