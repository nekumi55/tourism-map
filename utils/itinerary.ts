import { Place } from '@/types';

export type GeoZone = 'mainland' | 'ly-son-lon' | 'dao-be';

export interface RouteNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zone: GeoZone;
  isTransitPort?: boolean;
}

export interface ExpandedSubLeg {
  kind: 'road' | 'sea';
  from: RouteNode;
  to: RouteNode;
  label?: string;
}

export interface ExpandedStopLeg {
  fromStop: Place;
  toStop: Place;
  subLegs: ExpandedSubLeg[];
}

export const MARITIME_PORTS: Record<'SA_KY' | 'LY_SON_PORT' | 'DAO_BE_PIER', RouteNode> = {
  SA_KY: {
    id: 'pl-cang-sa-ky',
    name: 'Cảng Sa Kỳ',
    latitude: 15.2160,
    longitude: 108.9139,
    zone: 'mainland',
    isTransitPort: true,
  },
  LY_SON_PORT: {
    id: 'pl-ben-tau-ly-son',
    name: 'Bến tàu cano Đảo Lý Sơn Lớn - Đảo Bé',
    latitude: 15.3794,
    longitude: 109.0954,
    zone: 'ly-son-lon',
    isTransitPort: true,
  },
  DAO_BE_PIER: {
    id: 'pl-cau-tau-dao-be',
    name: 'Cầu tàu Đảo Bé - An Bình',
    latitude: 15.4257,
    longitude: 109.0796,
    zone: 'dao-be',
    isTransitPort: true,
  },
};

export function getPlaceZone(place: {
  id?: string;
  latitude: number;
  longitude: number;
}): GeoZone {
  if (
    place.id === 'pl-cu-lao-bo-bai' ||
    place.id === 'pl-cau-tau-dao-be' ||
    (place.latitude >= 15.41 &&
      place.latitude <= 15.45 &&
      place.longitude >= 109.06 &&
      place.longitude <= 109.11)
  ) {
    return 'dao-be';
  }

  if (
    place.id === 'pl-ben-tau-ly-son' ||
    (place.latitude >= 15.35 &&
      place.latitude <= 15.41 &&
      place.longitude >= 109.07 &&
      place.longitude <= 109.16)
  ) {
    return 'ly-son-lon';
  }

  return 'mainland';
}

export function toRouteNode(place: Place): RouteNode {
  return {
    id: place.id,
    name: place.name.replace(/\[Minh Họa\]\s*/g, ''),
    latitude: place.latitude,
    longitude: place.longitude,
    zone: getPlaceZone(place),
    isTransitPort:
      place.id === MARITIME_PORTS.SA_KY.id ||
      place.id === MARITIME_PORTS.LY_SON_PORT.id ||
      place.id === MARITIME_PORTS.DAO_BE_PIER.id,
  };
}

export function rawDistanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function isSameLocation(
  a: { id?: string; latitude: number; longitude: number },
  b: { id?: string; latitude: number; longitude: number }
): boolean {
  if (a.id && b.id && a.id === b.id) return true;
  return rawDistanceKm(a, b) < 0.08;
}

export function getSeaLegMinutes(
  distanceKm: number,
  fromId: string,
  toId: string
): number {
  const involvesSaKy =
    fromId === MARITIME_PORTS.SA_KY.id || toId === MARITIME_PORTS.SA_KY.id;
  if (involvesSaKy) {
    return Math.max(30, Math.round((distanceKm / 45) * 60));
  }
  return Math.max(12, Math.round((distanceKm / 25) * 60));
}

const SA_KY_TO_LY_SON_WAYPOINTS: [number, number][] = [
  [MARITIME_PORTS.SA_KY.latitude, MARITIME_PORTS.SA_KY.longitude],
  [15.2142, 108.9142],
  [15.2124, 108.9148],
  [15.2102, 108.9165],
  [15.2078, 108.9196],
  [15.2054, 108.9238],
  [15.2046, 108.9275],
  [15.2085, 108.9325],
  [15.2180, 108.9405],
  [15.2360, 108.9575],
  [15.2850, 109.0050],
  [15.3400, 109.0540],
  [15.3740, 109.0855],
  [15.3788, 109.0920],
  [15.37935, 109.09475],
  [MARITIME_PORTS.LY_SON_PORT.latitude, MARITIME_PORTS.LY_SON_PORT.longitude],
];

const LY_SON_TO_DAO_BE_WAYPOINTS: [number, number][] = [
  [MARITIME_PORTS.LY_SON_PORT.latitude, MARITIME_PORTS.LY_SON_PORT.longitude],
  [15.3793, 109.0945],
  [15.3822, 109.0905],
  [15.3900, 109.0875],
  [15.4050, 109.0835],
  [15.4190, 109.0808],
  [MARITIME_PORTS.DAO_BE_PIER.latitude, MARITIME_PORTS.DAO_BE_PIER.longitude],
];

function interpolateSeaSpline(
  points: [number, number][],
  subdivisions = 6
): [number, number][] {
  if (points.length < 2) return points;
  const result: [number, number][] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    for (let step = 0; step < subdivisions; step++) {
      const t = step / subdivisions;
      const t2 = t * t;
      const t3 = t2 * t;

      const lat =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lng =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);

      result.push([lat, lng]);
    }
  }

  result.push(points[points.length - 1]);
  return result;
}

/**
 * Returns offshore maritime channel coordinates between two official ports,
 * routing safely out of Sa Kỳ river mouth / Mũi Ba Làng An and around the western
 * coast of Đảo Lớn Lý Sơn without crossing land.
 */
export function getSeaChannelCoordinates(
  from: RouteNode,
  to: RouteNode
): [number, number][] {
  let controlPoints: [number, number][] | null = null;

  if (from.id === MARITIME_PORTS.SA_KY.id && to.id === MARITIME_PORTS.LY_SON_PORT.id) {
    controlPoints = SA_KY_TO_LY_SON_WAYPOINTS;
  } else if (from.id === MARITIME_PORTS.LY_SON_PORT.id && to.id === MARITIME_PORTS.SA_KY.id) {
    controlPoints = [...SA_KY_TO_LY_SON_WAYPOINTS].reverse();
  } else if (
    from.id === MARITIME_PORTS.LY_SON_PORT.id &&
    to.id === MARITIME_PORTS.DAO_BE_PIER.id
  ) {
    controlPoints = LY_SON_TO_DAO_BE_WAYPOINTS;
  } else if (
    from.id === MARITIME_PORTS.DAO_BE_PIER.id &&
    to.id === MARITIME_PORTS.LY_SON_PORT.id
  ) {
    controlPoints = [...LY_SON_TO_DAO_BE_WAYPOINTS].reverse();
  }

  if (!controlPoints) {
    return [
      [from.latitude, from.longitude],
      [to.latitude, to.longitude],
    ];
  }

  return interpolateSeaSpline(controlPoints, 6);
}

export function getSeaChannelDistanceKm(from: RouteNode, to: RouteNode): number {
  const coords = getSeaChannelCoordinates(from, to);
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += rawDistanceKm(
      { latitude: coords[i][0], longitude: coords[i][1] },
      { latitude: coords[i + 1][0], longitude: coords[i + 1][1] }
    );
  }
  return total;
}

/**
 * Expands a transition between two stops into legal road & sea sub-legs.
 * Enforces mandatory maritime corridors:
 * - Mainland <-> Lý Sơn Lớn: via Cảng Sa Kỳ <-> Bến tàu cano Đảo Lý Sơn Lớn - Đảo Bé
 * - Lý Sơn Lớn <-> Đảo Bé: via Bến tàu cano Đảo Lý Sơn Lớn - Đảo Bé <-> Cầu tàu Đảo Bé - An Bình
 * - Mainland <-> Đảo Bé: ALWAYS transits through Bến tàu cano Đảo Lý Sơn Lớn - Đảo Bé
 *   (never directly between Cảng Sa Kỳ and Cầu tàu Đảo Bé - An Bình).
 */
export function expandTransitionSubLegs(
  fromNode: RouteNode,
  toNode: RouteNode
): ExpandedSubLeg[] {
  const zFrom = fromNode.zone;
  const zTo = toNode.zone;

  if (zFrom === zTo) {
    if (isSameLocation(fromNode, toNode)) return [];
    return [{ kind: 'road', from: fromNode, to: toNode }];
  }

  const subLegs: ExpandedSubLeg[] = [];
  const pushRoadIfNeeded = (a: RouteNode, b: RouteNode) => {
    if (!isSameLocation(a, b)) {
      subLegs.push({ kind: 'road', from: a, to: b });
    }
  };

  if (zFrom === 'mainland' && zTo === 'ly-son-lon') {
    pushRoadIfNeeded(fromNode, MARITIME_PORTS.SA_KY);
    subLegs.push({
      kind: 'sea',
      from: MARITIME_PORTS.SA_KY,
      to: MARITIME_PORTS.LY_SON_PORT,
      label: 'Tàu cao tốc: Cảng Sa Kỳ → Bến tàu Lý Sơn Lớn',
    });
    pushRoadIfNeeded(MARITIME_PORTS.LY_SON_PORT, toNode);
  } else if (zFrom === 'ly-son-lon' && zTo === 'mainland') {
    pushRoadIfNeeded(fromNode, MARITIME_PORTS.LY_SON_PORT);
    subLegs.push({
      kind: 'sea',
      from: MARITIME_PORTS.LY_SON_PORT,
      to: MARITIME_PORTS.SA_KY,
      label: 'Tàu cao tốc: Bến tàu Lý Sơn Lớn → Cảng Sa Kỳ',
    });
    pushRoadIfNeeded(MARITIME_PORTS.SA_KY, toNode);
  } else if (zFrom === 'ly-son-lon' && zTo === 'dao-be') {
    pushRoadIfNeeded(fromNode, MARITIME_PORTS.LY_SON_PORT);
    subLegs.push({
      kind: 'sea',
      from: MARITIME_PORTS.LY_SON_PORT,
      to: MARITIME_PORTS.DAO_BE_PIER,
      label: 'Cano: Bến tàu Lý Sơn Lớn → Cầu tàu Đảo Bé - An Bình',
    });
    pushRoadIfNeeded(MARITIME_PORTS.DAO_BE_PIER, toNode);
  } else if (zFrom === 'dao-be' && zTo === 'ly-son-lon') {
    pushRoadIfNeeded(fromNode, MARITIME_PORTS.DAO_BE_PIER);
    subLegs.push({
      kind: 'sea',
      from: MARITIME_PORTS.DAO_BE_PIER,
      to: MARITIME_PORTS.LY_SON_PORT,
      label: 'Cano: Cầu tàu Đảo Bé - An Bình → Bến tàu Lý Sơn Lớn',
    });
    pushRoadIfNeeded(MARITIME_PORTS.LY_SON_PORT, toNode);
  } else if (zFrom === 'mainland' && zTo === 'dao-be') {
    pushRoadIfNeeded(fromNode, MARITIME_PORTS.SA_KY);
    subLegs.push({
      kind: 'sea',
      from: MARITIME_PORTS.SA_KY,
      to: MARITIME_PORTS.LY_SON_PORT,
      label: 'Tàu cao tốc: Cảng Sa Kỳ → Bến tàu Lý Sơn Lớn',
    });
    subLegs.push({
      kind: 'sea',
      from: MARITIME_PORTS.LY_SON_PORT,
      to: MARITIME_PORTS.DAO_BE_PIER,
      label: 'Cano: Bến tàu Lý Sơn Lớn → Cầu tàu Đảo Bé - An Bình',
    });
    pushRoadIfNeeded(MARITIME_PORTS.DAO_BE_PIER, toNode);
  } else if (zFrom === 'dao-be' && zTo === 'mainland') {
    pushRoadIfNeeded(fromNode, MARITIME_PORTS.DAO_BE_PIER);
    subLegs.push({
      kind: 'sea',
      from: MARITIME_PORTS.DAO_BE_PIER,
      to: MARITIME_PORTS.LY_SON_PORT,
      label: 'Cano: Cầu tàu Đảo Bé - An Bình → Bến tàu Lý Sơn Lớn',
    });
    subLegs.push({
      kind: 'sea',
      from: MARITIME_PORTS.LY_SON_PORT,
      to: MARITIME_PORTS.SA_KY,
      label: 'Tàu cao tốc: Bến tàu Lý Sơn Lớn → Cảng Sa Kỳ',
    });
    pushRoadIfNeeded(MARITIME_PORTS.SA_KY, toNode);
  }

  return subLegs;
}

export function expandItineraryLegs(places: Place[]): ExpandedStopLeg[] {
  if (places.length < 2) return [];
  const legs: ExpandedStopLeg[] = [];
  for (let i = 0; i < places.length - 1; i++) {
    const fromStop = places[i];
    const toStop = places[i + 1];
    legs.push({
      fromStop,
      toStop,
      subLegs: expandTransitionSubLegs(toRouteNode(fromStop), toRouteNode(toStop)),
    });
  }
  return legs;
}

export function expandItineraryNodes(places: Place[]): RouteNode[] {
  if (places.length === 0) return [];
  const nodes: RouteNode[] = [toRouteNode(places[0])];
  const legs = expandItineraryLegs(places);
  for (const leg of legs) {
    for (const sub of leg.subLegs) {
      const last = nodes[nodes.length - 1];
      if (!isSameLocation(last, sub.to)) {
        nodes.push(sub.to);
      }
    }
  }
  return nodes;
}

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  return Number(
    rawDistanceKm({ latitude: lat1, longitude: lon1 }, { latitude: lat2, longitude: lon2 }).toFixed(1)
  );
}

/**
 * Calculates total route distance across expanded road & maritime transit legs
 */
export function calculateTotalRouteDistance(places: Place[]): number {
  if (places.length < 2) return 0;
  let total = 0;
  const legs = expandItineraryLegs(places);
  for (const leg of legs) {
    for (const sub of leg.subLegs) {
      total +=
        sub.kind === 'sea'
          ? getSeaChannelDistanceKm(sub.from, sub.to)
          : rawDistanceKm(sub.from, sub.to);
    }
  }
  return Number(total.toFixed(1));
}

/**
 * Builds a direct Google Maps Directions URL including mandatory maritime port waypoints
 */
export function buildGoogleMapsRouteUrl(places: Place[]): string {
  if (places.length === 0) return 'https://maps.google.com';
  if (places.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${places[0].latitude},${places[0].longitude}`;
  }

  const expanded = expandItineraryNodes(places);
  const origin = `${expanded[0].latitude},${expanded[0].longitude}`;
  const destination = `${expanded[expanded.length - 1].latitude},${expanded[expanded.length - 1].longitude}`;

  if (expanded.length === 2) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }

  const waypoints = expanded
    .slice(1, -1)
    .slice(0, 23)
    .map((p) => `${p.latitude},${p.longitude}`)
    .join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(
    waypoints
  )}&travelmode=driving`;
}

export interface OptimizeItineraryResult {
  places: Place[];
  beforeKm: number;
  afterKm: number;
  savedKm: number;
  changed: boolean;
}

export function runTspWithCostMatrix(
  places: Place[],
  costMatrix: number[][]
): OptimizeItineraryResult {
  const pathCost = (indices: number[]) => {
    let sum = 0;
    for (let i = 0; i < indices.length - 1; i++) {
      sum += costMatrix[indices[i]][indices[i + 1]];
    }
    return sum;
  };

  const originalIndices = places.map((_, i) => i);
  const rawBefore = pathCost(originalIndices);
  const beforeKm = Number(rawBefore.toFixed(1));

  if (places.length < 3) {
    return {
      places: [...places],
      beforeKm,
      afterKm: beforeKm,
      savedKm: 0,
      changed: false,
    };
  }

  // Step 1: Nearest Neighbor starting from index 0 (starting stop fixed)
  const remaining = new Set<number>(places.slice(1).map((_, idx) => idx + 1));
  const order: number[] = [0];
  while (remaining.size > 0) {
    const current = order[order.length - 1];
    let bestNext = -1;
    let bestCost = Infinity;
    for (const candidate of remaining) {
      const c = costMatrix[current][candidate];
      if (c < bestCost) {
        bestCost = c;
        bestNext = candidate;
      }
    }
    remaining.delete(bestNext);
    order.push(bestNext);
  }

  // Step 2: 2-opt refinement keeping index 0 fixed
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < order.length - 1; i++) {
      for (let k = i + 1; k < order.length; k++) {
        const currentEdges =
          costMatrix[order[i - 1]][order[i]] +
          (k + 1 < order.length ? costMatrix[order[k]][order[k + 1]] : 0);
        const swappedEdges =
          costMatrix[order[i - 1]][order[k]] +
          (k + 1 < order.length ? costMatrix[order[i]][order[k + 1]] : 0);

        if (swappedEdges + 1e-9 < currentEdges) {
          let left = i;
          let right = k;
          while (left < right) {
            const tmp = order[left];
            order[left] = order[right];
            order[right] = tmp;
            left++;
            right--;
          }
          improved = true;
        }
      }
    }
  }

  const rawAfter = pathCost(order);
  const afterKm = Number(rawAfter.toFixed(1));
  const changed = order.some((origIdx, pos) => origIdx !== pos);

  if (!changed || rawAfter + 1e-6 >= rawBefore || afterKm > beforeKm) {
    return {
      places: [...places],
      beforeKm,
      afterKm: beforeKm,
      savedKm: 0,
      changed: false,
    };
  }

  const savedKm = Number(Math.max(0, beforeKm - afterKm).toFixed(1));
  return {
    places: order.map((idx) => places[idx]),
    beforeKm,
    afterKm,
    savedKm,
    changed: true,
  };
}

/**
 * Synchronous Haversine + maritime corridor optimizer (used as fallback when OSRM is unavailable).
 */
export function optimizeItineraryOrder(places: Place[]): OptimizeItineraryResult {
  const n = places.length;
  const nodes = places.map(toRouteNode);
  const costMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const subLegs = expandTransitionSubLegs(nodes[i], nodes[j]);
      costMatrix[i][j] = subLegs.reduce(
        (sum, leg) =>
          sum +
          (leg.kind === 'sea'
            ? getSeaChannelDistanceKm(leg.from, leg.to)
            : rawDistanceKm(leg.from, leg.to)),
        0
      );
    }
  }

  return runTspWithCostMatrix(places, costMatrix);
}

export function formatOptimizeNotice(result: OptimizeItineraryResult): string {
  if (!result.changed) {
    return `Thứ tự hiện tại đã tối ưu theo tuyến đường bộ (~ ${result.afterKm} km).`;
  }
  if (result.savedKm > 0) {
    return `Đã tối ưu lộ trình theo đường bộ & tuyến tàu, rút ngắn ~ ${result.savedKm} km (còn ~ ${result.afterKm} km).`;
  }
  return `Đã sắp xếp lại thứ tự các chặng hợp lý theo bản đồ (~ ${result.afterKm} km).`;
}

export type ItineraryPresetId =
  | 'ly-son'
  | 'heritage'
  | 'cuisine'
  | 'relics'
  | 'pagodas'
  | 'nature';

export interface ItineraryPreset {
  id: ItineraryPresetId;
  shortLabel: string;
  tourLabel: string;
  accent: 'jade' | 'ochre';
}

export const ITINERARY_PRESETS: ItineraryPreset[] = [
  {
    id: 'ly-son',
    shortLabel: 'Đảo Lý Sơn',
    tourLabel: 'Tour Đảo Lý Sơn',
    accent: 'jade',
  },
  {
    id: 'heritage',
    shortLabel: 'Sông Trà & Di sản',
    tourLabel: 'Tour Sông Trà & Di Sản',
    accent: 'ochre',
  },
  {
    id: 'cuisine',
    shortLabel: 'Ẩm thực & Đặc sản',
    tourLabel: 'Tour Ẩm Thực Đặc Sản',
    accent: 'ochre',
  },
  {
    id: 'relics',
    shortLabel: 'Chứng tích tiêu biểu',
    tourLabel: 'Tour Chứng Tích Tiêu Biểu',
    accent: 'jade',
  },
  {
    id: 'pagodas',
    shortLabel: 'Chùa',
    tourLabel: 'Tour Chùa',
    accent: 'jade',
  },
  {
    id: 'nature',
    shortLabel: 'Thiên nhiên & Cao nguyên',
    tourLabel: 'Tour Thiên Nhiên & Măng Đen',
    accent: 'jade',
  },
];

function pickByPreferredIds(
  places: Place[],
  preferredIds: string[],
  fallbackFilter: (p: Place) => boolean,
  limit = 4
): Place[] {
  const byId = new Map(places.map((p) => [p.id, p]));
  const picked: Place[] = [];
  const usedIds = new Set<string>();

  for (const id of preferredIds) {
    const found = byId.get(id);
    if (found && !usedIds.has(found.id)) {
      picked.push(found);
      usedIds.add(found.id);
      if (picked.length >= limit) return picked;
    }
  }

  for (const place of places) {
    if (!usedIds.has(place.id) && fallbackFilter(place)) {
      picked.push(place);
      usedIds.add(place.id);
      if (picked.length >= limit) return picked;
    }
  }

  return picked.length > 0 ? picked : places.slice(0, limit);
}

export function getPresetPlaces(presetId: ItineraryPresetId, places: Place[]): Place[] {
  if (places.length === 0) return [];

  switch (presetId) {
    case 'ly-son': {
      const items = places
        .filter(
          (p) =>
            p.district_id === 'dist-ly-son' &&
            p.id !== MARITIME_PORTS.LY_SON_PORT.id &&
            p.id !== MARITIME_PORTS.DAO_BE_PIER.id
        )
        .slice(0, 4);
      return items.length > 0 ? items : places.slice(0, 4);
    }
    case 'heritage': {
      const items = places
        .filter((p) => p.district_id === 'dist-tp-quang-ngai' || p.district_id === 'dist-kon-tum')
        .slice(0, 4);
      return items.length > 0 ? items : places.slice(0, 4);
    }
    case 'cuisine':
      return pickByPreferredIds(
        places,
        ['pl-don-quang-ngai', 'pl-ca-bong-song-tra', 'pl-hanh-toi-ly-son', 'pl-goi-la-kon-tum'],
        (p) => p.category_id === 'cat-cuisine'
      );
    case 'relics':
      return pickByPreferredIds(
        places,
        ['pl-khu-di-tich-son-my', 'pl-pham-van-dong', 'pl-khoi-nghia-ba-to', 'pl-nha-nguc-kon-tum'],
        (p) => p.category_id === 'cat-history'
      );
    case 'pagodas':
      return pickByPreferredIds(
        places,
        ['pl-thien-an-huynh-thuc-khang', 'pl-chua-ong', 'pl-chua-dieu-giac', 'pl-chua-hang'],
        (p) => /chùa|tự|điện|nhà thờ/i.test(p.name)
      );
    case 'nature':
      return pickByPreferredIds(
        places,
        ['pl-mang-den', 'pl-thac-trang', 'pl-bien-my-khe', 'pl-cong-to-vo'],
        (p) => p.category_id === 'cat-nature'
      );
  }
}
