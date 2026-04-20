// Baadmay installment payment configuration
export const BAADMAY_CONFIG = {
  // Minimum price threshold for showing installment option
  MIN_PRICE_THRESHOLD: 1000,
  // Number of installments
  NUM_INSTALLMENTS: 3,
};

/**
 * Calculate the installment amount for a given price
 * @param {number} price - The total price
 * @returns {number} - The per-installment amount (rounded up), or 0 if invalid
 */
export const calculateInstallmentAmount = (price) => {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return 0;
  }
  return Math.ceil(numericPrice / BAADMAY_CONFIG.NUM_INSTALLMENTS);
};
