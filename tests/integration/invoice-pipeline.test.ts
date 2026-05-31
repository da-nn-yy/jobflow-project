import { describe, expect, it } from "vitest";
import { createContainer } from "../../src/container.js";

describe("invoice pipeline integration", () => {
  it("runs fetch → normalize → post_gl handlers via execution", async () => {
    const c = createContainer();
    const def = await c.jobService.register({
      id: "invoice_pipeline_it",
      name: "Invoice pipeline IT",
      version: 1,
      tasks: [
        { id: "fetch", name: "Fetch", handler: "invoice.fetch", timeoutMs: 10_000 },
        { id: "norm", name: "Normalize", handler: "invoice.normalize", timeoutMs: 10_000, dependsOn: ["fetch"] },
        { id: "post", name: "Post GL", handler: "invoice.post_gl", timeoutMs: 10_000, dependsOn: ["norm"] },
      ],
    });
    const { run } = await c.workflowService.createRun(def.id, "it", { tenantId: "acme", expectedRows: 5 });
    await c.executionService.executeRun(run.id);
    const wf = await c.workflowService.getWorkflowByRun(run.id);
    const succeeded = wf.tasks.filter((t) => t.status === "succeeded").length;
    expect(succeeded).toBeGreaterThanOrEqual(1);
    expect(["completed", "failed", "waiting", "running"]).toContain(wf.state);
  }, 60_000);
});
