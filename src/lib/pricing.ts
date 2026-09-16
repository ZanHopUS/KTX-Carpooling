import { PRICING_CONFIG } from '@/utils/constants';

/**
 * Distance Matrix in kilometers between KTX Dorm Areas and University Campuses
 */
export const DISTANCE_MATRIX: Record<string, Record<string, number[]>> = {
  KHU_A: {
    HCMUS: [18.5, 2.5], // [CS1 (Q5), CS2 (Thủ Đức)]
    HCMUT: [17.0, 2.0], // [CS1 (Q10), CS2 (Thủ Đức)]
    UIT: [1.5],         // [CS chính (Thủ Đức)]
    USSH: [16.5, 2.2],  // [CS1 (Q1), CS2 (Thủ Đức)]
    IU: [1.8],          // [CS chính (Thủ Đức)]
    UEL: [3.5],         // [CS chính (Thủ Đức)]
  },
  KHU_B: {
    HCMUS: [20.0, 3.8], // [CS1 (Q5), CS2 (Thủ Đức)]
    HCMUT: [18.5, 3.2], // [CS1 (Q10), CS2 (Thủ Đức)]
    UIT: [2.8],         // [CS chính (Thủ Đức)]
    USSH: [18.0, 3.5],  // [CS1 (Q1), CS2 (Thủ Đức)]
    IU: [2.9],          // [CS chính (Thủ Đức)]
    UEL: [4.2],         // [CS chính (Thủ Đức)]
  },
};

/**
 * Returns exact estimated distance in km from KTX Dorm Area to University Campus
 */
export function getExactDistance(dormArea: string, universityId: string, campusIndex: number = 0): number {
  const areaDistances = DISTANCE_MATRIX[dormArea];
  if (!areaDistances) return 3.0; // fallback

  const uniDistances = areaDistances[universityId];
  if (!uniDistances || uniDistances.length === 0) return 3.0;

  return uniDistances[campusIndex] ?? uniDistances[0] ?? 3.0;
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
