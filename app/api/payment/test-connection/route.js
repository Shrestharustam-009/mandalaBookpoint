// Test PACO API connection (same shape as mandala/src/api/Payment.php ExecuteFormJose)
import { NextResponse } from 'next/server';
import paymentService, {
  extractPaymentPageUrl,
  formatPacoRequestDateTime,
  pacoNumericOrderNo,
} from '@/lib/payment-service';
import paymentConfig from '@/config/paymentConfig';

export async function POST() {
  try {
    const now = new Date();
    const orderNo = pacoNumericOrderNo();
    const testData = {
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
        confirmationURL: 'http://localhost:3000/test/success',
        failedURL: 'http://localhost:3000/test/failed',
        cancellationURL: 'http://localhost:3000/test/cancel',
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
        { fieldName: 'testType', fieldValue: 'connection' },
      ],
    };

    const response = await paymentService.generatePaymentPage(testData);

    return NextResponse.json({
      success: true,
      message: 'PACO API connection test completed',
      paymentPageUrl: extractPaymentPageUrl(response),
      response,
    });
  } catch (error) {
    console.error('PACO API test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
