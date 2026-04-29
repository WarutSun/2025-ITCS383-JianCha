/**
 * Promo code and pricing utilities — shared between controllers.
 */

const VALID_PROMO_CODES = ['ONLYTRAVELNAJA', 'GUBONUS', 'MEGA'];
const PROMO_DISCOUNT_PERCENT = 30;

/**
 * Check if a promo code is valid (case-insensitive).
 */
const isValidPromoCode = (code) => {
  return code && VALID_PROMO_CODES.includes(code.toUpperCase());
};

/**
 * Calculate the discounted price per day for a car with an active promotion.
 */
const calculateDiscountedPrice = (pricePerDay, isPromotion, discountPercent) => {
  if (!isPromotion || !discountPercent) return pricePerDay;
  return Math.round(pricePerDay * (1 - discountPercent / 100));
};

/**
 * Apply promo code discount to a total price.
 * Returns the discounted total if valid code, otherwise the original.
 */
const applyPromoDiscount = (totalPrice, promoCode) => {
  if (isValidPromoCode(promoCode)) {
    return Math.round(totalPrice * (1 - PROMO_DISCOUNT_PERCENT / 100));
  }
  return totalPrice;
};

module.exports = {
  VALID_PROMO_CODES,
  PROMO_DISCOUNT_PERCENT,
  isValidPromoCode,
  calculateDiscountedPrice,
  applyPromoDiscount
};
