import { describe, expect, it } from "vitest";
import { RunAnalyticsEngine } from "../src/analytics/run-analytics.js";
import { TaskStatus, WorkflowState } from "../src/domain/types.js";
import type { WorkflowInstance } from "../src/domain/workflow-instance.js";
import { asJobId, asRunId, asTaskId, asWorkflowId } from "../src/utils/ids.js";

function sampleWorkflow(tasks: WorkflowInstance["tasks"]): WorkflowInstance {
  return {
    id: asWorkflowId("wf_test"),
    jobId: asJobId("job_test"),
    runId: asRunId("run_test"),
    state: WorkflowState.Completed,
    context: {},
    tasks,
    history: [],
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:01:00.000Z",
  };
}

describe("RunAnalyticsEngine", () => {
  const engine = new RunAnalyticsEngine();

  it("summarizes task outcomes and handler breakdown", () => {
    const wf = sampleWorkflow([
      {
        id: asTaskId("t1"),
        runId: asRunId("run_test"),
        definitionTaskId: "fetch",
        handler: "invoice.fetch",
        status: TaskStatus.Succeeded,
        attempt: 1,
        startedAt: "2026-01-01T00:00:00.000Z",
        finishedAt: "2026-01-01T00:00:10.000Z",
      },
      {
        id: asTaskId("t2"),
        runId: asRunId("run_test"),
        definitionTaskId: "norm",
        handler: "invoice.normalize",
        status: TaskStatus.Failed,
        attempt: 2,
        startedAt: "2026-01-01T00:00:11.000Z",
        finishedAt: "2026-01-01T00:00:20.000Z",
        errorMessage: "validation",
      },
    ]);
    const summary = engine.summarize(wf);
    expect(summary.succeeded).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.handlerBreakdown["invoice.fetch"].count).toBe(1);
    expect(summary.criticalPathMs).toBeGreaterThan(0);
  });
});
