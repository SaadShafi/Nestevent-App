import * as Location from 'expo-location';
import { Linking } from 'react-native';

export type Coords = { latitude: number; longitude: number };

export const DEFAULT_COORDS: Coords = { latitude: 33.7206, longitude: -116.2156 }; // Indio, CA
export const DEFAULT_LOCATION_LABEL = 'Indio, California, USA';

export type LocationResult = { coords: Coords; label: string };
/** Why `locate()` failed: permission denied (offer "Open Settings") or the fix could not be obtained. */
export type LocationError = { error: 'denied' | 'unavailable' };

export const isLocationError = (r: LocationResult | LocationError): r is LocationError => 'error' in r;

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/** Opens the OS settings page for this app so the user can grant location access. */
export function openLocationSettings() {
  return Linking.openSettings().catch(() => {});
}

/** "City, Region, Country" from an address. */
function cityLabel(addr: Location.LocationGeocodedAddress) {
  return [addr.city ?? addr.subregion ?? addr.district, addr.region, addr.country].filter(Boolean).join(', ');
}

/**
 * Device GPS fix (highest accuracy) + reverse geocode → "City, Region, Country".
 * Returns a `LocationError` so callers can distinguish a denied permission from a failed fix.
 */
export async function locate(): Promise<LocationResult | LocationError> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestLocationPermission();
      if (!granted) return { error: 'denied' };
    }
    let pos: Location.LocationObject | null = null;
    try {
      pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    } catch {
      pos = await Location.getLastKnownPositionAsync();
    }
    if (!pos) return { error: 'unavailable' };
    const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    let label = '';
    try {
      const [addr] = await Location.reverseGeocodeAsync(coords);
      if (addr) label = cityLabel(addr);
    } catch {
      // ignore geocode failure
    }
    if (!label) label = `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
    return { coords, label };
  } catch {
    return { error: 'unavailable' };
  }
}

/** Back-compat wrapper: null on any failure. Prefer `locate()` to surface the reason. */
export async function getCurrentLocation(): Promise<LocationResult | null> {
  const res = await locate();
  return isLocationError(res) ? null : res;
}

/** Full street address "12, Main St, City, Region, 90210, Country". */
export async function reverseGeocode(coords: Coords): Promise<string | null> {
  try {
    const [addr] = await Location.reverseGeocodeAsync(coords);
    if (!addr) return null;
    const street = [addr.streetNumber, addr.street].filter(Boolean).join(' ');
    return [street, addr.city ?? addr.subregion, addr.region, addr.postalCode, addr.country].filter(Boolean).join(', ');
  } catch {
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<Coords | null> {
  try {
    const [res] = await Location.geocodeAsync(address);
    if (!res) return null;
    return { latitude: res.latitude, longitude: res.longitude };
  } catch {
    return null;
  }
}

export function distanceKm(a: Coords, b: Coords) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
