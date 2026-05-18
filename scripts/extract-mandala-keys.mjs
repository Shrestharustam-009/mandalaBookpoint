/**
 * Sync .env.local PACO_* from mandala/src/SecurityData.php (same strings as PHP).
 * PEM: merchant keys as BEGIN RSA PRIVATE KEY; PACO public keys as BEGIN PUBLIC KEY (matches ActionRequest.php).
 *
 * Usage (repo root): node scripts/extract-mandala-keys.mjs
 */

import fs from 'fs';
import path from 'path';
import {
  wrapMerchantPrivateKeyPem,
  wrapPacoPublicKeyPem,
} from '../lib/mandala-paco-keys.js';

const content = fs.readFileSync(
  path.join(process.cwd(), 'mandala', 'src', 'SecurityData.php'),
  'utf8',
);

function extract(name) {
  const re = new RegExp(
    `^\\s*public static string \\$${name} = "([^"]*)";`,
    'm',
  );
  const m = content.match(re);
  if (!m) throw new Error(`Missing ${name} in mandala/src/SecurityData.php`);
  return m[1];
}

const kid = extract('EncryptionKeyId');
const apiKey = extract('AccessToken');
const merchantId = extract('MerchantId');
const signB64 = extract('MerchantSigningPrivateKey');
const decB64 = extract('MerchantDecryptionPrivateKey');
const encPubB64 = extract('PacoEncryptionPublicKey');
const sigPubB64 = extract('PacoSigningPublicKey');

function envEscape(pem) {
  return pem.trim().replace(/\r\n/g, '\n').replace(/\n/g, '\\n');
}

const out = [
  '# PACO keys synced from mandala/src/SecurityData.php (PEM matches PHP ActionRequest wrapping)',
  '',
  `PACO_KID=${kid}`,
  `PACO_API_KEY=${apiKey}`,
  `PACO_MERCHANT_ID=${merchantId}`,
  `PACO_MERCHANT_SIGNING_PRIVATE_KEY=${envEscape(wrapMerchantPrivateKeyPem(signB64))}`,
  `PACO_MERCHANT_ENCRYPTION_PRIVATE_KEY=${envEscape(wrapMerchantPrivateKeyPem(decB64))}`,
  `PACO_ENCRYPTION_PUBLIC_KEY=${envEscape(wrapPacoPublicKeyPem(encPubB64))}`,
  `PACO_SIGNING_PUBLIC_KEY=${envEscape(wrapPacoPublicKeyPem(sigPubB64))}`,
].join('\n');

function readEnvLine(file, name) {
  if (!fs.existsSync(file)) return null;
  const e = fs.readFileSync(file, 'utf8');
  const m = e.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return m ? m[1].trim() : null;
}

const prev = path.join(process.cwd(), '.env.local');
const pacoEnv = readEnvLine(prev, 'PACO_ENV') || 'uat';
const pacoPublicBase =
  readEnvLine(prev, 'PACO_PUBLIC_BASE_URL') || 'http://localhost:3000';

const envLocal = [
  out,
  '',
  '# PACO Configuration',
  `PACO_ENV=${pacoEnv}`,
  `PACO_PUBLIC_BASE_URL=${pacoPublicBase}`,
  '',
].join('\n');

fs.writeFileSync(prev, envLocal, 'utf8');
console.log('Updated .env.local from mandala/src/SecurityData.php');
