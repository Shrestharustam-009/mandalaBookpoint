import { SignJWT, CompactEncrypt } from 'jose';
import { createPrivateKey, createPublicKey } from 'crypto';
import { compactDecrypt } from 'jose';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const formatPemKey = (key) => {
  if (!key) return null;
  let cleaned = key.trim();
  cleaned = cleaned.replace(/\\n/g, '\n');
  return cleaned;
};

async function testEncryption() {
  console.log('\n=== PACO Encryption Debug Test ===\n');

  // Step 1: Load and verify keys
  console.log('Step 1: Loading Keys...');
  try {
    const signingKeyRaw = process.env.PACO_MERCHANT_SIGNING_PRIVATE_KEY;
    const encryptionKeyRaw = process.env.PACO_MERCHANT_ENCRYPTION_PRIVATE_KEY;
    const pacoPublicKeyRaw = process.env.PACO_PUBLIC_KEY;

    console.log('✓ Signing key env var exists:', !!signingKeyRaw);
    console.log('✓ Encryption key env var exists:', !!encryptionKeyRaw);
    console.log('✓ PACO public key env var exists:', !!pacoPublicKeyRaw);

    const signingKey = createPrivateKey({
      key: formatPemKey(signingKeyRaw),
      format: 'pem',
      type: 'pkcs1'
    });

    const pacoPublicKey = createPublicKey(formatPemKey(pacoPublicKeyRaw));

    console.log('✓ Keys loaded successfully\n');

    // Step 2: Check config values
    console.log('Step 2: Checking Configuration...');
    console.log('API Key (ISS):', process.env.PACO_API_KEY || 'MISSING!');
    console.log('Audience (AUD):', process.env.PACO_AUDIENCE || 'MISSING!');
    console.log('Username:', process.env.PACO_USERNAME || 'MISSING!');
    console.log('Password exists:', !!process.env.PACO_PASSWORD);
    console.log('Token exists:', !!process.env.PACO_TOKEN);
    console.log('Base URL:', process.env.PACO_BASE_URL || 'MISSING!\n');

    // Step 3: Create test payload
    console.log('Step 3: Creating Test Payload...');
    const now = Math.floor(Date.now() / 1000);
    const testPayload = {
  aud: 'PacoAudience',  // Fixed
  iss: process.env.PACO_API_KEY,
  request: {
    merchantID: process.env.PACO_MERCHANT_ID || '9104438957',
    invoiceNo: 'TEST-' + Date.now(),
    amount: 100.00,
    currencyCode: 'THB',
    description: 'Test payment'
  },
  exp: now + 300,
  iat: now,
  nbf: now,
};

// After Step 5 (JWE creation), add this test:
console.log('\nStep 5.5: Testing if we can decrypt our own JWE (sanity check)...');
try {
  const encryptionPrivateKey = createPrivateKey({
    key: formatPemKey(process.env.PACO_MERCHANT_ENCRYPTION_PRIVATE_KEY),
    format: 'pem',
    type: 'pkcs1'
  });
  
  const { plaintext } = await compactDecrypt(jwe, encryptionPrivateKey);
  const decrypted = new TextDecoder().decode(plaintext);
  console.log('✅ Successfully decrypted our own JWE');
  console.log('Decrypted JWS preview:', decrypted.substring(0, 100));
} catch (err) {
  console.log('❌ Could not decrypt our own JWE:', err.message);
}
// Step 4: Sign with PS256 (not RS256)
const jws = await new SignJWT(testPayload)
  .setProtectedHeader({ alg: 'PS256', typ: 'JWT' })
  .setIssuedAt()
  .setExpirationTime(testPayload.exp)
  .sign(signingKey);

// Step 5: Encrypt with correct algorithms
const jwe = await new CompactEncrypt(encoder.encode(jws))
  .setProtectedHeader({ 
    alg: 'RSA-OAEP',
    enc: 'A128CBC-HS256',
    kid: '7664a2ed0dee4879bdfca0e8ce1ac313'
  })
  .encrypt(pacoPublicKey);

    console.log('✓ JWE Created');
    console.log('JWE Length:', jwe.length);
    console.log('JWE Parts:', jwe.split('.').length, '(should be 5)');
    console.log('JWE Preview:', jwe.substring(0, 150) + '...\n');

    // Step 6: Test API call
    console.log('Step 6: Testing API Call...');
    const url = (process.env.PACO_BASE_URL || 'https://core.demo-paco.2c2p.com') + '/api/2.0/Payment/prePaymentUi';
    
    const credentials = Buffer.from(`${process.env.PACO_USERNAME}:${process.env.PACO_PASSWORD}`).toString('base64');
    
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'token': process.env.PACO_TOKEN,
      'Content-Type': 'application/jose',
      'Accept': 'application/jose',
    };

    console.log('URL:', url);
    console.log('Headers:', {
      Authorization: headers.Authorization.substring(0, 20) + '...',
      token: headers.token?.substring(0, 20) + '...' || 'MISSING',
      'Content-Type': headers['Content-Type'],
      Accept: headers.Accept,
    });
    console.log('Body length:', jwe.length);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: jwe,
    });

    console.log('\n=== API Response ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Body length:', responseText.length);
    console.log('Body:', responseText || '(empty)');

    if (response.ok) {
      console.log('\n✅ SUCCESS!');
    } else {
      console.log('\n❌ FAILED - Status', response.status);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
  }
}

// Add this separate test function
async function testAuth() {
    console.log('\n=== Testing Authentication Only ===\n');
    
    const url = (process.env.PACO_BASE_URL || 'https://core.demo-paco.2c2p.com') + '/api/2.0/Payment/transactionStatus?transactionId=TEST123';
    
    const credentials = Buffer.from(`${process.env.PACO_USERNAME}:${process.env.PACO_PASSWORD}`).toString('base64');
    
    console.log('Username:', process.env.PACO_USERNAME);
    console.log('Password length:', process.env.PACO_PASSWORD?.length);
    console.log('Token length:', process.env.PACO_TOKEN?.length);
    console.log('Basic Auth:', credentials);
    
    const headers = {
      'Authorization': `Basic ${credentials}`,
      'token': process.env.PACO_TOKEN,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
  
      console.log('\nStatus:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      const text = await response.text();
      console.log('Body:', text);
      
      if (response.status === 401 || response.status === 403) {
        console.log('\n❌ AUTHENTICATION FAILED - Check username, password, and token');
      } else if (response.status === 404) {
        console.log('\n✅ AUTH OK (404 is expected for fake transaction ID)');
      } else {
        console.log('\nStatus:', response.status);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  // Run both tests
  testAuth().then(() => testEncryption());

testEncryption();