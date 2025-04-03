
/**
 * Currency conversion utility for PayPal payments
 * Converts Saudi Riyal (SAR) to US Dollar (USD)
 */

// Exchange rate (approximate, should be updated with real-time rates in production)
const SAR_TO_USD_RATE = 0.27;

/**
 * Convert Saudi Riyal to US Dollar
 * @param sarAmount Amount in Saudi Riyal
 * @returns Converted amount in US Dollar (rounded to 2 decimal places)
 */
export const sarToUsd = (sarAmount: number): number => {
  return Number((sarAmount * SAR_TO_USD_RATE).toFixed(2));
};

/**
 * Format currency with appropriate symbol
 * @param amount The amount to format
 * @param currency The currency code (defaults to 'SAR')
 * @returns Formatted price string with currency symbol
 */
export const formatCurrency = (amount: number, currency: 'SAR' | 'USD' = 'SAR'): string => {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ريال`;
};

/**
 * Get formatted price with currency symbol
 * @param amount The amount to format
 * @param currency The currency code ('SAR' or 'USD')
 * @returns Formatted price string with currency symbol
 */
export const formatPrice = (amount: number, currency: 'SAR' | 'USD'): string => {
  if (currency === 'USD') {
    return `$${amount.toFixed(2)}`;
  }
  return `${amount.toFixed(2)} ريال`;
};

/**
 * Get PayPal-ready price based on user payment settings
 * @param sarAmount Amount in Saudi Riyal
 * @returns Object with converted amount and formatted strings
 */
export const getPayPalPrice = (sarAmount: number): {
  sarAmount: number;
  usdAmount: number;
  sarFormatted: string;
  usdFormatted: string;
} => {
  const usdAmount = sarToUsd(sarAmount);
  
  return {
    sarAmount,
    usdAmount,
    sarFormatted: formatPrice(sarAmount, 'SAR'),
    usdFormatted: formatPrice(usdAmount, 'USD')
  };
};
