const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/cart/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add address to customerInfo state
content = content.replace(
  "phone: '',\n      location: '',",
  "phone: '',\n      location: '',\n      address: '',"
);

// 2. Add address validation to isFormValid
content = content.replace(
  "customerInfo.phone.trim() !== '' && \n           customerInfo.location !== '';",
  "customerInfo.phone.trim() !== '' && \n           customerInfo.location !== '' && \n           customerInfo.address.trim() !== '';"
);

// 3. Fix error message for validation
content = content.replace(
  "setError('Please fill in all required fields (Name, Phone, and Location)');",
  "setError('Please fill in all required fields (Name, Phone, Location, and Address)');"
);

// 4. Update the orderData payload
content = content.replace(
  /shippingAddress: customerInfo\.location === 'other' \? 'Other \(Not Listed\)' : customerInfo\.location,/g,
  "shippingAddress: (customerInfo.location === 'other' ? 'Other (Not Listed)' : customerInfo.location) + ' - ' + customerInfo.address.trim(),"
);

content = content.replace(
  /paymentMethod: 'paco',/g,
  "paymentMethod: customerInfo.location === 'other' ? 'Pending Quote' : 'paco',"
);

// 5. Inject the Address input field right after the Location dropdown
const addressFieldHTML = `
                  <div className="form-group" style={{ marginTop: '15px' }}>
                    <label htmlFor="address" className="form-label">
                      Full Delivery Address <span className="required">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      className="form-input"
                      value={customerInfo.address}
                      onChange={handleInputChange}
                      placeholder={customerInfo.location === 'other' ? 'Please include your Country, City, and full street address' : 'Enter your full street address / area'}
                      required
                      style={{ width: '100%', padding: '10px', minHeight: '80px', resize: 'vertical' }}
                    />
                  </div>`;

content = content.replace(
  /<\/select>\s*<\/div>\s*<\/div>\s*<div className="summary-divider">/g,
  `</select>\n                  ${addressFieldHTML}\n                </div>\n              </div>\n\n              <div className="summary-divider">`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Cart page address and payment method updated');
