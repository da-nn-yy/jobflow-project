import { describe, expect, it } from "vitest";
import { filterRuns, sortRuns } from "../src/query/run-filter.js";
import { WorkflowState } from "../src/domain/types.js";
import { asJobId, asRunId, asWorkflowId } from "../src/utils/ids.js";

const runs = [
  {
    id: asRunId("r1"),
    jobId: asJobId("j1"),
    workflowId: asWorkflowId("w1"),
    status: WorkflowState.Completed,
    startedAt: "2026-01-01T00:00:00.000Z",
    finishedAt: "2026-01-01T00:05:00.000Z",
    trigger: "cron-daily",
    input: {},
  },
  {
    id: asRunId("r2"),
    jobId: asJobId("j1"),
    workflowId: asWorkflowId("w2"),
    status: WorkflowState.Failed,
    startedAt: "2026-01-02T00:00:00.000Z",
    trigger: "manual",
    input: {},
  },
];

describe("run-filter", () => {
  it("filters by status and trigger prefix", () => {
    const out = filterRuns(runs, { status: [WorkflowState.Completed], triggerPrefix: "cron" });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("r1");
  });

  it("sorts by startedAt descending", () => {
    const sorted = sortRuns(runs, "startedAt", true);
    expect(sorted[0].id).toBe("r2");
  });
});
