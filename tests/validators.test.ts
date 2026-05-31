import { describe, expect, it } from "vitest";
import { JobDefinitionValidator } from "../src/validators/job-definition-validator.js";
import { TransitionValidator, DEFAULT_TRANSITION_RULES } from "../src/validators/transition-validator.js";
import { WorkflowState } from "../src/domain/types.js";
import type { JobDefinition } from "../src/domain/job-definition.js";
import { DEFAULT_RETRY_POLICY } from "../src/domain/retry-policy.js";
import { asJobId } from "../src/utils/ids.js";

function sampleJob(): JobDefinition {
  return {
    id: asJobId("job_test"),
    name: "Test",
    version: 1,
    tasks: [
      { id: "a", name: "A", handler: "handlers.a", timeoutMs: 1000 },
      { id: "b", name: "B", handler: "handlers.b", timeoutMs: 1000, dependsOn: ["a"] },
    ],
    constraints: [],
    retryPolicy: DEFAULT_RETRY_POLICY,
    allowedTransitions: [],
    metadata: {},
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("JobDefinitionValidator", () => {
  const v = new JobDefinitionValidator();

  it("accepts valid DAG", () => {
    expect(() => v.validate(sampleJob())).not.toThrow();
    expect(() => v.validateDependencyOrder(sampleJob().tasks)).not.toThrow();
  });

  it("rejects unknown dependency", () => {
    const job = sampleJob();
    job.tasks[1].dependsOn = ["missing"];
    expect(() => v.validate(job)).toThrow();
  });

  it("detects circular dependencies", () => {
    const job = sampleJob();
    job.tasks[0].dependsOn = ["b"];
    expect(() => v.validateDependencyOrder(job.tasks)).toThrow();
  });
});

describe("TransitionValidator", () => {
  const tv = new TransitionValidator(DEFAULT_TRANSITION_RULES);

  it("allows pending to running on start", () => {
    expect(tv.canTransition(WorkflowState.Pending, WorkflowState.Running, "start")).toBe(true);
  });

  it("denies invalid transition", () => {
    expect(tv.canTransition(WorkflowState.Completed, WorkflowState.Running, "start")).toBe(false);
  });
});
