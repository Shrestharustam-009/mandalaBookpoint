const fs = require('fs');
const path = require('path');

const ordersRoute = path.join(__dirname, '../app/api/orders/route.js');
let ordersContent = fs.readFileSync(ordersRoute, 'utf8');

const newPostMethod = `export async function POST(request) {
  try {
    const orderData = await request.json();
    const newOrder = await dbService.orders.create(orderData);
    
    // Send customer email for pending quotes
    if (newOrder.paymentMethod === 'Pending Quote' || orderData.customerInfo?.location === 'other') {
      const { sendOrderReceivedEmail } = await import('@/lib/email');
      await sendOrderReceivedEmail(newOrder);
    }
    
    // Send Admin Alert for every new order
    const { sendAdminOrderAlertEmail } = await import('@/lib/email');
    await sendAdminOrderAlertEmail(newOrder, 'NEW_ORDER');

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`;

ordersContent = ordersContent.replace(/export async function POST\(request\) \{[\s\S]*?^\}$/m, newPostMethod);
fs.writeFileSync(ordersRoute, ordersContent, 'utf8');
console.log('Updated orders route');
