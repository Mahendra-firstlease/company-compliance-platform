/**
 * Configurable In-Memory Rate Limiter with Sliding Window & Exponential Backoff
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
  consecutiveFailures: number;
  lastFailureTime: number;
}

const store = new Map<string, RateLimitRecord>();

// Periodic cleanup of expired rate limit keys every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime && record.consecutiveFailures === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Configurable thresholds via Environment Variables (with secure defaults)
export const RATE_LIMIT_CONFIGS = {
  auth: {
    maxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX || "5", 10),
    windowMs: parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS || "900000", 10), // 15 mins
  },
  publicApi: {
    maxRequests: parseInt(process.env.RATE_LIMIT_PUBLIC_MAX || "15", 10),
    windowMs: parseInt(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS || "60000", 10), // 1 min
  },
  userApi: {
    maxRequests: parseInt(process.env.RATE_LIMIT_USER_MAX || "180", 10),
    windowMs: parseInt(process.env.RATE_LIMIT_USER_WINDOW_MS || "60000", 10), // 1 min
  },
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + config.windowMs,
      consecutiveFailures: record?.consecutiveFailures || 0,
      lastFailureTime: record?.lastFailureTime || 0,
    };
    store.set(identifier, newRecord);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: Math.ceil(newRecord.resetTime / 1000),
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: Math.ceil(record.resetTime / 1000),
    };
  }

  record.count += 1;
  store.set(identifier, record);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    reset: Math.ceil(record.resetTime / 1000),
  };
}

/**
 * Exponential Backoff Rate Limiting for Auth Failures (Per IP + Per Account)
 */
export function recordAuthFailure(identifier: string): number {
  const now = Date.now();
  const record = store.get(identifier) || {
    count: 0,
    resetTime: now + 900000,
    consecutiveFailures: 0,
    lastFailureTime: 0,
  };

  record.consecutiveFailures += 1;
  record.lastFailureTime = now;
  store.set(identifier, record);

  // Exponential delay: 2^(failures - 1) * 1000ms (Max 5 minutes)
  const backoffMs = Math.min(
    Math.pow(2, record.consecutiveFailures - 1) * 1000,
    300000
  );
  return backoffMs;
}

export function resetAuthFailures(identifier: string): void {
  const record = store.get(identifier);
  if (record) {
    record.consecutiveFailures = 0;
    store.set(identifier, record);
  }
}
