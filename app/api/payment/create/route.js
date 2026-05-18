import { NextResponse } from 'next/server';
import paymentService, {
  formatPacoRequestDateTime,
  pacoNumericOrderNo,
} from '@/lib/payment-service';
import { dbService } from '@/lib/db-service';
import paymentConfig from '@/config/paymentConfig';

/**
 * Create payment request (non-UI flow)
 * POST /api/payment/create
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, amount, currency, customerInfo, returnUrl, cancelUrl } = body;

    // Validate required fields
    if (!orderId || !amount || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerInfo' },
        { status: 400 }
      );
    }

    // Get order from database
    const order = await dbService.orders.getById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.PACO_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const currencyCode = (currency && String(currency).trim()) || 'NPR';
    const amountValue = parseFloat(amount);
    const orderNo = pacoNumericOrderNo();
    const minorUnits = Math.round(amountValue * 100);
    const amountText = String(minorUnits).padStart(12, '0');
    const majorAmount = (n) => Number(Number(n).toFixed(2));

    // Prepare non-UI payment data
    const paymentData = {
      apiRequest: {
        requestMessageID: crypto.randomUUID(),
        requestDateTime: formatPacoRequestDateTime(),
        language: 'en-US',
      },
      officeId: paymentConfig.merchant.merchantId,
      orderNo,
      productDescription: `Mandala Book Order ${orderId}`,
      paymentType: 'CC',
      paymentCategory: 'ECOM',
      request3dsFlag: 'Y',
      transactionAmount: {
        amountText,
        currencyCode,
        decimalPlaces: 2,
        amount: majorAmount(amountValue),
      },
      notificationURLs: {
        confirmationURL: returnUrl || `${baseUrl}/payment/success?orderId=${orderId}`,
        failedURL: `${baseUrl}/payment/failed?orderId=${orderId}`,
        cancellationURL: cancelUrl || `${baseUrl}/payment/cancel?orderId=${orderId}`,
        backendURL: `${baseUrl}/api/payment/callback`,
      },
      customFieldList: [
        { fieldName: 'orderId', fieldValue: String(orderId) },
      ],
    };

    // Create payment via PACO nonUi endpoint
    const paymentResponse = await paymentService.createPayment(paymentData);

    // Save payment transaction record
    try {
      await dbService.paymentTransactions.create({
        orderId: order.id,
        pacoOrderNo: orderNo,
        transactionId: paymentResponse?.transactionId || null,
        amount: amountValue,
        currency: currencyCode,
        status: 'initiated',
        pacoResponse: paymentResponse,
      });

      await dbService.orders.update(orderId, {
        paymentMethod: 'paco',
        pacoOrderNo: orderNo,
      });
    } catch (dbError) {
      console.error('Failed to save payment transaction:', dbError);
    }

    return NextResponse.json({
      success: true,
      payment: paymentResponse,
      orderId,
      pacoOrderNo: orderNo,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}
