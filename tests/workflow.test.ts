import { describe, expect, it } from "vitest";
import { InMemoryJobStore } from "../src/storage/memory/job-store.js";
import { InMemoryWorkflowStore } from "../src/storage/memory/workflow-store.js";
import { InMemoryRunStore } from "../src/storage/memory/run-store.js";
import { JobService } from "../src/services/job-service.js";
import { WorkflowService } from "../src/services/workflow-service.js";
import { FakeClock } from "../src/utils/clock.js";
import { createLogger } from "../src/utils/logger.js";
import { loadConfigSync } from "../src/config/loader.js";
import { asJobId } from "../src/utils/ids.js";

describe("WorkflowService", () => {
  const clock = new FakeClock();
  const log = createLogger(loadConfigSync());
  const jobStore = new InMemoryJobStore();
  const workflowStore = new InMemoryWorkflowStore();
  const runStore = new InMemoryRunStore();
  const jobs = new JobService(jobStore, clock, log);
  const workflows = new WorkflowService(jobStore, workflowStore, runStore, clock);

  it("creates pending run with task queue", async () => {
    const def = await jobs.register({
      id: "onboard_customer",
      name: "Customer onboarding",
      version: 1,
      tasks: [
        { id: "validate", name: "Validate", handler: "onboard.validate", timeoutMs: 5000 },
        { id: "provision", name: "Provision", handler: "onboard.provision", timeoutMs: 10000, dependsOn: ["validate"] },
      ],
    });

    const { run, workflow } = await workflows.createRun(asJobId(def.id), "test");
    expect(run.status).toBe("pending");
    expect(workflow.tasks).toHaveLength(2);
    expect(workflow.tasks[0].status).toBe("queued");
  });
});
