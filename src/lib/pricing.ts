import { PRICING_CONFIG } from '@/utils/constants';

export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * GPS Coordinates for KTX Dorm Areas and University Campuses
 */
export const LOCATION_COORDINATES: Record<string, Coordinates | Coordinates[]> = {
  KHU_A: { lat: 10.8783, lng: 106.8066 },
  KHU_B: { lat: 10.8809, lng: 106.8021 },
  HCMUS: [
    { lat: 10.7628, lng: 106.6823 }, // CS1 Q5
    { lat: 10.8756, lng: 106.8007 }, // CS2 Thủ Đức
  ],
  HCMUT: [
    { lat: 10.7725, lng: 106.6578 }, // CS1 Q10
    { lat: 10.8800, lng: 106.8058 }, // CS2 Thủ Đức
  ],
  UIT: [{ lat: 10.8703, lng: 106.8037 }],
  USSH: [
    { lat: 10.7844, lng: 106.7027 }, // CS1 Q1
    { lat: 10.8715, lng: 106.8022 }, // CS2 Thủ Đức
  ],
  IU: [{ lat: 10.8775, lng: 106.8015 }],
  UEL: [{ lat: 10.8659, lng: 106.7779 }],
};

/**
 * Distance Matrix fallback in kilometers
 */
export const DISTANCE_MATRIX: Record<string, Record<string, number[]>> = {
  KHU_A: {
    HCMUS: [18.5, 2.5],
    HCMUT: [17.0, 2.0],
    UIT: [1.5],
    USSH: [16.5, 2.2],
    IU: [1.8],
    UEL: [3.5],
  },
  KHU_B: {
    HCMUS: [20.0, 3.8],
    HCMUT: [18.5, 3.2],
    UIT: [2.8],
    USSH: [18.0, 3.5],
    IU: [2.9],
    UEL: [4.2],
  },
};

/**
 * Returns exact estimated distance in km from KTX Dorm Area to University Campus (Static matrix)
 */
export function getExactDistance(dormArea: string, universityId: string, campusIndex: number = 0): number {
  const areaDistances = DISTANCE_MATRIX[dormArea];
  if (!areaDistances) return 3.0;

  const uniDistances = areaDistances[universityId];
  if (!uniDistances || uniDistances.length === 0) return 3.0;

  return uniDistances[campusIndex] ?? uniDistances[0] ?? 3.0;
}

/**
 * Fetches live motorcycle driving route distance in km using OpenStreetMap OSRM API
 * Falls back to static distance matrix if offline
 */
export async function fetchLiveMotorcycleDistance(
  dormArea: string,
  universityId: string,
  campusIndex: number = 0
): Promise<number> {
  const pickup = LOCATION_COORDINATES[dormArea] as Coordinates | undefined;
  const uniCampuses = LOCATION_COORDINATES[universityId] as Coordinates[] | undefined;

  if (!pickup || !uniCampuses || !uniCampuses[campusIndex]) {
    return getExactDistance(dormArea, universityId, campusIndex);
  }

  const dest = uniCampuses[campusIndex];

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dest.lng},${dest.lat}?overview=false`;
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) throw new Error('OSRM API HTTP Error');

    const data = await res.json();
    if (data.routes && data.routes[0] && data.routes[0].distance) {
      const distanceKm = data.routes[0].distance / 1000;
      return Math.round(distanceKm * 10) / 10;
    }
  } catch (error) {
    console.warn('Using static distance fallback:', error);
  }

  return getExactDistance(dormArea, universityId, campusIndex);
}

/**
 * Calculates suggested contribution price for motorcycle carpooling
 * Formula: distance_km * 2000 VND, minimum 5000 VND
 */
export function calculateSuggestedPrice(distanceKm: number): number {
  if (distanceKm <= 0) return PRICING_CONFIG.MINIMUM_PRICE;
  const calculated = distanceKm * PRICING_CONFIG.PRICE_PER_KM;
  return Math.max(calculated, PRICING_CONFIG.MINIMUM_PRICE);
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}
