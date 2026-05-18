/**
 * PACO (2C2P) Payment Gateway Configuration
 * Store sensitive keys in environment variables
 */

import { readMandalaPacoCredentialsSync } from '../lib/mandala-paco-keys.js';

const paymentConfig = {
  // Environment: 'uat' or 'prod'
  environment: process.env.PACO_ENV || 'prod',
  
  // Base URLs
  baseUrls: {
    uat: {
      core: 'https://core.demo-paco.2c2p.com',
      paymentApi: 'https://core.demo-paco.2c2p.com', // Use core for all endpoints
    },
    prod: {
      core: 'https://core.paco.2c2p.com',
      paymentApi: 'https://core.paco.2c2p.com', // Use core for all endpoints
    },
  },
  
  // API endpoints — Mandala Payment.php hosted checkout uses prePaymentUi (never NonUi for that flow).
  endpoints: {
    prePaymentUi: '/api/1.0/Payment/prePaymentUi',
    nonUi: '/api/1.0/Payment/NonUi',
    transactionStatus: '/api/2.0/Inquiry/transactionStatus',
    transactionList: '/api/2.0/Inquiry/transactionList',
    void: '/api/2.0/void',
    settlement: '/api/2.0/settlement',
    refund: '/api/2.0/Refund/refund',
  },
  
  // Authentication
  auth: {
    // API Key (for JWT issuer and headers) - using exact value from PHP demo
    apiKey: process.env.PACO_API_KEY || process.env.PACO_ACCESS_TOKEN || 'fe278fb882dc468a8a9c8a91b3a26d44',
  },
  
  // JOSE Configuration
  jose: {
    audience: 'PacoAudience', // Fixed: should be exactly "PacoAudience" per docs
    algorithm: {
      jws: 'PS256', // JWS signing algorithm
      jwe: {
        alg: 'RSA-OAEP', // Key encryption algorithm
        enc: 'A128CBC-HS256', // Content encryption algorithm
      },
    },
    expiry: 300, // 5 minutes in seconds
  },
  
  // Keys (should be stored securely, loaded from files or env)
  // Note: Merchant needs TWO key pairs: signing and encryption
  keys: {
    // Key ID (kid) - used in JWT headers
    kid: process.env.PACO_KID || '19f84b5655f04e25a99b09f1ee2fac78',
  },
  
  // Merchant Information
  merchant: {
    // Merchant ID
    merchantId: process.env.PACO_MERCHANT_ID || '9104438957',
  },
  
  // Payment Settings
  payment: {
    currency: 'NPR', // Default currency (Nepali Rupees)
    locale: 'en',
  },
};

try {
  const m = readMandalaPacoCredentialsSync();
  if (m) {
    paymentConfig.auth.apiKey = m.accessToken;
    paymentConfig.merchant.merchantId = m.merchantId;
    paymentConfig.keys.kid = m.kid;
  }
} catch (e) {
  console.warn('[paymentConfig] Mandala SecurityData merge skipped:', e?.message || e);
}

// Get current environment base URL
paymentConfig.getBaseUrl = function () {
  const env = this.environment.toLowerCase();
  return this.baseUrls[env] || this.baseUrls.uat;
};

// Get full endpoint URL
paymentConfig.getEndpointUrl = function(endpoint) {
  // For payment endpoints, use paymentApi baseUrl, for others use core
  const baseUrlObj = this.getBaseUrl();
  const baseUrl = endpoint.includes('/Payment/') ? baseUrlObj.paymentApi : baseUrlObj.core;
  return `${baseUrl}${endpoint}`;
};

// Check if encryption is required
paymentConfig.isEncryptionRequired = function() {
  return this.environment === 'prod';
};

export default paymentConfig;
