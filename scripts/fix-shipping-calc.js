const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/cart/page.jsx');
let content = fs.readFileSync(file, 'utf8');

const oldWeightFn = `  const getTotalWeight = () => {
    return cartItems.reduce((sum, item) => {
      const w = item.weight ?? 0;
      return sum + w * item.quantity;
    }, 0);
  };`;

const newWeightFn = `  const getTotalWeight = () => {
    return cartItems.reduce((sum, item) => {
      // If weight is null, undefined, or 0, default to 0.5kg per book
      const w = (item.weight && item.weight > 0) ? item.weight : 0.5;
      return sum + w * item.quantity;
    }, 0);
  };`;

content = content.replace(oldWeightFn, newWeightFn);

const oldCalcShipping = `  const calculateShipping = (location, totalWeight) => {
    let base = 0;

    switch (location) {
      case 'inside':          base = 100;  break;
      case 'outside':         base = 150;  break;
      case 'intl_europe_india': base = 1200; break;
      case 'intl_other':      base = 1500; break;
      case 'intl_canada_fast': base = 4500; break;
      default: return 0;
    }

    // Base rate covers the first 1 kg.
    // For every additional 1 kg above 1 kg, add 10% of the base rate.
    // e.g. 1 kg -> base; 2 kg -> base * 1.10; 3 kg -> base * 1.20; etc.
    const weight = totalWeight > 0 ? totalWeight : 1;
    const extraKg = Math.max(0, weight - 1);          // kg above the first 1 kg
    const multiplier = 1 + 0.10 * extraKg;            // 10% per extra kg
    return Math.round(base * multiplier);
  };`;

const newCalcShipping = `  const calculateShipping = (location, totalWeight) => {
    if (!location || location === 'other') return 0;
    
    // Check if the location exists in our dynamic shipping rates from the DB
    const rateObj = shippingRates.find(r => r.country === location);
    
    if (rateObj) {
      // Billable weight is minimum 1kg, rounded up to the nearest whole kg for pricing
      const billableWeight = Math.max(1, Math.ceil(totalWeight));
      
      if (rateObj.baseRate > 0) {
        // If there's a base rate, it covers the first kg. Add ratePerKg for extra kgs.
        const extraKg = Math.max(0, billableWeight - 1);
        return rateObj.baseRate + (extraKg * rateObj.ratePerKg);
      } else {
        // Simple multiplication: ratePerKg * billableWeight
        return rateObj.ratePerKg * billableWeight;
      }
    }
    
    // Fallback to legacy hardcoded logic if location not found in DB
    let base = 0;
    switch (location) {
      case 'inside':          base = 100;  break;
      case 'outside':         base = 150;  break;
      case 'intl_europe_india': base = 1200; break;
      case 'intl_other':      base = 1500; break;
      case 'intl_canada_fast': base = 4500; break;
      default: return 0;
    }

    const weight = totalWeight > 0 ? totalWeight : 1;
    const extraKg = Math.max(0, weight - 1);
    const multiplier = 1 + 0.10 * extraKg;
    return Math.round(base * multiplier);
  };`;

content = content.replace(oldCalcShipping, newCalcShipping);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed shipping calculation');
