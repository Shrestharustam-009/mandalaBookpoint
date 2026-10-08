const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// The regex matches everything from <div class="invoice-details"> down to its closing </div> which is 2 divs down
const newAddressSection = `<div class="invoice-details" style="display: block; margin-bottom: 30px;">
              <div style="font-size: 15px; margin-bottom: 8px;"><strong>Name:-</strong> \${order.customerName}</div>
              <div style="font-size: 15px; margin-bottom: 8px;"><strong>Delivery Address:-</strong> \${order.shippingAddress}</div>
              <div style="font-size: 15px; margin-bottom: 8px;"><strong>Mobile:-</strong> \${order.customerPhone || 'N/A'}</div>
              <div style="font-size: 15px; margin-bottom: 8px;"><strong>Phone:-</strong> \${order.customerPhone || 'N/A'}</div>
            </div>`;

content = content.replace(/<div class="invoice-details">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newAddressSection);

fs.writeFileSync(file, content, 'utf8');
console.log('Regex update complete!');
