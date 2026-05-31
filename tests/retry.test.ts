import { describe, expect, it } from "vitest";
import { computeBackoffDelay, shouldRetry } from "../src/domain/retry-policy.js";
import { RetryHandler } from "../src/workers/retry-handler.js";
import { FakeClock } from "../src/utils/clock.js";
import { TaskStatus } from "../src/domain/types.js";
import type { TaskRun } from "../src/domain/task.js";
import { asRunId, asTaskId } from "../src/utils/ids.js";
// vitest resolves .js imports to ids module

const policy = {
  maxAttempts: 3,
  initialDelayMs: 100,
  backoffMultiplier: 2,
  maxDelayMs: 1000,
};

describe("retry policy", () => {
  it("computes exponential backoff capped at maxDelayMs", () => {
    expect(computeBackoffDelay(policy, 1)).toBe(100);
    expect(computeBackoffDelay(policy, 2)).toBe(200);
    expect(computeBackoffDelay(policy, 10)).toBe(1000);
  });

  it("shouldRetry respects maxAttempts", () => {
    expect(shouldRetry(policy, 2)).toBe(true);
    expect(shouldRetry(policy, 3)).toBe(false);
  });
});

describe("RetryHandler", () => {
  const handler = new RetryHandler(new FakeClock());

  const task: TaskRun = {
    id: asTaskId("t1"),
    runId: asRunId("r1"),
    definitionTaskId: "a",
    handler: "h",
    status: TaskStatus.Failed,
    attempt: 1,
  };

  it("schedules retry when attempts remain", () => {
    const d = handler.decide(policy, task);
    expect(d.retry).toBe(true);
    expect(d.delayMs).toBeGreaterThan(0);
  });
});
