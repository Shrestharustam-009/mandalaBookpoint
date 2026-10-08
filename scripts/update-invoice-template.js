const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Replace the Bill To / Shipping Address section
const oldAddressSection = `            <div class="invoice-details">
              <div>
                <div class="section-title">Bill To:</div>
                <div><strong>Name:</strong> \${order.customerName}</div>
                <div><strong>Email:</strong> \${order.customerEmail}</div>
                <div><strong>Phone:</strong> \${order.customerPhone || 'N/A'}</div>
              </div>
              <div style="text-align: right;">
                <div class="section-title">Shipping Address:</div>
                <div style="white-space: pre-line; max-width: 300px; font-style: italic;">\${order.shippingAddress}</div>
              </div>
            </div>`;

const newAddressSection = `            <div class="invoice-details" style="display: block; margin-bottom: 30px;">
              <div style="font-size: 15px; margin-bottom: 8px;"><strong>Name:-</strong> \${order.customerName}</div>
              <div style="font-size: 15px; margin-bottom: 8px;"><strong>Delivery Address:-</strong> \${order.shippingAddress}</div>
              <div style="font-size: 15px; margin-bottom: 8px;"><strong>Mobile:-</strong> \${order.customerPhone || 'N/A'}</div>
              <div style="font-size: 15px; margin-bottom: 8px;"><strong>Phone:-</strong> \${order.customerPhone || 'N/A'}</div>
            </div>`;

content = content.replace(oldAddressSection, newAddressSection);

// 2. Replace the footer email
const oldFooter = `<div class="footer">
              Thank you for shopping at Mandala Book Point!<br>
              If you have any questions, please contact support@mandalabookpoint.com
            </div>`;

const newFooter = `<div class="footer">
              Thank you for shopping at Mandala Book Point!<br>
              If you have any questions, please contact <strong>info@mandalabookpoint.com</strong> or <strong>books@mos.com.np</strong>
            </div>`;

content = content.replace(oldFooter, newFooter);

fs.writeFileSync(file, content, 'utf8');
console.log('Invoice template updated successfully!');
