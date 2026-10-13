// In-memory limiters. State resets on restart and isn't shared between processes,
// which is fine for a single container. Use Redis if that ever changes.
//
// Every limiter has the same shape so the route can treat them uniformly:
//   retryAfter(key) -> seconds until allowed again, 0 if allowed now
//   reserve(key)    -> record a claim (call right after the check, before any await)
//   release(key)    -> undo the claim (call when the send fails)

// One claim per key per window, e.g. one claim per address per day
export const createCooldown = (windowMs) => {
  const lastClaim = new Map();

  // Drop expired entries so the map doesn't grow forever
  setInterval(() => {
    const now = Date.now();
    for (const [key, time] of lastClaim) {
      if (now - time >= windowMs) lastClaim.delete(key);
    }
  }, windowMs).unref();

  return {
    retryAfter(key) {
      const time = lastClaim.get(key);
      if (time === undefined) return 0;
      return Math.max(0, Math.ceil((time + windowMs - Date.now()) / 1000));
    },
    reserve(key) {
      lastClaim.set(key, Date.now());
    },
    release(key) {
      lastClaim.delete(key);
    },
  };
};

// At most `max` claims in total per fixed window. Ignores the key.
export const createGlobalCap = (max, windowMs) => {
  let windowStart = Date.now();
  let count = 0;

  const rollWindow = () => {
    if (Date.now() - windowStart >= windowMs) {
      windowStart = Date.now();
      count = 0;
    }
  };

  return {
    retryAfter() {
      rollWindow();
      if (count < max) return 0;
      return Math.ceil((windowStart + windowMs - Date.now()) / 1000);
    },
    reserve() {
      count++;
    },
    release() {
      count = Math.max(0, count - 1);
    },
  };
};
