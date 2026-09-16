import { PRICING_CONFIG } from '@/utils/constants';

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
