import { NextResponse } from 'next/server';
import paymentService, {
  extractPaymentPageUrl,
  formatPacoRequestDateTime,
  pacoNumericOrderNo,
} from '@/lib/payment-service';
import paymentConfig from '@/config/paymentConfig';

/**
 * Test payment endpoint without database (same shape as mandala/src/api/Payment.php ExecuteFormJose).
 * POST /api/payment/test
 */
export async function POST() {
  try {
    const now = new Date();
    const orderNo = pacoNumericOrderNo();
    const paymentData = {
      apiRequest: {
        requestMessageID: crypto.randomUUID(),
        requestDateTime: formatPacoRequestDateTime(now),
        language: 'en-US',
      },
      officeId: paymentConfig.merchant.merchantId,
      orderNo,
      productDescription: `desc for '${orderNo}'`,
      paymentType: 'CC',
      paymentCategory: 'ECOM',
      storeCardDetails: {
        storeCardFlag: 'N',
        storedCardUniqueID: '{{guid}}',
      },
      installmentPaymentDetails: {
        ippFlag: 'N',
        installmentPeriod: 0,
        interestType: null,
      },
      mcpFlag: 'N',
      request3dsFlag: 'Y',
      transactionAmount: {
        amountText: '000000000100',
        currencyCode: 'NPR',
        decimalPlaces: 2,
        amount: 1,
      },
      notificationURLs: {
        confirmationURL: 'http://localhost:3000/payment/success',
        failedURL: 'http://localhost:3000/payment/failed',
        cancellationURL: 'http://localhost:3000/payment/cancel',
        backendURL: 'http://localhost:3000/api/payment/callback',
      },
      deviceDetails: {
        browserIp: '1.0.0.1',
        browser: 'Postman Browser',
        browserUserAgent: 'PostmanRuntime/7.26.8 - not from header',
        mobileDeviceFlag: 'N',
      },
      purchaseItems: [
        {
          purchaseItemType: 'ticket',
          referenceNo: '2322460376026',
          purchaseItemDescription: 'Bundled insurance',
          purchaseItemPrice: {
            amountText: '000000000100',
            currencyCode: 'NPR',
            decimalPlaces: 2,
            amount: 1,
          },
          subMerchantID: 'string',
          passengerSeqNo: 1,
        },
      ],
      customFieldList: [
        { fieldName: 'TestField', fieldValue: 'This is test' },
        { fieldName: 'orderId', fieldValue: '1' },
      ],
    };

    const paymentPageResponse = await paymentService.generatePaymentPage(paymentData);

    return NextResponse.json({
      success: true,
      paymentPageUrl: extractPaymentPageUrl(paymentPageResponse),
      transactionId:
        paymentPageResponse?.response?.Data?.transactionId ??
        paymentPageResponse?.response?.Data?.transactionID,
      raw: paymentPageResponse,
    });
  } catch (error) {
    console.error('Payment test error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to test payment' },
      { status: 500 }
    );
  }
}
