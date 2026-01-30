/**
 * Image Callback URL Signature Utilities
 * Generates and verifies signed callback URLs for AI provider webhooks
 */

import crypto from 'crypto';

const CALLBACK_SECRET =
  process.env.AI_CALLBACK_SECRET || 'default-secret-change-me';
const SIGNATURE_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Generate a signed callback URL with image UUID and signature
 */
export function generateSignedImageCallbackUrl(
  baseUrl: string,
  imageUuid: string
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = generateSignature(imageUuid, timestamp);

  const url = new URL(baseUrl);
  url.searchParams.set('imageUuid', imageUuid);
  url.searchParams.set('ts', timestamp);
  url.searchParams.set('sig', signature);

  return url.toString();
}

/**
 * Verify callback signature
 */
export function verifyImageCallbackSignature(
  imageUuid: string,
  timestamp: string,
  signature: string
): { valid: boolean; error?: string } {
  // Check timestamp expiry
  const ts = Number.parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);

  if (Number.isNaN(ts)) {
    return { valid: false, error: 'Invalid timestamp' };
  }

  if (now - ts > SIGNATURE_EXPIRY_SECONDS) {
    return { valid: false, error: 'Signature expired' };
  }

  // Verify signature
  const expectedSignature = generateSignature(imageUuid, timestamp);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true };
}

/**
 * Generate HMAC-SHA256 signature
 */
function generateSignature(imageUuid: string, timestamp: string): string {
  const data = `${imageUuid}:${timestamp}`;
  return crypto
    .createHmac('sha256', CALLBACK_SECRET)
    .update(data)
    .digest('hex');
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}
