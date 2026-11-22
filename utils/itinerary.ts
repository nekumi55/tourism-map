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
