/**
 * Generates a cryptographic SHA-256 hash to act as a secure, time-sensitive
 * ticket for a session check-in. Prevents screenshot replay attacks.
 */
export async function generateSecureTicket(sessionId: string, userId: string): Promise<string> {
  const timeWindow = Math.floor(Date.now() / 30000);

  const rawData = `${sessionId}-${userId}-${timeWindow}-SKILLSHARE_SECRET_SALT`;

  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(rawData);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const secureHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return secureHash;
}
