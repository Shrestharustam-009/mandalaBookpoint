const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

const oldFetch = `      try {
        const res = await fetch(\`/api/orders/\${selectedOrder.id}/send-quote\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shippingCost: parseFloat(customShipping) })
        });`;

const newFetch = `      try {
        const res = await fetch(\`/api/orders/\${selectedOrder.id}/send-quote\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ shippingCost: parseFloat(customShipping) })
        });`;

content = content.replace(oldFetch, newFetch);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed fetch credentials');
