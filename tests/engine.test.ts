import { describe, expect, it } from "vitest";
import { WorkflowStateMachine } from "../src/engine/state-machine.js";
import { TransitionValidator, DEFAULT_TRANSITION_RULES } from "../src/validators/transition-validator.js";
import { FakeClock } from "../src/utils/clock.js";
import { WorkflowState } from "../src/domain/types.js";
import type { WorkflowInstance } from "../src/domain/workflow-instance.js";
import { asJobId, asRunId, asTaskId, asWorkflowId } from "../src/utils/ids.js";
import { TaskStatus } from "../src/domain/types.js";
import { TransitionGuard } from "../src/engine/transition-guard.js";

function sampleWorkflow(): WorkflowInstance {
  return {
    id: asWorkflowId("wf1"),
    jobId: asJobId("job1"),
    runId: asRunId("run1"),
    state: WorkflowState.Running,
    context: {},
    tasks: [],
    history: [],
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("WorkflowStateMachine", () => {
  const sm = new WorkflowStateMachine(new TransitionValidator(DEFAULT_TRANSITION_RULES), new FakeClock());

  it("records history on transition", () => {
    const wf = sampleWorkflow();
    const next = sm.transition(wf, "fail", WorkflowState.Failed, "test", "unit");
    expect(next.state).toBe(WorkflowState.Failed);
    expect(next.history).toHaveLength(1);
    expect(next.version).toBe(2);
  });
});

describe("TransitionGuard", () => {
  const guard = new TransitionGuard();

  it("blocks complete when tasks incomplete", () => {
    const wf = sampleWorkflow();
    wf.tasks = [
      {
        id: asTaskId("t1"),
        runId: wf.runId,
        definitionTaskId: "step1",
        handler: "h",
        status: TaskStatus.Queued,
        attempt: 0,
      },
    ];
    expect(() =>
      guard.evaluate({ instance: wf, event: "complete", target: WorkflowState.Completed }),
    ).toThrow();
  });
});
