import { describe, expect, it } from "vitest";
import { SqlJobRepository } from "../src/storage/sql/job-repository.js";
import { SqlRunRepository } from "../src/storage/sql/run-repository.js";
import { InMemoryJobStore } from "../src/storage/memory/job-store.js";
import { InMemoryRunStore } from "../src/storage/memory/run-store.js";
import { asJobId, asRunId, asWorkflowId } from "../src/utils/ids.js";
import { WorkflowState } from "../src/domain/types.js";
import { DEFAULT_RETRY_POLICY } from "../src/domain/retry-policy.js";

describe("SQL repository wrappers", () => {
  it("delegates job save and get to inner store", async () => {
    const inner = new InMemoryJobStore();
    const repo = new SqlJobRepository(inner);
    const def = {
      id: asJobId("sql_job"),
      name: "SQL job",
      version: 1,
      tasks: [{ id: "t", name: "T", handler: "invoice.fetch", timeoutMs: 1000 }],
      constraints: [],
      retryPolicy: DEFAULT_RETRY_POLICY,
      allowedTransitions: [],
      metadata: {},
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };
    await repo.save(def);
    expect((await repo.get(def.id))?.name).toBe("SQL job");
  });

  it("delegates run listing to inner store", async () => {
    const inner = new InMemoryRunStore();
    const repo = new SqlRunRepository(inner);
    const run = {
      id: asRunId("sql_run"),
      jobId: asJobId("j"),
      workflowId: asWorkflowId("w"),
      status: WorkflowState.Running,
      startedAt: "2026-01-01T00:00:00.000Z",
      trigger: "test",
      input: {},
    };
    await repo.save(run);
    const active = await repo.listActive();
    expect(active.some((r) => r.id === "sql_run")).toBe(true);
  });
});
