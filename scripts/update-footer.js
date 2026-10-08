const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/admin/orders/page.jsx');
let content = fs.readFileSync(file, 'utf8');

const newFooter = `<div class="footer">
              Thank you for shopping at Mandala Book Point!<br>
              If you have any questions, please contact <strong>info@mandalabookpoint.com</strong> or <strong>books@mos.com.np</strong>
            </div>`;

content = content.replace(/<div class="footer">[\s\S]*?<\/div>/, newFooter);

fs.writeFileSync(file, content, 'utf8');
console.log('Footer updated!');
