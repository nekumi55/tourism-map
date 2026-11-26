import { Place } from '@/types';

/**
 * Calculates the Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Calculates the total route distance across sequential places
 */
export function calculateTotalRouteDistance(places: Place[]): number {
  if (places.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < places.length - 1; i++) {
    total += calculateDistanceKm(
      places[i].latitude,
      places[i].longitude,
      places[i + 1].latitude,
      places[i + 1].longitude
    );
  }
  return Number(total.toFixed(1));
}

/**
 * Builds a direct Google Maps Directions URL for sequential stops
 */
export function buildGoogleMapsRouteUrl(places: Place[]): string {
  if (places.length === 0) return 'https://maps.google.com';
  if (places.length === 1) {
    return `https://www.google.com/maps/search/?api=1&query=${places[0].latitude},${places[0].longitude}`;
  }

  const origin = `${places[0].latitude},${places[0].longitude}`;
  const destination = `${places[places.length - 1].latitude},${places[places.length - 1].longitude}`;

  if (places.length === 2) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
  }

  const waypoints = places
    .slice(1, -1)
    .map((p) => `${p.latitude},${p.longitude}`)
    .join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${encodeURIComponent(
    waypoints
  )}&travelmode=driving`;
}

function rawDistanceKm(a: Place, b: Place): number {
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

function rawTotalDistanceKm(route: Place[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += rawDistanceKm(route[i], route[i + 1]);
  }
  return total;
}

export interface OptimizeItineraryResult {
  places: Place[];
  beforeKm: number;
  afterKm: number;
  savedKm: number;
  changed: boolean;
}

/**
 * Optimizes an open-path itinerary starting from the first stop using
 * Nearest Neighbor construction followed by 2-opt local refinement.
 */
export function optimizeItineraryOrder(places: Place[]): OptimizeItineraryResult {
  const beforeKm = calculateTotalRouteDistance(places);
  if (places.length < 3) {
    return {
      places: [...places],
      beforeKm,
      afterKm: beforeKm,
      savedKm: 0,
      changed: false,
    };
  }

  // Step 1: Nearest Neighbor starting from places[0]
  const remaining = places.slice(1);
  const route: Place[] = [places[0]];
  while (remaining.length > 0) {
    const current = route[route.length - 1];
    let bestIdx = 0;
    let bestDist = rawDistanceKm(current, remaining[0]);
    for (let i = 1; i < remaining.length; i++) {
      const dist = rawDistanceKm(current, remaining[i]);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    route.push(remaining.splice(bestIdx, 1)[0]);
  }

  // Step 2: 2-opt refinement keeping index 0 (starting stop) fixed
  let improved = true;
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 1; i++) {
      for (let k = i + 1; k < route.length; k++) {
        const currentEdges =
          rawDistanceKm(route[i - 1], route[i]) +
          (k + 1 < route.length ? rawDistanceKm(route[k], route[k + 1]) : 0);
        const swappedEdges =
          rawDistanceKm(route[i - 1], route[k]) +
          (k + 1 < route.length ? rawDistanceKm(route[i], route[k + 1]) : 0);

        if (swappedEdges + 1e-9 < currentEdges) {
          let left = i;
          let right = k;
          while (left < right) {
            const tmp = route[left];
            route[left] = route[right];
            route[right] = tmp;
            left++;
            right--;
          }
          improved = true;
        }
      }
    }
  }

  const rawBefore = rawTotalDistanceKm(places);
  const rawAfter = rawTotalDistanceKm(route);
  const afterKm = calculateTotalRouteDistance(route);
  const changed = route.some((p, idx) => p.id !== places[idx].id);

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
    places: route,
    beforeKm,
    afterKm,
    savedKm,
    changed: true,
  };
}

export function formatOptimizeNotice(result: OptimizeItineraryResult): string {
  if (!result.changed) {
    return `Thứ tự hiện tại đã tối ưu (~ ${result.afterKm} km).`;
  }
  if (result.savedKm > 0) {
    return `Đã sắp xếp tối ưu từ điểm xuất phát, rút ngắn ~ ${result.savedKm} km (còn ~ ${result.afterKm} km).`;
  }
  return `Đã sắp xếp lại thứ tự các chặng hợp lý hơn (~ ${result.afterKm} km).`;
}
