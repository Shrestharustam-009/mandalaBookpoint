# PACO (2C2P) Integration Reference

## API Endpoints (from PACO docs)

| Environment | Core Base URL | Payment API (Redirection) |
|-------------|---------------|---------------------------|
| UAT | https://core.demo-paco.2c2p.com | https://payment-api.demo-paco.2c2p.com |
| PRD | https://core.paco.2c2p.com | https://payment-api.paco.2c2p.com |

## Payment Endpoints

| Action | Method | URL |
|--------|--------|-----|
| prePaymentUi (payment page) | POST | {core}/api/2.0/Payment/prePaymentUi |
| nonUi | POST | {core}/api/2.0/Payment/nonUi |
| transactionStatus | GET | {core}/api/2.0/Inquiry/transactionStatus (no JOSE) |
| transactionList | POST | {core}/api/2.0/Inquiry/transactionList |
| void | POST | {core}/api/2.0/void |
| refund | POST | {core}/api/2.0/Refund/refund |
| settlement | PUT | {core}/api/2.0/settlement |

## Required Headers

- `token`: Company identification token (from PACO admin portal)
- `Authorization`: Basic HTTP (username:password)
- `Content-Type`: `application/jose` (encrypted) or `application/json` (unencrypted, UAT only)
- `Accept`: `application/jose` or `application/json`

## JOSE Payload Structure

**Request (what we sign & encrypt):**
```json
{
  "aud": "PacoAudience",
  "iss": "<api_key>",
  "request": { ... actual API payload ... },
  "exp": <unix_timestamp>,
  "iat": <unix_timestamp>,
  "nbf": <unix_timestamp>
}
```

**prePaymentUi payload fields (verify with PACO spec):**
- merchantID, invoiceNo, amount, currencyCode
- uiParams: { userInfo, returnUrl, cancelUrl, paymentNotificationUrl }
- paymentChannel (array, e.g. ["CARD"])
- locale, nonceStr, request3DS

## Key Requirements

- RSA 4096 bits
- Private keys: PKCS#8 format (`-----BEGIN PRIVATE KEY-----`)
- Public keys: X.509 format
- Signing: alg PS256
- Encryption: alg RSA-OAEP, enc A128CBC-HS256

## Troubleshooting 400 Bad Request

1. **Payload structure**: Ensure field names match PACO spec (merchantID vs merchantId, etc.)
2. **JWT claims**: aud must be "PacoAudience", iss must be your API key
3. **Token header**: Must match company token from admin portal
4. **Keys**: Verify PKCS#8 format, correct kid if required
5. **Currency**: UAT may only accept THB; production supports NPR, MMK, etc.
6. **URLs**: returnUrl/cancelUrl must be publicly accessible (no localhost in UAT - use ngrok)
