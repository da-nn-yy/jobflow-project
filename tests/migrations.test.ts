import { describe, expect, it } from "vitest";
import { MigrationRunner } from "../src/migrations/runner.js";
import { createLogger } from "../src/utils/logger.js";

describe("MigrationRunner", () => {
  it("applies all migrations in order", async () => {
    const runner = new MigrationRunner(createLogger({ logLevel: "error", port: 0, workerConcurrency: 1, defaultTaskTimeoutMs: 1000, defaultRetryPolicy: { maxAttempts: 1, initialDelayMs: 1, backoffMultiplier: 1, maxDelayMs: 1 }, simulateLatencyMs: { min: 0, max: 0 }, failRatePercent: 0 }));
    const count = await runner.migrate();
    expect(count).toBe(3);
    expect(runner.currentVersion()).toBe(3);
  });

  it("respects migration target version", async () => {
    const runner = new MigrationRunner(createLogger({ logLevel: "error", port: 0, workerConcurrency: 1, defaultTaskTimeoutMs: 1000, defaultRetryPolicy: { maxAttempts: 1, initialDelayMs: 1, backoffMultiplier: 1, maxDelayMs: 1 }, simulateLatencyMs: { min: 0, max: 0 }, failRatePercent: 0 }));
    const count = await runner.migrate(1);
    expect(count).toBe(1);
    expect(runner.currentVersion()).toBe(1);
  });
});
