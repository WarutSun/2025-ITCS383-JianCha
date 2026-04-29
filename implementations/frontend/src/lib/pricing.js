/**
 * Drop-off fee matrix for one-way car rentals — shared between components.
 * Must stay in sync with backend (src/utils/dropoffFees.js).
 */
const DROPOFF_FEE_MATRIX = {
  'bangkok': { 'pattaya': 400, 'hua hin': 500, 'chiang mai': 1500, 'phuket': 2500 },
  'chiang mai': { 'bangkok': 1500, 'pattaya': 1800, 'hua hin': 2000, 'phuket': 3500 },
  'phuket': { 'bangkok': 2500, 'hua hin': 2200, 'pattaya': 2800, 'chiang mai': 3500 },
  'pattaya': { 'bangkok': 400, 'hua hin': 800, 'chiang mai': 1800, 'phuket': 2800 },
  'hua hin': { 'bangkok': 500, 'pattaya': 800, 'chiang mai': 2000, 'phuket': 2200 }
};

const DEFAULT_DROPOFF_FEE = 300;

export const getDropoffFee = (pickup, dropoff) => {
  if (!dropoff || pickup.toLowerCase() === dropoff.toLowerCase()) return 0;
  const p = pickup.toLowerCase();
  const d = dropoff.toLowerCase();
  return DROPOFF_FEE_MATRIX[p]?.[d] || DEFAULT_DROPOFF_FEE;
};

export const VALID_PROMO_CODES = ['ONLYTRAVELNAJA', 'GUBONUS', 'MEGA'];
export const PROMO_DISCOUNT_PERCENT = 30;

/**
 * Check if a promo code is valid (case-insensitive).
 */
export const isValidPromoCode = (code) => {
  return code && VALID_PROMO_CODES.includes(code.toUpperCase());
};
