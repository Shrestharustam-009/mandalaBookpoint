const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/cart/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// Update state
content = content.replace("phone: '',", "phone: '',\n      alternatePhone: '',");

// Update orderData payload
content = content.replace("customerPhone: customerInfo.phone.trim(),", "customerPhone: customerInfo.phone.trim(),\n          alternatePhone: customerInfo.alternatePhone ? customerInfo.alternatePhone.trim() : null,");

// Update HTML form
const oldPhoneInput = `<div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>`;

const newPhoneInput = `<div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Mobile No <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your primary mobile number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="alternatePhone" className="form-label">
                    Phone No <span style={{fontSize: '0.85em', color: '#6b7280', fontWeight: 'normal'}}>(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="alternatePhone"
                    name="alternatePhone"
                    className="form-input"
                    value={customerInfo.alternatePhone}
                    onChange={handleInputChange}
                    placeholder="Enter an alternate phone or landline"
                  />
                </div>`;

// Because of exact spacing differences, regex is safer:
content = content.replace(/<div className="form-group">\s*<label htmlFor="phone" className="form-label">\s*Phone <span className="required">\*<\/span>\s*<\/label>\s*<input\s*type="tel"\s*id="phone"\s*name="phone"\s*className="form-input"\s*value=\{customerInfo\.phone\}\s*onChange=\{handleInputChange\}\s*placeholder="Enter your phone number"\s*required\s*\/>\s*<\/div>/, newPhoneInput);

fs.writeFileSync(file, content, 'utf8');
console.log('Cart page updated');
