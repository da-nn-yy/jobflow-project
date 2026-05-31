import type { WorkflowInstance } from "../../domain/workflow-instance.js";
import type { RunId, WorkflowId } from "../../domain/types.js";
import type { WorkflowStore } from "../interfaces.js";

export class InMemoryWorkflowStore implements WorkflowStore {
  private readonly byId = new Map<WorkflowId, WorkflowInstance>();
  private readonly byRunId = new Map<RunId, WorkflowId>();

  async save(instance: WorkflowInstance): Promise<void> {
    this.byId.set(instance.id, instance);
    this.byRunId.set(instance.runId, instance.id);
  }

  async get(id: WorkflowId): Promise<WorkflowInstance | undefined> {
    return this.byId.get(id);
  }

  async getByRunId(runId: RunId): Promise<WorkflowInstance | undefined> {
    const wfId = this.byRunId.get(runId);
    return wfId ? this.byId.get(wfId) : undefined;
  }
}
