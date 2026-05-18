import { NextResponse } from 'next/server';
import paymentService, {
  extractPaymentPageUrl,
  formatPacoRequestDateTime,
  pacoNumericOrderNo,
} from '@/lib/payment-service';
import { dbService } from '@/lib/db-service';
import paymentConfig from '@/config/paymentConfig';
import siteConfig from '@/config/siteConfig';

/**
 * Generate payment page URL
 * POST /api/payment/generate-page
 */
export async function POST(request) {
  console.log('=== PAYMENT GENERATION START ===');
  try {
    const body = await request.json();
    const { orderId, customerInfo, returnUrl, cancelUrl } = body;

    // Validate required fields
    if (!orderId || !customerInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, customerInfo' },
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

    // Use PACO_PUBLIC_BASE_URL for ngrok/tunnel when testing locally
    const isUat = (process.env.PACO_ENV || 'uat').toLowerCase() === 'uat';
    const baseUrl = process.env.PACO_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Use NPR as default strictly enforced currency (prevent payload spoofing)
    const currencyCode = 'NPR';
    
    // Securely pull amount from database only
    const amountValue = parseFloat(order.totalAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: 'Invalid database order amount.' },
        { status: 500 }
      );
    }
    
    // Warn about localhost in UAT
    if (isUat && baseUrl.includes('localhost')) {
      console.warn('⚠️ PACO UAT may reject localhost URLs. Set PACO_PUBLIC_BASE_URL to a public URL (e.g. ngrok) for local testing.');
    }
    
    const majorAmount = (n) => Number(Number(n).toFixed(2));

    // Safe conversion to minor units (paisa/cents) to avoid IEEE 754 float precision errors
    const toMinorUnits = (val) => Math.round(Number(Number(val).toFixed(2)) * 100);

    // Generate unique PACO order number
    const now = new Date();
    const orderNo = pacoNumericOrderNo();
    const minorUnits = toMinorUnits(amountValue);
    const amountText = String(minorUnits).padStart(12, '0');

    const productDescription = `Mandala Book Order ${orderId}`;
    const lineFromOrder = (item) => {
      const qty = parseInt(item.quantity, 10) || 1;
      // PACO amountText per line should be (Unit Price * Quantity) or just unit price depending on PACO's interpretation.
      // Usually, purchaseItemPrice is the total for that line if quantity is not explicitly passed.
      const lineTotalMinor = toMinorUnits(Number(item.price) * qty);
      return {
        purchaseItemType: 'ticket',
        referenceNo: item.bookId.toString(),
        purchaseItemDescription: `${item.title} (x${qty})`,
        purchaseItemPrice: {
          amountText: String(lineTotalMinor).padStart(12, '0'),
          currencyCode: currencyCode,
          decimalPlaces: 2,
          amount: majorAmount(Number(item.price) * qty)
        },
        subMerchantID: 'string',
        passengerSeqNo: 1
      };
    };

    let purchaseItems =
      Array.isArray(order.orderItems) && order.orderItems.length > 0
        ? order.orderItems.map(lineFromOrder)
        : [];

    const sumLineMinor = (items) =>
      items.reduce((acc, li) => acc + Number(li.purchaseItemPrice.amountText), 0);

    // PACO expects line totals to match the transaction amount
    if (purchaseItems.length === 0 || sumLineMinor(purchaseItems) !== minorUnits) {
      purchaseItems = [
        {
          purchaseItemType: 'ticket',
          referenceNo: String(orderId),
          purchaseItemDescription: productDescription,
          purchaseItemPrice: {
            amountText,
            currencyCode: currencyCode,
            decimalPlaces: 2,
            amount: majorAmount(amountValue)
          },
          subMerchantID: 'string',
          passengerSeqNo: 1
        }
      ];
    }

    const paymentData = {
      apiRequest: {
        requestMessageID: crypto.randomUUID(),
        requestDateTime: formatPacoRequestDateTime(now),
        language: 'en-US'
      },
      officeId: paymentConfig.merchant.merchantId,
      orderNo: orderNo,
      productDescription: `desc for '${orderNo}'`,
      paymentType: 'CC',
      paymentCategory: 'ECOM',
      storeCardDetails: {
        storeCardFlag: 'N',
        storedCardUniqueID: '{{guid}}'
      },
      installmentPaymentDetails: {
        ippFlag: 'N',
        installmentPeriod: 0,
        interestType: null
      },
      mcpFlag: 'N',
      request3dsFlag: 'Y',
      transactionAmount: {
        amountText,
        currencyCode: currencyCode,
        decimalPlaces: 2,
        amount: majorAmount(amountValue)
      },
      notificationURLs: {
        confirmationURL: returnUrl || `${baseUrl}/payment/success?orderId=${orderId}`,
        failedURL: `${baseUrl}/payment/failed?orderId=${orderId}`,
        cancellationURL: cancelUrl || `${baseUrl}/payment/cancel?orderId=${orderId}`,
        backendURL: `${baseUrl}/api/payment/callback`
      },
      deviceDetails: {
        browserIp: '1.0.0.1',
        browser: 'Postman Browser',
        browserUserAgent: 'PostmanRuntime/7.26.8 - not from header',
        mobileDeviceFlag: 'N'
      },
      purchaseItems,
      customFieldList: [
        { fieldName: 'TestField', fieldValue: 'This is test' },
        { fieldName: 'orderId', fieldValue: String(orderId) }
      ]
    };

    console.log('Sending payment data to PACO:', JSON.stringify(paymentData, null, 2));

    // Generate payment page
    const paymentPageResponse = await paymentService.generatePaymentPage(paymentData);
    console.log('PACO Response:', paymentPageResponse);

    // Extract payment page URL and transaction ID from response
    const paymentPageUrl = extractPaymentPageUrl(paymentPageResponse);
    const tx = paymentPageResponse?.response?.Data ?? paymentPageResponse?.Response?.Data;
    const transactionId =
      tx?.transactionId ??
      tx?.transactionID ??
      paymentPageResponse?.transactionID ??
      paymentPageResponse?.transactionId;

    // Save payment transaction record to database
    try {
      await dbService.paymentTransactions.create({
        orderId: order.id,
        pacoOrderNo: orderNo,
        transactionId: transactionId || null,
        amount: amountValue,
        currency: currencyCode,
        status: 'initiated',
        paymentPageUrl: paymentPageUrl || null,
        pacoResponse: paymentPageResponse,
      });

      // Update order with PACO order number
      await dbService.orders.update(order.id, {
        pacoOrderNo: orderNo,
        transactionId: transactionId || undefined,
      });
    } catch (dbError) {
      // Log but don't fail the payment — the redirect URL is already generated
      console.error('Failed to save payment transaction record:', dbError);
    }

    return NextResponse.json({
      success: true,
      paymentPageUrl,
      transactionId,
      orderId,
      pacoOrderNo: orderNo,
    });
  } catch (error) {
    console.error('Payment page generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate payment page' },
      { status: 500 }
    );
  }
}