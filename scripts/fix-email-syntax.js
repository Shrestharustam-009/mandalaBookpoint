const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../lib/email.js');
let content = fs.readFileSync(file, 'utf8');

// The file has literal backslashes before backticks and dollar signs. 
// E.g., \`  and \${
content = content.replace(/\\`/g, '`');
content = content.replace(/\\\${/g, '${');

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed syntax errors in email.js');
