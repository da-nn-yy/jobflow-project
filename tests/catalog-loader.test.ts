import { describe, expect, it } from "vitest";
import { CatalogLoader } from "../src/definitions/loader.js";
import { InMemoryJobStore } from "../src/storage/memory/job-store.js";
import { createLogger } from "../src/utils/logger.js";

const log = createLogger({
  logLevel: "error",
  port: 0,
  workerConcurrency: 1,
  defaultTaskTimeoutMs: 1000,
  defaultRetryPolicy: { maxAttempts: 1, initialDelayMs: 1, backoffMultiplier: 1, maxDelayMs: 1 },
  simulateLatencyMs: { min: 0, max: 0 },
  failRatePercent: 0,
});

describe("CatalogLoader", () => {
  it("seeds store when empty", async () => {
    const store = new InMemoryJobStore();
    const loader = new CatalogLoader(store, log);
    const count = await loader.seedIfEmpty();
    expect(count).toBeGreaterThan(50);
    expect((await store.list()).length).toBe(count);
  });

  it("skips seed when jobs already exist", async () => {
    const store = new InMemoryJobStore();
    const loader = new CatalogLoader(store, log);
    await loader.seedIfEmpty();
    const second = await loader.seedIfEmpty();
    expect(second).toBe(0);
  });
});
