const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../app/api/payment/callback/route.js');
let content = fs.readFileSync(file, 'utf8');

const target = "console.log(`o. Order #${orderId} updated to status: ${orderStatus}`);";
const replacement = `console.log(\`✅ Order #\${orderId} updated to status: \${orderStatus}\`);
            
            // Send invoice email if paid
            if (orderStatus === 'paid') {
              try {
                const { sendOrderPaidEmail } = await import('@/lib/email');
                await sendOrderPaidEmail(order);
                console.log(\`📧 Invoice email sent for order #\${orderId}\`);
              } catch (emailErr) {
                console.error('Failed to send invoice email:', emailErr);
              }
            }`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log('Payment callback updated');
