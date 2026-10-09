const fs = require('fs');
const path = require('path');

const spinnerHTML = `(
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg className="animate-spin" style={{ width: '18px', height: '18px', color: 'white' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              )`;

// Cart Page
const cartFile = path.join(__dirname, '../app/cart/page.jsx');
let cartContent = fs.readFileSync(cartFile, 'utf8');
cartContent = cartContent.replace(
  "{processing ? 'Processing...' : 'Proceed to Checkout'}",
  `{processing ? ${spinnerHTML} : 'Proceed to Checkout'}`
);
fs.writeFileSync(cartFile, cartContent, 'utf8');

// Payment Page
const paymentFile = path.join(__dirname, '../app/payment/page.jsx');
let paymentContent = fs.readFileSync(paymentFile, 'utf8');
paymentContent = paymentContent.replace(
  "{processing ? 'Processing...' : 'Proceed to Payment'}",
  `{processing ? ${spinnerHTML} : 'Proceed to Payment'}`
);
fs.writeFileSync(paymentFile, paymentContent, 'utf8');

console.log('Added spinners to both pages');
