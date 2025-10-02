// Simple in-memory rate limiting for production
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number = 15 * 60 * 1000; // 15 minutes
  private maxRequests: number = 100; // Max requests per window

  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up old entries
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < windowStart) {
        delete this.store[key];
      }
    });

    // Get or create entry for this identifier
    if (!this.store[identifier] || this.store[identifier].resetTime < windowStart) {
      this.store[identifier] = {
        count: 0,
        resetTime: now + this.windowMs
      };
    }

    const entry = this.store[identifier];
    entry.count++;

    return {
      allowed: entry.count <= this.maxRequests,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }
}

export const rateLimiter = new RateLimiter();