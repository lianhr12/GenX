/**
 * Callback URL Signature Utilities
 * Generates and verifies signed callback URLs for AI provider webhooks
 */

import crypto from 'crypto';

const CALLBACK_SECRET = process.env.AI_CALLBACK_SECRET || 'default-secret-change-me';
const SIGNATURE_EXPIRY_SECONDS = 3600; // 1 hour

/**
 * Generate a signed callback URL with video UUID and signature
 */
export function generateSignedCallbackUrl(
  baseUrl: string,
  videoUuid: string
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = generateSignature(videoUuid, timestamp);

  const url = new URL(baseUrl);
  url.searchParams.set('videoUuid', videoUuid);
  url.searchParams.set('ts', timestamp);
  url.searchParams.set('sig', signature);

  return url.toString();
}

/**
 * Verify callback signature
 */
export function verifyCallbackSignature(
  videoUuid: string,
  timestamp: string,
  signature: string
): { valid: boolean; error?: string } {
  // Check timestamp expiry
  const ts = parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);

  if (isNaN(ts)) {
    return { valid: false, error: 'Invalid timestamp' };
  }

  if (now - ts > SIGNATURE_EXPIRY_SECONDS) {
    return { valid: false, error: 'Signature expired' };
  }

  // Verify signature
  const expectedSignature = generateSignature(videoUuid, timestamp);

  if (!timingSafeEqual(signature, expectedSignature)) {
    return { valid: false, error: 'Invalid signature' };
  }

  return { valid: true };
}

/**
 * Generate HMAC-SHA256 signature
 */
function generateSignature(videoUuid: string, timestamp: string): string {
  const data = `${videoUuid}:${timestamp}`;
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
