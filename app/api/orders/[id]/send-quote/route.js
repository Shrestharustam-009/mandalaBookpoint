import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';
import { requireAdmin } from '@/lib/auth';
import { sendOrderQuoteEmail } from '@/lib/email';
import { execute } from '@/lib/database';

export async function POST(request, { params }) {
  try {
    const user = await requireAdmin(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { shippingCost } = body;

    if (shippingCost == null || isNaN(shippingCost) || shippingCost < 0) {
      return NextResponse.json({ error: 'Invalid shipping cost' }, { status: 400 });
    }

    // Fetch the order
    const order = await dbService.orders.getById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow updating orders that are pending and pending quote (or similar)
    // but just let the admin do it anyway for flexibility.

    // Update the database (Set shipping_cost, change status if needed)
    // We update shipping_cost and add it to total_amount so that Paco charges the correct final amount
    await execute(
      'UPDATE orders SET shipping_cost = ?, total_amount = total_amount + ?, payment_method = "paco", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [shippingCost, shippingCost, id]
    );

    // Fetch the updated order
    const updatedOrder = await dbService.orders.getById(id);

    // Send the email
    const emailSent = await sendOrderQuoteEmail(order, shippingCost);

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      emailSent
    }, { status: 200 });

  } catch (error) {
    console.error('Error in send-quote API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
