# PACO (2C2P) Payment Integration Setup Guide

This guide explains how to set up and configure the PACO payment gateway integration.

## Prerequisites

1. **PACO Account**: You need a PACO (2C2P) merchant account
2. **API Credentials**: Obtain from PACO admin portal:
   - Username and Password (for Basic HTTP Auth)
   - Token (Company identification token) - Required in `token` header for all requests
   - API Key (for JWT issuer) - Used as `iss` claim in requests
   - **Two Key Pairs** (for JOSE encryption):
     - **Signing Key Pair**: Private key for signing requests, Public key for PACO to verify
     - **Encryption Key Pair**: Private key for decrypting responses, Public key for PACO to encrypt responses
   - **Two Public Keys from PACO**:
     - **PACO Encryption Public Key**: For encrypting requests to PACO
     - **PACO Signing Public Key**: For verifying PACO's response signatures
   - Key ID (kid)
   - Merchant ID

### Key Pair Requirements

**RSA Key Specifications:**
- Key size: **4096 bits** (mandatory)
- Private key format: **PKCS#8**
- Public key format: **X.509**

You need to generate **TWO separate RSA key pairs**:
1. **Merchant Signing Key Pair** - For signing your requests
2. **Merchant Encryption Key Pair** - For decrypting PACO's responses

Both public keys must be uploaded to the PACO admin portal.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# PACO Environment (uat or prod)
PACO_ENV=uat

# For local development with UAT: PACO may reject localhost URLs for webhooks/redirects.
# Use ngrok or similar: PACO_PUBLIC_BASE_URL=https://your-subdomain.ngrok.io
# UAT also forces currency to THB (MMK may not be supported in UAT).
PACO_PUBLIC_BASE_URL=

# Basic HTTP Authentication
PACO_USERNAME=your_username
PACO_PASSWORD=your_password

# Company Token
PACO_TOKEN=your_company_token

# API Key (for JWT issuer)
PACO_API_KEY=your_api_key

# Key ID
PACO_KID=your_key_id

# ============================================
# MERCHANT KEYS (Your Keys)
# ============================================

# Merchant Signing Private Key (for signing requests) - Store as PEM format
# This is YOUR private key for signing requests to PACO
PACO_MERCHANT_SIGNING_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----

# Merchant Signing Public Key (uploaded to PACO portal)
# This is YOUR public key for PACO to verify your signatures
PACO_MERCHANT_SIGNING_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----

# Merchant Encryption Private Key (for decrypting responses) - Store as PEM format
# This is YOUR private key for decrypting PACO's encrypted responses
PACO_MERCHANT_ENCRYPTION_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----

# Merchant Encryption Public Key (uploaded to PACO portal)
# This is YOUR public key for PACO to encrypt responses
PACO_MERCHANT_ENCRYPTION_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----

# ============================================
# PACO KEYS (Provided by PACO)
# ============================================

# PACO Encryption Public Key (for encrypting requests to PACO)
# This is PACO's public key used to encrypt your requests
PACO_PACO_ENCRYPTION_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----

# PACO Signing Public Key (for verifying PACO's response signatures)
# This is PACO's public key used to verify their response signatures
PACO_PACO_SIGNING_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----

# ============================================
# OTHER CREDENTIALS
# ============================================

# Merchant ID
PACO_MERCHANT_ID=your_merchant_id
```

### Credentials Setup

**IMPORTANT:** The following credentials have been provided. Add them to your `.env.local` file:

```env
# API Key (for JWT issuer - used as 'iss' claim)
PACO_API_KEY=c86e84ac5335447a94fd47c1c6925a42

# Merchant ID
PACO_MERCHANT_ID=9104438957

# PACO Encryption Public Key (for encrypting requests to PACO)
# This is PACO's public key used to encrypt your requests
PACO_PACO_ENCRYPTION_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAviq4wrTmVMkRHouiHLUo
nJ1d6ss6nNreJ0JWpLwmTwAM7l35g8AFIvE8PqwWevtjuil9JZ1T1zwQTP8aM3s5
/RzX5yFIhec/O14jib7Nmi4jACeJqDlHsnYzeCPw8WOhgmxWKHcORNLpn68jgnhL
rKwh3Mooz/hXtIwGuNe/pYU7i/QaiuOjtmIcQ3yxJWjiHsllaogobZjbwMzwhp1f
J6ELmZp0FJvDrE8dn4UU9yzPFNzQ4gJzJAS/JKLXjfDw5mDQdw80vbzYuxksU0bc
/3+DwY6hqaVJsP2AST7dCTR1wYzevzPxp0HMDmz1Ia/hSrmTPRhSa0qvxHMriVHU
JvJeLTNI3cWM0RI9ukR7/v6vcf8ZwOZ+u7w4YfLpPCQFN7zGUN9Hho0pWBVYOstq
sF5h/ZgBOlEHgSYY3CJdscV1+vKUvmFPiwkOdVxhc571RX56o+V71ZIGjXeYeqd3
KNnND1JNsOn4hRPbk8Cl0e8CfZnEePfqtbFQGrzRU3GvSXscMb51TlvZu9i0toJd
IJ4DiOCkUlB2sDI4x7N9ROOEbAD8uv68/jZqTM2paUNRN7Xvaa2LUCis3acadiyL
t0tpuOT0sY2OejhLJshwNfTfc67gdtCJ3diddZWkXYpBgkMhuVj3TSx85sUklbGG
JkzkwNsC0JhMSo7ZqbYxczECAwEAAQ==
-----END PUBLIC KEY-----

# Merchant Signing Public Key (for PACO to verify your signatures)
# This is YOUR public signing key (uploaded to PACO portal)
# NOTE: You still need the corresponding PRIVATE key for signing requests
PACO_MERCHANT_SIGNING_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkEOCDQxCbyv/n1jadyDD
L9KLRddF7W2eVNf7GwVeqlq3CVor0QHiU+yweO3b622NZAPDBy/GFeJJH5lwdJUb
YojFWtHUqYN7/HoTHF50KhAbLMhnllsULuyVgG1l3m9xSjRJtQSaIZP5jF4LSM+m
69Xd7U2qoTczMOaNZ36yWZzxN/OUQMjb2cWeZCLhVPf6zJwA35kC57NK2n1DDvvy
FvLnh9gBd8EOkJuT9us1r01Ya3XpFHhXy1fTg9bmWXDMwMm5stnhmGOF2d6Uv4rY
Gqk67nRzX0ZEGrWW6X0tzeQESkQShx0algKIXeM/2RBfit1QHDHhI70CYTqt1eG0
5Cpr5u7FdvD4pk8fqfW8xJsmoZisQNQnov0oriUqrB1wZvWL8+calfoX0nxWMVlP
37LspA6O2+dlnjFxpDQSjnfWVFyS6fKvr8jXWI6KG6L11J+yAXY4KjqGK+wEnH2y
f8tK8NLkIAWNstlUQrycEkk4mP6ElKwkOMpRND0ArG1cG0uMx+VXd1vrWG6UePa+
GHmgHbgLSkjI3hpz3wbpE5cbp73dbIgryeC0AeLY7kKDt7pMQpkg3gNxcvTGXjZY
c1TQ5siuD1RBJUR5Lv/P8jjyQnB4D67AEuL1pw5acKQ3tfOEF+iuzzzV5zeSj5T5
rYR1GpuPOqTz97AWSxawDUsCAwEAAQ==
-----END PUBLIC KEY-----
```

**⚠️ Critical Information:**
- You need **TWO separate key pairs** (signing and encryption) on your side
- The keys provided above are:
  - **PACO Encryption Public Key**: For encrypting your requests to PACO
  - **Merchant Signing Public Key**: Your public key (already uploaded to PACO portal)
- You still need to obtain from your PACO admin portal:
  - `PACO_USERNAME` and `PACO_PASSWORD` (Basic HTTP Auth)
  - `PACO_TOKEN` (Company identification token - required in headers)
  - `PACO_KID` (Key ID)
  - `PACO_MERCHANT_SIGNING_PRIVATE_KEY` (Your private key for signing requests)
  - `PACO_MERCHANT_ENCRYPTION_PRIVATE_KEY` (Your private key for decrypting responses)
  - `PACO_MERCHANT_ENCRYPTION_PUBLIC_KEY` (Your encryption public key - upload to PACO portal)
  - `PACO_PACO_SIGNING_PUBLIC_KEY` (PACO's signing public key for verifying their responses)
- **Download PACO Default Public Keys:**
  - **UAT**: Download from PACO documentation (contact PACO support for link)
  - **Production**: Download from PACO documentation (password-protected archive - contact PACO for password)
- **Never commit** your `.env.local` file to version control

## Installation

For full JOSE encryption support, install the `jose` library:

```bash
npm install jose
```

## Configuration

### 1. Update Payment Config

Edit `config/paymentConfig.js` to match your PACO account settings:

- Set `environment` to `'uat'` for testing or `'prod'` for production
- Verify all endpoint URLs are correct
- Update currency and locale as needed

### 2. JOSE Encryption

**For UAT/Testing:**
- Encryption is optional if IP whitelisting is enabled
- You can use unencrypted requests (`Content-Type: application/json`)
- If encryption is used, it must be fully implemented

**For Production:**
- Encryption is **mandatory**
- All requests must be signed and encrypted using JOSE
- IP whitelisting is also mandatory
- Implement full JOSE encryption in `lib/payment-service.js`

**Content-Type Headers:**
- **Unencrypted requests**: `Content-Type: application/json` and `Accept: application/json`
- **Encrypted requests**: `Content-Type: application/jose` and `Accept: application/jose`

### 3. JOSE Encryption Workflow

The JOSE encryption follows this structure: **JWE (JWS (payload))**

**Sending Request to PACO:**
1. Create JSON request payload according to PACO specification
2. Wrap request: `{ "request": <JSON request payload> }`
3. Sign payload using **Merchant Signing Private Key** (JWS with `alg: PS256`)
4. Encrypt signed payload using **PACO Encryption Public Key** (JWE with `alg: RSA-OAEP`, `enc: A128CBC-HS256`)
5. Send with headers: `Content-Type: application/jose` and `Accept: application/jose`

**Receiving Response from PACO:**
1. Decrypt response using **Merchant Encryption Private Key**
2. Verify signature using **PACO Signing Public Key**
3. Extract payload from decrypted and verified response

**JWT Claims for Requests:**
```json
{
  "aud": "PacoAudience",
  "iss": "<your_api_key>",
  "request": { <request_body> },
  "exp": <expiration_timestamp>,
  "iat": <issued_at_timestamp>,
  "nbf": <not_before_timestamp>
}
```

**JWT Claims for Responses:**
```json
{
  "aud": "<your_api_key>",
  "iss": "PacoIssuer",
  "response": { <response_body> },
  "exp": <expiration_timestamp>,
  "iat": <issued_at_timestamp>
}
```

### 4. Implement JOSE Encryption

The current implementation has a placeholder for JOSE encryption. To fully implement:

1. Install `jose` library: `npm install jose`
2. Update `lib/payment-service.js`:
   - Implement `encryptPayload()` method using `EncryptJWT` and `SignJWT`
   - Implement `decryptPayload()` method using `jose` decryption
   - Use the correct key pairs for signing and encryption

Example implementation (simplified):

```javascript
import { SignJWT, EncryptJWT } from 'jose';
import { jwtVerify, jwtDecrypt } from 'jose';

async encryptPayload(payload) {
  // Load keys
  const merchantSigningPrivateKey = await this.loadMerchantSigningPrivateKey();
  const pacoEncryptionPublicKey = await this.loadPacoEncryptionPublicKey();
  
  // Wrap payload
  const wrappedPayload = { request: payload };
  
  // 1. Sign the payload (JWS) using Merchant Signing Private Key
  const signed = await new SignJWT(wrappedPayload)
    .setProtectedHeader({ 
      alg: 'PS256', 
      kid: this.config.keys.kid,
      crit: ['exp'] // exp is critical
    })
    .setIssuedAt()
    .setExpirationTime(`${this.config.jose.expiry}s`)
    .setNotBefore()
    .setAudience('PacoAudience')
    .setIssuer(this.config.auth.apiKey)
    .sign(merchantSigningPrivateKey);
  
  // 2. Encrypt the signed payload (JWE) using PACO Encryption Public Key
  const encrypted = await new EncryptJWT(signed)
    .setProtectedHeader({
      alg: 'RSA-OAEP',
      enc: 'A128CBC-HS256',
      kid: this.config.keys.kid,
    })
    .encrypt(pacoEncryptionPublicKey);
  
  return encrypted;
}

async decryptPayload(encryptedPayload) {
  // Load keys
  const merchantEncryptionPrivateKey = await this.loadMerchantEncryptionPrivateKey();
  const pacoSigningPublicKey = await this.loadPacoSigningPublicKey();
  
  // 1. Decrypt using Merchant Encryption Private Key
  const { payload: decrypted } = await jwtDecrypt(
    encryptedPayload,
    merchantEncryptionPrivateKey
  );
  
  // 2. Verify signature using PACO Signing Public Key
  const { payload: verified } = await jwtVerify(
    decrypted,
    pacoSigningPublicKey,
    {
      audience: this.config.auth.apiKey,
      issuer: 'PacoIssuer',
    }
  );
  
  return verified.response || verified;
}
```

## API Endpoints

### PACO API Base URLs

| Environment | Core Base URL | Payment API Base URL (Redirection) |
|------------|---------------|-----------------------------------|
| UAT | `https://core.demo-paco.2c2p.com` | `https://payment-api.demo-paco.2c2p.com` |
| PROD | `https://core.paco.2c2p.com` | `https://payment-api.paco.2c2p.com` |

### PACO Payment Endpoints

| Action | Method | Endpoint | Notes |
|--------|--------|----------|-------|
| nonUi | POST | `/api/2.0/Payment/nonUi` | Create payment (non-UI) |
| prePaymentUi | POST | `/api/2.0/Payment/prePaymentUi` | Generate payment page |
| transactionStatus | GET | `/api/2.0/Inquiry/transactionStatus` | ⚠️ **Do not apply JOSE encryption** - Use `application/json` |
| transactionList | POST | `/api/2.0/Inquiry/transactionList` | |
| void | POST | `/api/2.0/void` | |
| settlement | PUT | `/api/2.0/settlement` | |
| refund | POST | `/api/2.0/Refund/refund` | |

**Important Notes:**
- All endpoints require the `token` header (Company identification token)
- All endpoints require Basic HTTP Authentication
- All endpoints (except `transactionStatus`) require JOSE encryption in production
- Full URL = Base URL + Endpoint (e.g., `https://core.demo-paco.2c2p.com/api/2.0/Payment/prePaymentUi`)

### Application API Endpoints

These are your application's internal API routes:

- **Create Payment (non-UI)**: `POST /api/payment/create`
- **Generate Payment Page**: `POST /api/payment/generate-page`
- **Check Status**: `GET /api/payment/status?transactionId=xxx`
- **Callback Handler**: `POST /api/payment/callback`

### Usage Example

```javascript
// Generate payment page
const response = await api.payment.generatePage({
  orderId: 123,
  amount: 10000,
  currency: 'MMK',
  customerInfo: {
    email: 'customer@example.com',
    name: 'John Doe',
    phone: '+959123456789',
  },
  returnUrl: 'https://yoursite.com/payment/success',
  cancelUrl: 'https://yoursite.com/payment/cancel',
});

// Redirect to payment page
window.location.href = response.paymentPageUrl;
```

## Payment Flow

1. **Order Creation**: Customer creates an order
2. **Payment Initiation**: Call `/api/payment/generate-page` with order details
3. **Redirect**: Customer is redirected to PACO payment page
4. **Payment Processing**: Customer completes payment on PACO
5. **Callback**: PACO sends callback to `/api/payment/callback`
6. **Status Update**: Order status is updated based on payment result
7. **Redirect**: Customer is redirected to success/cancel page

## Testing

### UAT Environment

1. Set `PACO_ENV=uat` in `.env.local`
2. Use UAT credentials provided by PACO
3. Test with small amounts
4. Verify callback handling

### Production

1. Set `PACO_ENV=prod` in `.env.local`
2. Use production credentials
3. Ensure JOSE encryption is fully implemented
4. Configure IP whitelisting if required
5. Test thoroughly before going live

## Security Notes

1. **Never commit** `.env.local` or keys to version control
2. **Store keys securely** - Consider using a secrets management service
3. **Use HTTPS** in production (required by PACO)
4. **Validate callbacks** - Always verify transaction status with PACO
5. **Implement proper error handling** - Log errors but don't expose sensitive data
6. **Key Security**:
   - Never share your private keys
   - Use 4096-bit RSA keys (mandatory)
   - Private keys must be in PKCS#8 format
   - Public keys must be in X.509 format
7. **Token Security**:
   - The `token` header is required for all requests
   - Missing or invalid token results in "Access Denied" error
8. **JOSE Security**:
   - Signatures expire 5 minutes after generation
   - Always verify response signatures
   - Use correct key pairs for signing vs encryption

## Troubleshooting

### "Access Denied" Error
- Check that `PACO_TOKEN` is correct
- Verify Basic Auth credentials
- Ensure token is sent in headers

### Encryption Errors
- Verify private/public keys are correctly formatted (PEM)
- Check key IDs match
- Ensure `jose` library is installed

### Callback Not Received
- Verify callback URL is accessible from internet
- Check firewall/security settings
- Ensure endpoint is properly configured

## Support

For PACO API documentation and support:
- Contact your PACO account manager
- Refer to PACO API documentation
- Check PACO admin portal for API details
