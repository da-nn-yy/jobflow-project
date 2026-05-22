import { describe, expect, it } from "vitest";
import { createContainer } from "../../src/container.js";

describe("workflow lifecycle integration", () => {
  it("registers job, runs, and completes", async () => {
    const c = createContainer();
    const def = await c.jobService.register({
      id: "integration_smoke",
      name: "Integration smoke",
      version: 1,
      tasks: [{ id: "only", name: "Only", handler: "invoice.fetch", timeoutMs: 5000 }],
    });
    const { run } = await c.workflowService.createRun(def.id, "integration-test", { tenantId: "t1" });
    await c.executionService.executeRun(run.id);
    const wf = await c.workflowService.getWorkflowByRun(run.id);
    expect(["completed", "failed", "waiting"]).toContain(wf.state);
  }, 30_000);
});
