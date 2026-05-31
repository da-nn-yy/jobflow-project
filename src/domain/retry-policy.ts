import type { RetryPolicy } from "./types.js";

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  initialDelayMs: 500,
  backoffMultiplier: 2,
  maxDelayMs: 30_000,
};

export function computeBackoffDelay(policy: RetryPolicy, attempt: number): number {
  if (attempt <= 0) {
    return policy.initialDelayMs;
  }
  const raw = policy.initialDelayMs * Math.pow(policy.backoffMultiplier, attempt - 1);
  return Math.min(Math.floor(raw), policy.maxDelayMs);
}

export function shouldRetry(policy: RetryPolicy, attempt: number): boolean {
  return attempt < policy.maxAttempts;
}
