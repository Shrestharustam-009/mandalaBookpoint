import siteConfig from '@/config/siteConfig.js';

/**
 * Currency conversion utilities
 */
export const currencyUtils = {
  convertToSecondary: (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return Math.round((numAmount / siteConfig.exchangeRate) * 100) / 100;
  },

  convertToPrimary: (amount) => {
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return Math.round(numAmount * siteConfig.exchangeRate * 100) / 100;
  },

  formatPrice: (amount, currency = 'primary') => {
    // Ensure amount is a number
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    
    const symbol = currency === 'primary' 
      ? siteConfig.primaryCurrencySymbol 
      : siteConfig.secondaryCurrencySymbol;
    const currencyCode = currency === 'primary' 
      ? siteConfig.primaryCurrency 
      : siteConfig.secondaryCurrency;

    return `${symbol} ${numAmount.toFixed(2)} ${currencyCode}`;
  },

  formatPriceDual: (amount) => {
    // Ensure amount is a number
    const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    const secondary = currencyUtils.convertToSecondary(numAmount);
    return {
      primary: currencyUtils.formatPrice(numAmount, 'primary'),
      secondary: currencyUtils.formatPrice(secondary, 'secondary'),
      primaryAmount: numAmount,
      secondaryAmount: secondary,
    };
  },
};

/**
 * Discount calculation utilities
 */
export const discountUtils = {
  calculateBulkDiscount: (quantity) => {
    let discount = 0;
    for (const rule of siteConfig.bulkDiscounts) {
      if (quantity >= rule.quantity) {
        discount = rule.discountPercent;
      }
    }
    return discount;
  },

  applyDiscount: (price, discountPercent) => {
    return Math.round((price * (100 - discountPercent)) / 100 * 100) / 100;
  },

  applyMultipleDiscounts: (price, discounts = []) => {
    let finalPrice = price;
    for (const discount of discounts) {
      finalPrice = discountUtils.applyDiscount(finalPrice, discount);
    }
    return finalPrice;
  },
};

/**
 * Get site configuration
 */
export const getConfig = () => siteConfig;

/**
 * Update specific config value (useful for theme changes)
 */
export const updateConfig = (key, value) => {
  siteConfig[key] = value;
};
