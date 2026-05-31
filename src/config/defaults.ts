import type { RetryPolicy } from "../domain/types.js";

export interface EngineConfig {
  port: number;
  workerConcurrency: number;
  defaultTaskTimeoutMs: number;
  defaultRetryPolicy: RetryPolicy;
  transitionRulesPath?: string;
  logLevel: "debug" | "info" | "warn" | "error";
  simulateLatencyMs: { min: number; max: number };
  failRatePercent: number;
}

export const DEFAULT_CONFIG: EngineConfig = {
  port: 4100,
  workerConcurrency: 4,
  defaultTaskTimeoutMs: 30_000,
  defaultRetryPolicy: {
    maxAttempts: 3,
    initialDelayMs: 500,
    backoffMultiplier: 2,
    maxDelayMs: 30_000,
  },
  logLevel: "info",
  simulateLatencyMs: { min: 10, max: 120 },
  failRatePercent: 0,
};
