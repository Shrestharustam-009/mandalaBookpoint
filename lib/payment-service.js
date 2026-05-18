/**
 * PACO (2C2P) Payment Service
 * Handles JOSE encryption/decryption and API communication
 */

import paymentConfig from '@/config/paymentConfig';
import {
  CompactEncrypt,
  compactDecrypt,
  jwtVerify,
  SignJWT,
} from 'jose';
import { createPrivateKey, createPublicKey } from 'crypto';
import { readMandalaPacoCredentialsSync } from '@/lib/mandala-paco-keys';

// Load environment variables explicitly for Node.js
import { config } from 'dotenv';
config({ path: '.env.local' });

/** Mandala `Payment.php` — JOSE hosted checkout path (must not be NonUi). */
export const PACO_PRE_PAYMENT_UI_PATH = '/api/1.0/Payment/prePaymentUi';

/**
 * `apiRequest.requestDateTime` — match PHP Carbon `utc()->format('Y-m-d\TH:i:s.v\Z')`.
 */
export function formatPacoRequestDateTime(d = new Date()) {
  const pad = (n, w = 2) => String(n).padStart(w, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}Z`;
}

/**
 * Mandala uses Carbon `getPreciseTimestamp(3)` — numeric order id only (no letters).
 * PACO demo rejects alphanumeric order numbers with 400 + empty body.
 */
export function pacoNumericOrderNo() {
  const ms = Date.now();
  const suffix = Math.floor(Math.random() * 1_000_000);
  return `${ms}${String(suffix).padStart(6, '0')}`;
}

// Check if we're on the server
const isServer = typeof window === 'undefined';

/**
 * Payment Service Class
 */
class PaymentService {
  constructor() {
    this.config = paymentConfig;
    this.baseUrl = this.config.getBaseUrl();
    this.merchantSigningPrivateKey = null;
    this.merchantEncryptionPrivateKey = null;
    this.pacoEncryptionPublicKey = null;  // Changed
    this.pacoSigningPublicKey = null;     // Added
    /** When set, kid / API key / PEMs come from mandala/src/SecurityData.php */
    this._mandalaCreds = null;
  }

  /**
   * Load RSA keys from environment variables
   */
  async loadKeys() {
    if (this.merchantSigningPrivateKey && this.merchantEncryptionPrivateKey) {
      return;
    }
  
    try {
      console.log('🔑 Starting key loading...');

      const formatPemKey = (key) => {
        if (!key) return null;
        let cleaned = key.trim();
        cleaned = cleaned.replace(/\\n/g, '\n');

        if (cleaned.includes('-----BEGIN') && cleaned.includes('-----END')) {
          return cleaned;
        }

        if (cleaned.includes('PUBLIC') || cleaned.includes('PUBLIC KEY')) {
          return `-----BEGIN PUBLIC KEY-----\n${cleaned.replace(/\s/g, '')}\n-----END PUBLIC KEY-----`;
        }
        // Mandala ActionRequest.php wraps PKCS#1 as BEGIN RSA PRIVATE KEY (not PKCS#8)
        return `-----BEGIN RSA PRIVATE KEY-----\n${cleaned.replace(/\s/g, '')}\n-----END RSA PRIVATE KEY-----`;
      };

      const mandala = readMandalaPacoCredentialsSync();
      if (mandala) {
        this._mandalaCreds = mandala;
        this.config.auth.apiKey = mandala.accessToken;
        this.config.merchant.merchantId = mandala.merchantId;
        this.config.keys.kid = mandala.kid;
        console.log('✅ PACO credentials from Mandala file:', mandala.sourcePath);

        this.merchantSigningPrivateKey = createPrivateKey({
          key: mandala.merchantSigningPem,
          format: 'pem',
        });
        this.merchantEncryptionPrivateKey = createPrivateKey({
          key: mandala.merchantDecryptionPem,
          format: 'pem',
        });
        this.pacoEncryptionPublicKey = createPublicKey({
          key: mandala.pacoEncryptionPem,
          format: 'pem',
        });
        this.pacoSigningPublicKey = createPublicKey({
          key: mandala.pacoSigningPem,
          format: 'pem',
        });
        console.log('✅ All keys loaded from Mandala (PHP-matched PEM wrap)');
        return;
      }

      this._mandalaCreds = null;

      const signingKeyRaw = process.env.PACO_MERCHANT_SIGNING_PRIVATE_KEY;
      if (!signingKeyRaw) {
        throw new Error(
          'PACO_MERCHANT_SIGNING_PRIVATE_KEY is not set and mandala/src/SecurityData.php was not found. Add the mandala folder, run node scripts/extract-mandala-keys.mjs, or set PACO_* env vars. Use PACO_IGNORE_MANDALA_FILE=1 to skip auto-loading from mandala.',
        );
      }

      const signingKeyFormatted = formatPemKey(signingKeyRaw);
      this.merchantSigningPrivateKey = createPrivateKey({
        key: signingKeyFormatted,
        format: 'pem',
      });
      console.log('✅ Signing key loaded successfully');

      const encryptionKeyRaw = process.env.PACO_MERCHANT_ENCRYPTION_PRIVATE_KEY;
      if (!encryptionKeyRaw) {
        throw new Error('PACO_MERCHANT_ENCRYPTION_PRIVATE_KEY is not set');
      }
      this.merchantEncryptionPrivateKey = createPrivateKey({
        key: formatPemKey(encryptionKeyRaw),
        format: 'pem',
      });

      const pacoEncryptionKeyRaw =
        process.env.PACO_ENCRYPTION_PUBLIC_KEY || process.env.PACO_PACO_ENCRYPTION_PUBLIC_KEY;
      if (!pacoEncryptionKeyRaw) {
        throw new Error('PACO_ENCRYPTION_PUBLIC_KEY or PACO_PACO_ENCRYPTION_PUBLIC_KEY is required');
      }
      this.pacoEncryptionPublicKey = createPublicKey(formatPemKey(pacoEncryptionKeyRaw));

      const pacoSigningKeyRaw =
        process.env.PACO_SIGNING_PUBLIC_KEY || process.env.PACO_PACO_SIGNING_PUBLIC_KEY;
      if (!pacoSigningKeyRaw) {
        throw new Error('PACO_SIGNING_PUBLIC_KEY or PACO_PACO_SIGNING_PUBLIC_KEY is required');
      }
      this.pacoSigningPublicKey = createPublicKey(formatPemKey(pacoSigningKeyRaw));

      console.log('✅ All keys loaded from environment');
    } catch (error) {
      console.error('❌ Key loading error:', error);
      throw new Error(`Key loading failed: ${error.message}`);
    }
  }

  /**
   * Create Basic Auth header
   */
  getBasicAuthHeader() {
    // Remove Basic Auth - not needed per PHP demo
    return null;
  }

  /**
   * Get request headers - match PHP demo exactly
   */
  getHeaders(useEncryption = true) {
    const headers = {};

    // Mandala ExecuteFormJose / ExecuteJose: JOSE requests send only CompanyApiKey (no apiKey header)
    if (this.config.auth.apiKey) {
      headers['CompanyApiKey'] = this.config.auth.apiKey;
    }

    headers['Accept'] = 'application/jose';
    headers['Content-Type'] = 'application/jose; charset=utf-8';

    return headers;
  }

  /**
   * Create JWT payload for JOSE encryption
   */
  createJWTPayload(requestBody) {
    const now = Math.floor(Date.now() / 1000);
    const accessToken = this.config.auth.apiKey;
    // Mandala Payment.php: iat and nbf both $now->unix(), exp $now->addHour()->unix()
    const exp = now + 3600;

    return {
      request: requestBody,
      iss: accessToken,
      aud: 'PacoAudience',
      CompanyApiKey: accessToken,
      iat: now,
      nbf: now,
      exp,
    };
  }

  /**
   * 1. Sign payload with merchant's signing private key (PS256) -> JWS
   * 2. Encrypt JWS with PACO's encryption public key (RSA-OAEP, A128CBC-HS256) -> JWE
   */
  async encryptPayload(payload) {
    await this.loadKeys();

    // kid must match PACO's JWE key ID (EncryptionKeyId in PHP demo)
    const kid =
      this._mandalaCreds?.kid ||
      process.env.PACO_KID ||
      this.config.keys.kid ||
      '19f84b5655f04e25a99b09f1ee2fac78';

    // Mandala: JWS over the same JSON envelope PHP signs (web-token signs json_encode(payload))
    const envelope =
      typeof payload === 'string' ? JSON.parse(payload) : payload;

    const jws = await new SignJWT(envelope)
      .setProtectedHeader({ alg: 'PS256', typ: 'JWT' })
      .sign(this.merchantSigningPrivateKey);

    // Step 2: Encrypt the JWS string with PACO's encryption public key
    const encoder = new TextEncoder();
    const jwe = await new CompactEncrypt(encoder.encode(jws))
      .setProtectedHeader({
        alg: 'RSA-OAEP',
        enc: 'A128CBC-HS256',
        kid,
        typ: 'JWT',
      })
      .encrypt(this.pacoEncryptionPublicKey);

    return jwe;
  }

  /**
   * Decrypt and verify response payload
   * According to PACO docs: JWE(JWS(payload))
   * 1. Decrypt JWE with merchant's encryption private key -> JWS
   * 2. Verify JWS with PACO's signing public key (PS256) -> payload
   * Response claims: iss = "PacoIssuer", aud = API key
   */
  async decryptPayload(encryptedPayload) {
    await this.loadKeys();
    
    // Step 1: Decrypt JWE with merchant's encryption private key
    const { plaintext } = await compactDecrypt(
      encryptedPayload,
      this.merchantEncryptionPrivateKey
    );
    
    // Convert decrypted plaintext (Uint8Array) to string (JWS)
    const decoder = new TextDecoder();
    const jws = decoder.decode(plaintext);
    
    // Step 2: Verify JWS with PACO's signing public key (Mandala ActionRequest claim checkers)
    const { payload } = await jwtVerify(jws, this.pacoSigningPublicKey, {
      algorithms: ['PS256'],
      issuer: 'PacoIssuer',
      audience: this.config.auth.apiKey,
      clockTolerance: 60,
    });

    // Return full claims so callers can read response.Data.paymentPage (Mandala payment_request.php)
    return JSON.parse(JSON.stringify(payload));
  }

  /**
   * Make API request to PACO
   */
  async makeRequest(endpoint, method = 'POST', body = null, useEncryption = true) {
    if (!isServer) {
      throw new Error('Payment API calls can only be made from the server');
    }

    const isUat = (this.config.environment || 'uat').toLowerCase() === 'uat';
    const debugUnencrypted = isUat && process.env.PACO_DEBUG_UNENCRYPTED === '1';
    console.log('Debug mode:', debugUnencrypted);
    console.log('useEncryption before debug:', useEncryption);
    if (debugUnencrypted) {
      useEncryption = false;
      console.warn('⚠️ PACO_DEBUG_UNENCRYPTED=1: Sending unencrypted request to get PACO error details');
    }
    console.log('useEncryption after debug:', useEncryption);
  
    const url = this.config.getEndpointUrl(endpoint);
    console.log('PACO API URL:', url);
    console.log('PACO API Endpoint:', endpoint);
    console.log('PACO Base URLs:', this.config.baseUrls);
    const headers = this.getHeaders(useEncryption);
    console.log('PACO API Headers:', headers);
  
    let requestBody = null;
    if (body && useEncryption) {
      try {
        requestBody = await this.encryptPayload(this.createJWTPayload(body));
        console.log('Encryption successful, JWE length:', requestBody?.length);
      } catch (encryptError) {
        console.error('Encryption error:', encryptError);
        throw new Error(`Failed to encrypt payload: ${encryptError.message}`);
      }
    } else if (body) {
      // For debug mode, still wrap in JWT payload but don't encrypt
      requestBody = JSON.stringify(this.createJWTPayload(body));
    }

    try {
      const fetchOptions = {
        method,
        headers,
      };
  
      if (requestBody && method !== 'GET') {
        fetchOptions.body = requestBody;
      }
  
      const response = await fetch(url, fetchOptions);
  
      const contentType = response.headers.get('content-type');
      const isEncrypted = contentType?.includes('application/jose');
  
      // Get the raw response first
      const responseText = await response.text();
      console.log('PACO API Response Status:', response.status);
      console.log('PACO API Raw Response:', responseText || '(empty)');
  
      let data;
      
      const formatPacoError = (status) => {
        let base = '';
        if (status === 400) {
          base = `Bad Request (400): PACO rejected the request`;
        } else if (status === 401) {
          base = 'Unauthorized (401): Basic Auth or Token invalid';
        } else if (status === 403) {
          base = 'Forbidden (403): Access denied';
        } else {
          base = `API failed (${status}): Authentication or request format issue`;
        }
        return base;
      };

      if (!responseText || responseText.trim() === '') {
        const hdr = Object.fromEntries([...response.headers.entries()]);
        console.error('PACO API Error (empty response):', {
          status: response.status,
          url,
          responseHeaders: hdr,
        });
        throw new Error(formatPacoError(response.status));
      }
  
      // Try to decrypt only if it looks like JWE (starts with 'eyJ')
      if (isEncrypted && responseText.trim().startsWith('eyJ')) {
        try {
          data = await this.decryptPayload(responseText);
        } catch (decryptError) {
          // Fallback to JSON parsing if decryption fails
          try {
            data = JSON.parse(responseText);
          } catch {
            throw new Error(`Failed to decrypt response: ${decryptError.message}`);
          }
        }
      } else {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          throw new Error(formatPacoError(response.status) + (responseText ? ` Raw: ${responseText.substring(0, 100)}` : ''));
        }
      }
  
      if (!response.ok) {
        const errMsg = data?.message || data?.error || data?.title || data?.Message || formatPacoError(response.status);
        console.error('PACO API Error Response:', data);
        throw new Error(errMsg);
      }
  
      console.log('✅ PACO API request successful');
      return data;
    } catch (error) {
      console.error('PACO API Error:', error);
      throw error;
    }
  }

  /**
   * Query transaction status from PACO.
   * Per PACO docs: transactionStatus uses JSON (not JOSE), method GET.
   * However, we use POST with the inquiry endpoint and JOSE encryption
   * because the PACO v1 API requires it for most endpoints.
   */
  async getTransactionStatus(transactionId, orderNo) {
    if (!isServer) {
      throw new Error('Payment API calls can only be made from the server');
    }

    await this.loadKeys();

    // Try the JOSE-encrypted inquiry first
    const inquiryData = {
      apiRequest: {
        requestMessageID: crypto.randomUUID(),
        requestDateTime: formatPacoRequestDateTime(),
        language: 'en-US',
      },
      officeId: this.config.merchant.merchantId,
    };

    // Add identifiers — at least one of transactionId or orderNo is required
    if (transactionId) {
      inquiryData.transactionId = transactionId;
    }
    if (orderNo) {
      inquiryData.orderNo = orderNo;
    }

    try {
      const endpoint = this.config.endpoints?.transactionStatus || '/api/2.0/Inquiry/transactionStatus';
      const result = await this.makeRequest(endpoint, 'POST', inquiryData, true);

      // Normalize the response shape
      const data = result?.response || result?.Response || result;
      return {
        status: data?.Data?.status || data?.Data?.Status || data?.status || 'UNKNOWN',
        transactionId: data?.Data?.transactionId || data?.Data?.transactionID || transactionId,
        orderNo: data?.Data?.orderNo || orderNo,
        amount: data?.Data?.amount || data?.Data?.transactionAmount?.amount,
        raw: result,
      };
    } catch (error) {
      console.error('Transaction status inquiry failed:', error);
      throw error;
    }
  }

  /**
   * Create a non-UI payment via PACO.
   * Uses /api/2.0/Payment/nonUi endpoint with JOSE encryption.
   */
  async createPayment(paymentData) {
    if (!isServer) {
      throw new Error('Payment API calls can only be made from the server');
    }

    const endpoint = this.config.endpoints?.nonUi || '/api/2.0/Payment/nonUi';
    console.log('[PACO] createPayment (nonUi) URL:', this.config.getEndpointUrl(endpoint));
    return this.makeRequest(endpoint, 'POST', paymentData, true);
  }

  /**
   * Decrypt and verify a PACO callback/webhook payload.
   * PACO sends JOSE-encrypted payloads to the backendURL.
   * The raw body may be a JWE string (compact serialization).
   */
  async decryptCallbackPayload(rawBody) {
    if (!rawBody || typeof rawBody !== 'string') {
      throw new Error('Invalid callback payload: expected JOSE compact serialization string');
    }

    // If the body starts with 'eyJ' it's likely a JWE token
    if (rawBody.trim().startsWith('eyJ')) {
      return this.decryptPayload(rawBody.trim());
    }

    // Try parsing as JSON (for unencrypted UAT callbacks)
    try {
      return JSON.parse(rawBody);
    } catch {
      throw new Error('Callback payload is neither valid JOSE nor JSON');
    }
  }

  /**
   * Hosted payment page — Mandala `ExecuteFormJose` posts to `api/1.0/Payment/prePaymentUi` only.
   */
  async generatePaymentPage(paymentData) {
    const path = this.config.endpoints?.prePaymentUi || PACO_PRE_PAYMENT_UI_PATH;
    if (String(path).includes('NonUi')) {
      throw new Error('PACO hosted checkout misconfigured: expected prePaymentUi, got NonUi');
    }
    const url = this.config.getEndpointUrl(path);
    console.log('[PACO] generatePaymentPage URL:', url);
    return this.makeRequest(path, 'POST', paymentData, true);
  }
}

/** Hosted checkout URL from PACO prePaymentUi JOSE response (Mandala payment_request.php shape). */
export function extractPaymentPageUrl(data) {
  if (!data || typeof data !== 'object') return undefined;
  const r =
    data.response?.Data ??
    data.Response?.Data ??
    data.request?.response?.Data ??
    data.request?.Response?.Data ??
    data.data ??
    data.Data;
  const page = r?.paymentPage ?? r?.PaymentPage;
  return (
    page?.paymentPageURL ??
    page?.paymentPageUrl ??
    page?.PaymentPageURL ??
    data.webPaymentUrl ??
    data.paymentUrl ??
    data.url
  );
}

export default new PaymentService();
