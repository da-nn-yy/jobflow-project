import { describe, expect, it } from "vitest";
import { RunExporter } from "../src/export/run-exporter.js";
import { TaskStatus } from "../src/domain/types.js";
import { asJobId, asRunId, asTaskId, asWorkflowId } from "../src/utils/ids.js";
import { WorkflowState } from "../src/domain/types.js";

describe("RunExporter", () => {
  const wf = {
    id: asWorkflowId("wf1"),
    jobId: asJobId("job1"),
    runId: asRunId("run1"),
    state: WorkflowState.Completed,
    context: {},
    tasks: [
      {
        id: asTaskId("t1"),
        runId: asRunId("run1"),
        definitionTaskId: "a",
        handler: "h",
        status: TaskStatus.Succeeded,
        attempt: 1,
      },
    ],
    history: [],
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };

  it("exports CSV with header", () => {
    const csv = new RunExporter().toCsv(wf);
    expect(csv.split("\n")[0]).toContain("runId");
    expect(csv).toContain("run1");
  });
});
