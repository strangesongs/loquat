const DEDUP_TTL_SECONDS = 86400; // 24 hours

export function confirmDedupKey(pinId, ip) {
  return `confirm:${pinId}:${ip}`;
}

/**
 * Returns true if this IP has already confirmed this pin within the TTL window.
 * Fails open (returns false) if Redis is unavailable.
 */
export async function isDuplicateConfirm(redisClient, pinId, ip) {
  if (!redisClient) return false;
  try {
    return !!(await redisClient.get(confirmDedupKey(pinId, ip)));
  } catch {
    return false;
  }
}

/**
 * Records a confirmation so subsequent calls to isDuplicateConfirm return true.
 * Silently swallows Redis errors — confirmation still proceeds.
 */
export async function markConfirmed(redisClient, pinId, ip) {
  if (!redisClient) return;
  try {
    await redisClient.set(confirmDedupKey(pinId, ip), '1', { EX: DEDUP_TTL_SECONDS });
  } catch {
    // non-critical — dedup just won't apply for this confirmation
  }
}
