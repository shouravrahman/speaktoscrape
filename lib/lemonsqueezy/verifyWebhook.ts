import crypto from 'crypto';

/**
 * Verifies the signature of a Lemon Squeezy webhook request.
 *
 * @param {Buffer} rawBody The raw request body.
 * @param {string} signature The 'x-signature' header from the request.
 * @param {string} secret The webhook secret from your Lemon Squeezy dashboard.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
export const verifyWebhookSignature = (rawBody: Buffer, signature: string, secret: string): boolean => {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const receivedSignature = Buffer.from(signature, 'utf8');

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(digest, receivedSignature);
};
