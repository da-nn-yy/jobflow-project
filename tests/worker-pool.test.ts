import { describe, expect, it } from "vitest";
import { WorkerPool } from "../src/workers/pool.js";
import { RunPriority } from "../src/domain/priority.js";

describe("WorkerPool", () => {
  it("orders queue by priority", () => {
    const pool = new WorkerPool(2);
    pool.enqueue({ runId: "low", priority: RunPriority.Low, enqueuedAt: "t1" });
    pool.enqueue({ runId: "high", priority: RunPriority.High, enqueuedAt: "t2" });
    pool.enqueue({ runId: "normal", priority: RunPriority.Normal, enqueuedAt: "t3" });
    expect(pool.start()?.runId).toBe("high");
    expect(pool.start()?.runId).toBe("normal");
    expect(pool.canAccept()).toBe(false);
    pool.complete();
    expect(pool.canAccept()).toBe(true);
    expect(pool.start()?.runId).toBe("low");
  });

  it("tracks queue depth", () => {
    const pool = new WorkerPool(1);
    pool.enqueue({ runId: "a", priority: RunPriority.Normal, enqueuedAt: "t" });
    expect(pool.depth()).toBe(1);
    pool.start();
    expect(pool.depth()).toBe(0);
  });
});
