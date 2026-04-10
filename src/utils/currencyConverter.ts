// Universal Currency Converter Utility
// Base currency: RWF (Rwandan Franc)

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

// Exchange rates relative to 1 RWF
// Updated: 2026-01-14
const EXCHANGE_RATES: Record<string, number> = {
  RWF: 1, // Rwandan Franc (base)
  USD: 0.00073, // US Dollar
  GBP: 0.00058, // British Pound
  EUR: 0.00067, // Euro
  JPY: 0.11, // Japanese Yen
};

export const CURRENCIES: Currency[] = [
  { code: 'RWF', name: 'Rwanda', symbol: 'FRW', flag: '🇷🇼' },
  { code: 'USD', name: 'United States', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'United Kingdom', symbol: '£', flag: '🇬🇧' },
  { code: 'EUR', name: 'European Union', symbol: '€', flag: '🇪🇺' },
  { code: 'JPY', name: 'Japan', symbol: '¥', flag: '🇯🇵' },
];

/**
 * Convert price from RWF to target currency
 * @param priceInRWF - Price in Rwandan Francs
 * @param targetCurrency - Target currency code (USD, GBP, EUR, JPY, RWF)
 * @returns Converted price
 */
export const convertPrice = (priceInRWF: number, targetCurrency: string): number => {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return priceInRWF * rate;
};

/**
 * Format price with proper currency symbol and locale
 * @param priceInRWF - Price in Rwandan Francs
 * @param targetCurrency - Target currency code
 * @returns Formatted price string with currency symbol
 */
export const formatPrice = (priceInRWF: number, targetCurrency: string): string => {
  const convertedPrice = convertPrice(priceInRWF, targetCurrency);
  const currency = CURRENCIES.find((c) => c.code === targetCurrency);

  if (!currency) {
    return `${priceInRWF.toLocaleString()} FRW`;
  }

  // Format based on currency type
  switch (targetCurrency) {
    case 'RWF':
      return `${Math.round(convertedPrice).toLocaleString()} ${currency.symbol}`;

    case 'JPY':
      // Japanese Yen has no decimal places
      return `${currency.symbol}${Math.round(convertedPrice).toLocaleString()}`;

    case 'USD':
    case 'GBP':
    case 'EUR':
      // Western currencies use 2 decimal places
      return `${currency.symbol}${convertedPrice.toFixed(2)}`;

    default:
      return `${currency.symbol}${convertedPrice.toLocaleString()}`;
  }
};

/**
 * Get currency object by code
 * @param code - Currency code
 * @returns Currency object or default RWF
 */
export const getCurrencyByCode = (code: string): Currency => {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
};

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  // If same currency, no conversion needed
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Get exchange rates for both currencies
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];

  // If either currency is not supported, return original amount
  if (!fromRate || !toRate) {
    console.warn(`Currency conversion not supported: ${fromCurrency} to ${toCurrency}`);
    return amount;
  }

  // Convert to RWF first (base currency), then to target currency
  const amountInRWF = amount / fromRate;
  const convertedAmount = amountInRWF * toRate;

  return convertedAmount;
};
