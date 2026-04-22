import type { RunId } from "../domain/types.js";
import type { WorkflowService } from "../services/workflow-service.js";
import type { ExecutionService } from "../services/execution-service.js";
import type { WorkflowStore } from "../storage/interfaces.js";
import { diffWorkflows } from "./diff.js";
import type { WorkflowDiff } from "./diff.js";
import type { Logger } from "../utils/logger.js";

export class RunReplayer {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly execution: ExecutionService,
    private readonly workflowStore: WorkflowStore,
    private readonly log: Logger,
  ) {}

  async replay(runId: RunId): Promise<WorkflowDiff> {
    const before = await this.workflows.getWorkflowByRun(runId);
    const snapshot = structuredClone(before);

    await this.execution.executeRun(runId);
    const after = await this.workflows.getWorkflowByRun(runId);
    const diff = diffWorkflows(snapshot, after);

    this.log.info("run replayed", { runId, changes: diff.taskDiffs.length });
    return diff;
  }

  async snapshot(runId: RunId) {
    const wf = await this.workflows.getWorkflowByRun(runId);
    await this.workflowStore.save(structuredClone(wf));
    return wf;
  }
}
