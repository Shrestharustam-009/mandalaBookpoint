import { NextResponse } from 'next/server';
import paymentService from '@/lib/payment-service';
import { dbService } from '@/lib/db-service';
import { execute } from '@/lib/database';

/**
 * Handle payment callback from PACO
 * POST /api/payment/callback
 * 
 * PACO sends JOSE-encrypted payloads (JWE) to the backendURL.
 * In UAT with unencrypted mode, it may send plain JSON.
 */
export async function POST(request) {
  console.log('=== PAYMENT CALLBACK RECEIVED ===');
  try {
    // Read the raw body — PACO may send JOSE (compact JWE) or JSON
    const rawBody = await request.text();
    console.log('Callback raw body length:', rawBody?.length);
    console.log('Callback content-type:', request.headers.get('content-type'));

    let callbackData;
    try {
      // Try to decrypt JOSE payload first, falls back to JSON parsing
      callbackData = await paymentService.decryptCallbackPayload(rawBody);
      console.log('Callback payload decoded:', JSON.stringify(callbackData, null, 2));
    } catch (decryptError) {
      console.error('Failed to decrypt callback:', decryptError);
      // Last resort: try JSON parse
      try {
        callbackData = JSON.parse(rawBody);
      } catch {
        return NextResponse.json(
          { error: 'Unable to parse callback payload' },
          { status: 400 }
        );
      }
    }

    // Extract data from callback — PACO response structure varies
    const responseData = callbackData?.response || callbackData?.Response || callbackData;
    const data = responseData?.Data || responseData?.data || responseData;
    
    const orderNo = data?.orderNo || data?.OrderNo;
    const transactionId = data?.transactionId || data?.transactionID || data?.TransactionId;
    const paymentStatus = data?.status || data?.Status || data?.respCode;
    
    // Extract orderId from customFieldList if present
    let orderId = null;
    const customFields = data?.customFieldList || data?.CustomFieldList || [];
    for (const field of customFields) {
      if (field?.fieldName === 'orderId' || field?.FieldName === 'orderId') {
        orderId = parseInt(field?.fieldValue || field?.FieldValue, 10);
        break;
      }
    }

    console.log('Callback extracted:', { orderNo, transactionId, paymentStatus, orderId });

    if (!orderNo && !transactionId && !orderId) {
      console.error('Callback missing identifiers:', callbackData);
      return NextResponse.json(
        { error: 'Missing orderNo, transactionId, or orderId in callback' },
        { status: 400 }
      );
    }

    // Determine order status from PACO payment status
    let orderStatus = 'pending';
    const normalizedStatus = String(paymentStatus || '').toUpperCase();
    if (['000', 'SUCCESS', 'COMPLETED', 'APPROVED', '00'].includes(normalizedStatus)) {
      orderStatus = 'paid';
    } else if (['FAILED', 'DECLINED', 'ERROR', 'REJECTED'].includes(normalizedStatus)) {
      orderStatus = 'failed';
    } else if (['CANCELLED', 'CANCEL', 'VOIDED'].includes(normalizedStatus)) {
      orderStatus = 'cancelled';
    }

    // Update payment transaction record
    if (orderNo) {
      try {
        const ptx = await dbService.paymentTransactions.getByPacoOrderNo(orderNo);
        if (ptx) {
          await dbService.paymentTransactions.updateByPacoOrderNo(orderNo, {
            status: orderStatus,
            transactionId: transactionId || undefined,
            callbackData: callbackData,
          });
          // Use orderId from transaction record if not in callback
          if (!orderId) {
            orderId = ptx.orderId;
          }
        }
      } catch (txErr) {
        console.error('Failed to update payment transaction:', txErr);
      }
    }

    // Update order status
    if (orderId) {
      try {
        const order = await dbService.orders.getById(orderId);
        if (order) {
          // Only update if the order isn't already in a final state
          if (order.status !== 'paid' && order.status !== 'shipped' && order.status !== 'delivered') {
            
            // SECURITY CHECK: Verify callback amount matches order total
            const callbackAmount = parseFloat(data?.amount || data?.Amount || data?.transactionAmount || 0);
            const dbAmount = parseFloat(order.totalAmount);
            
            if (orderStatus === 'paid' && Math.abs(callbackAmount - dbAmount) > 0.01) {
              console.error(`🚨 SECURITY ALERT: Amount mismatch for Order #${orderId}. Callback: ${callbackAmount}, DB: ${dbAmount}`);
              return NextResponse.json(
                { error: 'Transaction amount mismatch. Possible tampering.' },
                { status: 400 }
              );
            }

            await dbService.orders.update(orderId, {
              status: orderStatus,
              transactionId: transactionId || undefined,
            });
            console.log(`✅ Order #${orderId} updated to status: ${orderStatus}`);

            // Deduct stock if payment was successful
            if (orderStatus === 'paid' && Array.isArray(order.orderItems)) {
              for (const item of order.orderItems) {
                const qty = parseInt(item.quantity, 10) || 1;
                await execute('UPDATE books SET stock = COALESCE(stock, 0) - ? WHERE id = ?', [qty, item.bookId]);
              }
              console.log(`✅ Stock deducted for order #${orderId}`);
            }
          } else {
            console.log(`ℹ️ Order #${orderId} already in final state: ${order.status}, skipping update`);
          }
        } else {
          console.warn(`⚠️ Order #${orderId} not found in database`);
        }
      } catch (orderErr) {
        console.error('Failed to update order:', orderErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Callback processed successfully',
      orderStatus,
    });
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process callback' },
      { status: 500 }
    );
  }
}
