const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

// The goal is to move `const fetchOrders = async () => { ... };` out of `useEffect`
// Or simpler: change the try/catch in handleSendQuote so it doesn't crash on fetchOrders().
// Actually, why not just change `fetchOrders(); // Refresh table` to something else?
// Wait, we need it to refresh.

content = content.replace(/useEffect\(\(\) => \{\s*const fetchOrders = async \(\) => \{([\s\S]*?)\};\s*fetchOrders\(\);\s*\}, \[\]\);/, 
  \`const fetchOrders = async () => {$1};
  
  useEffect(() => {
    fetchOrders();
  }, []);\`);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed fetchOrders with regex capture');
