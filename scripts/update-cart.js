const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/cart/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add useState, useEffect for shipping rates
content = content.replace("const [error, setError] = useState('');", 
`const [error, setError] = useState('');
  const [shippingRates, setShippingRates] = useState([]);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    fetch('/api/shipping')
      .then(res => res.json())
      .then(data => {
        setShippingRates(Array.isArray(data) ? data : []);
        setLoadingRates(false);
      })
      .catch(err => {
        console.error('Error fetching shipping rates:', err);
        setLoadingRates(false);
      });
  }, []);`);

content = content.replace("import { useState } from 'react';", "import { useState, useEffect } from 'react';");

// 2. Rewrite calculateShipping
content = content.replace(/const calculateShipping = \(location, totalWeight\) => \{[\s\S]*?return Math\.round\(base \* multiplier\);\n  \};/, 
`const calculateShipping = (location, totalWeight) => {
    if (location === 'other' || !location) return 0;
    
    const rateData = shippingRates.find(r => r.country === location);
    if (!rateData) return 0;

    const weight = totalWeight > 0 ? totalWeight : 0.5;
    const roundedWeight = Math.max(1, Math.ceil(weight)); // Round up to nearest kg
    return roundedWeight * rateData.ratePerKg;
  };`);

// 3. Update handleCheckout logic
content = content.replace(/shippingAddress:[\s\S]*?'International - Other',/, "shippingAddress: customerInfo.location === 'other' ? 'Other (Not Listed)' : customerInfo.location,");

content = content.replace(/const paymentResponse = await api\.payment\.generatePage\(\{[\s\S]*?\}\);[\s\S]*?if \(paymentResponse\.paymentPageUrl\) \{[\s\S]*?window\.location\.href = paymentResponse\.paymentPageUrl;[\s\S]*?\} else \{[\s\S]*?router\.push\(\`\/payment\?orderId=\$\{order\.id\}\`\);[\s\S]*?\}/,
`if (customerInfo.location === 'other') {
        alert('Order placed successfully! Since your country is not listed, our team will contact you via email shortly with a custom shipping quote.');
        clearCart();
        router.push('/');
        return;
      }

      const paymentResponse = await api.payment.generatePage({
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'NPR',
        customerInfo: {
          email: order.customerEmail,
          name: order.customerName,
          phone: order.customerPhone,
        },
        returnUrl: \`\${window.location.origin}/payment/success?orderId=\${order.id}\`,
        cancelUrl: \`\${window.location.origin}/payment/cancel?orderId=\${order.id}\`,
      });

      clearCart();

      if (paymentResponse.paymentPageUrl) {
        window.location.href = paymentResponse.paymentPageUrl;
      } else {
        router.push(\`/payment?orderId=\${order.id}\`);
      }`);

content = content.replace("      // Clear cart after successful order creation\n      clearCart();\n\n      // Redirect to payment page", "      // Clear cart handled above");

// 4. Update the location UI
content = content.replace(/<div className="radio-group">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div className="summary-divider">/,
`<select
                    name="location"
                    className="form-input"
                    value={customerInfo.location}
                    onChange={handleInputChange}
                    required
                    style={{ width: '100%', padding: '10px' }}
                  >
                    <option value="">Select your country</option>
                    {shippingRates.map(rate => (
                      <option key={rate.id} value={rate.country}>
                        {rate.country} (Rs. {rate.ratePerKg}/kg)
                      </option>
                    ))}
                    <option value="other">Other (Not Listed) - Contact for quote</option>
                  </select>
                </div>
              </div>

              <div className="summary-divider">`);

// 5. Update Delivery display
content = content.replace(/<span>Delivery \(\{totalWeight\.toFixed\(2\)\} kg\):<\/span>\s*<span>\{currencyUtils\.formatPrice\(shipping, 'primary'\)\}<\/span>/,
`<span>Delivery ({totalWeight.toFixed(2)} kg):</span>
                <span>
                  {customerInfo.location === 'other' 
                    ? 'TBD (Quote via Email)' 
                    : currencyUtils.formatPrice(shipping, 'primary')}
                </span>`);

fs.writeFileSync(file, content, 'utf8');
console.log('Cart page updated');
