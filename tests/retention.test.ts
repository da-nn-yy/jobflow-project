import { describe, expect, it } from "vitest";
import { RetentionEnforcer, DEFAULT_RETENTION } from "../src/compliance/retention.js";
import { WorkflowState } from "../src/domain/types.js";
import type { TenantId } from "../src/domain/tenant.js";
import { asJobId, asRunId, asWorkflowId } from "../src/utils/ids.js";

const asTenantId = (id: string) => id as TenantId;

describe("RetentionEnforcer", () => {
  const enforcer = new RetentionEnforcer(DEFAULT_RETENTION);
  const now = new Date("2026-06-01T00:00:00.000Z");

  it("filters audit records older than policy", () => {
    const kept = enforcer.filterAudit(
      [
        {
          id: "a1",
          tenantId: asTenantId("t1"),
          at: "2026-05-20T00:00:00.000Z",
          actor: "system",
          action: "run.start",
          resourceType: "run",
          resourceId: "r1",
          metadata: {},
        },
        {
          id: "a2",
          tenantId: asTenantId("t1"),
          at: "2025-01-01T00:00:00.000Z",
          actor: "system",
          action: "run.start",
          resourceType: "run",
          resourceId: "r2",
          metadata: {},
        },
      ],
      now,
    );
    expect(kept).toHaveLength(1);
    expect(kept[0].id).toBe("a1");
  });

  it("flags terminal workflows past retention", () => {
    const wf = {
      id: asWorkflowId("wf_old"),
      jobId: asJobId("j1"),
      runId: asRunId("r1"),
      state: WorkflowState.Completed,
      context: {},
      tasks: [],
      history: [],
      version: 1,
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    };
    expect(enforcer.shouldPurgeWorkflow(wf, now)).toBe(true);
  });
});
