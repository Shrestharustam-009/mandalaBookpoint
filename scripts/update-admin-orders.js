const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// Helper to inject
const calculateItemPriceCode = `
    const calculateItemPrice = (item) => {
      const price = parseFloat(item.price) || 0;
      const discount = parseFloat(item.discount) || 0;
      if (discount > 0) {
        return price - (price * discount / 100);
      }
      return price;
    };
`;

// Insert the helper at the beginning of OrdersPage
content = content.replace("export default function OrdersPage() {", "export default function OrdersPage() {\n" + calculateItemPriceCode);

// Fix print template
content = content.replace(
  /\$\{\(parseFloat\(item\.price\) \* parseInt\(item\.quantity\)\)\.toFixed\(2\)\}/g,
  "${(calculateItemPrice(item) * parseInt(item.quantity)).toFixed(2)}"
);
// Print template price cell
content = content.replace(
  /\$\{parseFloat\(item\.price\)\.toFixed\(2\)\}/g,
  "${calculateItemPrice(item).toFixed(2)}${item.discount > 0 ? ` <small>(-${item.discount}%)</small>` : ''}"
);

// Fix modal template
content = content.replace(
  /NPR\s*\{\(parseFloat\(item\.price\) \* parseInt\(item\.quantity\)\)\.toFixed\(2\)\}/g,
  "NPR {(calculateItemPrice(item) * parseInt(item.quantity)).toFixed(2)}"
);
content = content.replace(
  /NPR\s*\{parseFloat\(item\.price\)\.toFixed\(2\)\}/g,
  "NPR {calculateItemPrice(item).toFixed(2)}{item.discount > 0 ? ` (-${item.discount}%)` : ''}"
);

fs.writeFileSync(file, content, 'utf8');
console.log('Admin orders page updated');
