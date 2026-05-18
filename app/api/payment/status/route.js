import { NextResponse } from 'next/server';
import paymentService from '@/lib/payment-service';
import { dbService } from '@/lib/db-service';

/**
 * Check payment transaction status
 * GET /api/payment/status?transactionId=xxx&orderId=xxx
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    const orderId = searchParams.get('orderId');

    if (!transactionId && !orderId) {
      return NextResponse.json(
        { error: 'Either transactionId or orderId is required' },
        { status: 400 }
      );
    }

    // If we have an orderId, look up the PACO order number from our records
    let pacoOrderNo = null;
    let localOrderId = orderId ? parseInt(orderId, 10) : null;

    if (localOrderId) {
      const txRecords = await dbService.paymentTransactions.getByOrderId(localOrderId);
      if (txRecords.length > 0) {
        pacoOrderNo = txRecords[0].pacoOrderNo;
      }
    }

    // Query PACO for the latest transaction status
    const status = await paymentService.getTransactionStatus(transactionId, pacoOrderNo);

    // Update local records if we got a definitive status
    if (localOrderId && status.status) {
      const normalizedStatus = String(status.status).toUpperCase();
      let orderStatus = null;

      if (['000', 'SUCCESS', 'COMPLETED', 'APPROVED'].includes(normalizedStatus)) {
        orderStatus = 'paid';
      } else if (['FAILED', 'DECLINED', 'ERROR'].includes(normalizedStatus)) {
        orderStatus = 'failed';
      } else if (['CANCELLED', 'CANCEL'].includes(normalizedStatus)) {
        orderStatus = 'cancelled';
      }

      if (orderStatus) {
        try {
          const order = await dbService.orders.getById(localOrderId);
          if (order && order.status !== 'paid' && order.status !== 'shipped' && order.status !== 'delivered') {
            await dbService.orders.update(localOrderId, {
              status: orderStatus,
              transactionId: status.transactionId || undefined,
            });
            console.log(`✅ Status Polling: Order #${localOrderId} updated to status: ${orderStatus}`);

            // Deduct stock if payment was successful and we just transitioned to paid
            if (orderStatus === 'paid' && Array.isArray(order.orderItems)) {
              const { execute } = require('@/lib/database');
              for (const item of order.orderItems) {
                const qty = parseInt(item.quantity, 10) || 1;
                await execute('UPDATE books SET stock = COALESCE(stock, 0) - ? WHERE id = ?', [qty, item.bookId]);
              }
              console.log(`✅ Status Polling: Stock deducted for order #${localOrderId}`);
            }
          }
        } catch (updateErr) {
          console.error('Failed to update order status during polling:', updateErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: status.status,
      transactionId: status.transactionId,
      orderNo: status.orderNo,
      amount: status.amount,
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
