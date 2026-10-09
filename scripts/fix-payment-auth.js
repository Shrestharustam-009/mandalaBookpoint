const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/payment/page.jsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace("if (!order || !user) {", "if (!order) {");
content = content.replace("setError('Order or user information is missing');", "setError('Order information is missing');");

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed payment auth requirement');
