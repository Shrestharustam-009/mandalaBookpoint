const fs = require('fs');
const path = require('path');

const callbackRoute = path.join(__dirname, '../app/api/payment/callback/route.js');
let callbackContent = fs.readFileSync(callbackRoute, 'utf8');

const oldStockDeduct = `            // Deduct stock if payment was successful
            if (orderStatus === 'paid' && Array.isArray(order.orderItems)) {
              for (const item of order.orderItems) {
                const qty = parseInt(item.quantity, 10) || 1;
                await execute('UPDATE books SET stock = COALESCE(stock, 0) - ? WHERE id = ?', [qty, item.bookId]);
              }
              console.log(\`✅ Stock deducted for order #\${orderId}\`);
            }`;

const newLogic = `            // Deduct stock if payment was successful
            if (orderStatus === 'paid') {
              if (Array.isArray(order.orderItems)) {
                for (const item of order.orderItems) {
                  const qty = parseInt(item.quantity, 10) || 1;
                  await execute('UPDATE books SET stock = COALESCE(stock, 0) - ? WHERE id = ?', [qty, item.bookId]);
                }
                console.log(\`✅ Stock deducted for order #\${orderId}\`);
              }
              
              try {
                const { sendOrderPaidEmail, sendAdminOrderAlertEmail } = await import('@/lib/email');
                await sendOrderPaidEmail(order);
                await sendAdminOrderAlertEmail(order, 'ORDER_PAID');
                console.log(\`✅ Emails sent for order #\${orderId}\`);
              } catch (emailErr) {
                console.error('Failed to send payment emails:', emailErr);
              }
            }`;

callbackContent = callbackContent.replace(oldStockDeduct, newLogic);
fs.writeFileSync(callbackRoute, callbackContent, 'utf8');
console.log('Updated callback route');
