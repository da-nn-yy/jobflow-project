import { describe, expect, it } from "vitest";
import { TenantService } from "../src/services/tenant-service.js";
import { InMemoryJobStore } from "../src/storage/memory/job-store.js";
import { InMemoryRunStore } from "../src/storage/memory/run-store.js";
import type { TenantId } from "../src/domain/tenant.js";
import { WorkflowState } from "../src/domain/types.js";
import { asJobId, asRunId, asWorkflowId } from "../src/utils/ids.js";

const asTenantId = (id: string) => id as TenantId;

describe("TenantService", () => {
  it("registers tenant with default quotas", () => {
    const svc = new TenantService(new InMemoryJobStore(), new InMemoryRunStore());
    const ctx = svc.register(asTenantId("t1"), "production");
    expect(ctx.quotas.maxConcurrentRuns).toBeGreaterThan(0);
  });

  it("blocks new runs when concurrent quota exceeded", async () => {
    const runs = new InMemoryRunStore();
    const svc = new TenantService(new InMemoryJobStore(), runs);
    const tid = asTenantId("t_quota");
    svc.register(tid, "production");
    const ctx = svc.get(tid)!;
    for (let i = 0; i < ctx.quotas.maxConcurrentRuns; i++) {
      await runs.save({
        id: asRunId(`run_${i}`),
        jobId: asJobId("j"),
        workflowId: asWorkflowId(`w_${i}`),
        status: WorkflowState.Running,
        startedAt: new Date().toISOString(),
        trigger: "t",
        input: {},
      });
    }
    await expect(svc.assertCanStartRun(tid)).rejects.toThrow(/concurrent runs exceeded/);
  });
});
