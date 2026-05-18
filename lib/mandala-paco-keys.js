/**
 * Read PACO credentials exactly as in mandala/src/SecurityData.php (same base64 blobs, same PEM wrapping as PHP).
 * PHP wraps private keys: -----BEGIN RSA PRIVATE KEY-----\n<base64>\n-----END RSA PRIVATE KEY-----
 * PHP wraps public keys: -----BEGIN PUBLIC KEY-----\n<base64>\n-----END PUBLIC KEY-----
 */

import fs from 'fs';
import path from 'path';

const DEFAULT_RELATIVE = path.join('mandala', 'src', 'SecurityData.php');

function extractFromPhp(content, name) {
  const re = new RegExp(
    `^\\s*public static string \\$${name} = "([^"]*)";`,
    'm',
  );
  const m = content.match(re);
  if (!m) throw new Error(`mandala SecurityData.php: missing ${name}`);
  return m[1];
}

/** Same wrapping as mandala/src/ActionRequest.php GetPrivateKey */
export function wrapMerchantPrivateKeyPem(base64OneLine) {
  const body = base64OneLine.replace(/\s/g, '');
  return `-----BEGIN RSA PRIVATE KEY-----\n${body}\n-----END RSA PRIVATE KEY-----`;
}

/** Same wrapping as mandala/src/ActionRequest.php GetPublicKey */
export function wrapPacoPublicKeyPem(base64OneLine) {
  const body = base64OneLine.replace(/\s/g, '');
  return `-----BEGIN PUBLIC KEY-----\n${body}\n-----END PUBLIC KEY-----`;
}

/**
 * @returns {null | {
 *   merchantId: string,
 *   kid: string,
 *   accessToken: string,
 *   merchantSigningPem: string,
 *   merchantDecryptionPem: string,
 *   pacoEncryptionPem: string,
 *   pacoSigningPem: string,
 *   sourcePath: string
 * }}
 */
export function readMandalaPacoCredentialsSync() {
  if (process.env.PACO_IGNORE_MANDALA_FILE === '1') {
    return null;
  }
  const rel = process.env.PACO_MANDALA_SECURITY_DATA_PATH || DEFAULT_RELATIVE;
  const abs = path.isAbsolute(rel) ? rel : path.join(process.cwd(), rel);
  if (!fs.existsSync(abs)) {
    return null;
  }
  const content = fs.readFileSync(abs, 'utf8');
  const merchantId = extractFromPhp(content, 'MerchantId');
  const kid = extractFromPhp(content, 'EncryptionKeyId');
  const accessToken = extractFromPhp(content, 'AccessToken');
  const signB64 = extractFromPhp(content, 'MerchantSigningPrivateKey');
  const decB64 = extractFromPhp(content, 'MerchantDecryptionPrivateKey');
  const encPubB64 = extractFromPhp(content, 'PacoEncryptionPublicKey');
  const sigPubB64 = extractFromPhp(content, 'PacoSigningPublicKey');

  return {
    merchantId,
    kid,
    accessToken,
    merchantSigningPem: wrapMerchantPrivateKeyPem(signB64),
    merchantDecryptionPem: wrapMerchantPrivateKeyPem(decB64),
    pacoEncryptionPem: wrapPacoPublicKeyPem(encPubB64),
    pacoSigningPem: wrapPacoPublicKeyPem(sigPubB64),
    sourcePath: abs,
  };
}
