const fs = require('fs');
const path = require('path');

const callbackRoute = path.join(__dirname, '../app/api/payment/callback/route.js');
let lines = fs.readFileSync(callbackRoute, 'utf8').split('\n');

const newLines = [];
let insideStock = false;

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  if (lines[i].includes('Stock deducted for order')) {
    newLines.push(`            try {`);
    newLines.push(`              const { sendOrderPaidEmail, sendAdminOrderAlertEmail } = await import('@/lib/email');`);
    newLines.push(`              await sendOrderPaidEmail(order);`);
    newLines.push(`              await sendAdminOrderAlertEmail(order, 'ORDER_PAID');`);
    newLines.push(`              console.log(\`Emails sent for order #\${orderId}\`);`);
    newLines.push(`            } catch (emailErr) {`);
    newLines.push(`              console.error('Failed to send payment emails:', emailErr);`);
    newLines.push(`            }`);
  }
}

fs.writeFileSync(callbackRoute, newLines.join('\n'), 'utf8');
console.log('Updated callback route');
