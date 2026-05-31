import { describe, expect, it } from "vitest";
import { diffObjects } from "../src/lib/object-diff.js";
import { RunSerializer } from "../src/lib/run-serializer.js";
import { WorkflowState } from "../src/domain/types.js";
import { asJobId, asRunId, asWorkflowId } from "../src/utils/ids.js";

describe("diffObjects", () => {
  it("detects add, remove, and change", () => {
    const diff = diffObjects({ a: 1, b: 2 }, { a: 2, c: 3 });
    expect(diff.some((d) => d.op === "change" && d.path === "a")).toBe(true);
    expect(diff.some((d) => d.op === "remove" && d.path === "b")).toBe(true);
    expect(diff.some((d) => d.op === "add" && d.path === "c")).toBe(true);
  });

  it("diffs nested objects", () => {
    const diff = diffObjects({ meta: { x: 1 } }, { meta: { x: 2 } });
    expect(diff.some((d) => d.path === "meta.x" && d.op === "change")).toBe(true);
  });
});

describe("RunSerializer", () => {
  const serializer = new RunSerializer();

  it("round-trips run bundle", () => {
    const run = {
      id: asRunId("run_1"),
      jobId: asJobId("job_1"),
      workflowId: asWorkflowId("wf_1"),
      status: WorkflowState.Completed,
      startedAt: "2026-01-01T00:00:00.000Z",
      finishedAt: "2026-01-01T00:01:00.000Z",
      trigger: "manual",
      input: { ok: true },
    };
    const workflow = {
      id: asWorkflowId("wf_1"),
      jobId: asJobId("job_1"),
      runId: asRunId("run_1"),
      state: WorkflowState.Completed,
      context: { secret: "x" },
      tasks: [],
      history: [],
      version: 1,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:01:00.000Z",
    };
    const raw = serializer.serialize(run, workflow);
    const parsed = serializer.deserialize(raw);
    expect(parsed.run.id).toBe("run_1");
    expect(parsed.workflow.context.secret).toBe("x");
  });

  it("redacts sensitive context keys", () => {
    const bundle = serializer.deserialize(
      serializer.serialize(
        {
          id: asRunId("run_1"),
          jobId: asJobId("job_1"),
          workflowId: asWorkflowId("wf_1"),
          status: WorkflowState.Completed,
          startedAt: "2026-01-01T00:00:00.000Z",
          trigger: "t",
          input: { token: "abc" },
        },
        {
          id: asWorkflowId("wf_1"),
          jobId: asJobId("job_1"),
          runId: asRunId("run_1"),
          state: WorkflowState.Completed,
          context: { token: "abc" },
          tasks: [],
          history: [],
          version: 1,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ),
    );
    const redacted = serializer.redact(bundle, ["token"]);
    expect(redacted.workflow.context.token).toBeUndefined();
    expect(redacted.run.input.token).toBeUndefined();
  });
});
