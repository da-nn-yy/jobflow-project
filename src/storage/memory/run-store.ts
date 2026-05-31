import type { JobRun } from "../../domain/workflow-instance.js";
import { WorkflowState, type JobId, type RunId } from "../../domain/types.js";
import type { RunStore } from "../interfaces.js";

export class InMemoryRunStore implements RunStore {
  private readonly byId = new Map<RunId, JobRun>();

  async save(run: JobRun): Promise<void> {
    this.byId.set(run.id, run);
  }

  async get(id: RunId): Promise<JobRun | undefined> {
    return this.byId.get(id);
  }

  async listByJob(jobId: JobId): Promise<JobRun[]> {
    return [...this.byId.values()].filter((r) => r.jobId === jobId);
  }

  async listActive(): Promise<JobRun[]> {
    const active: WorkflowState[] = [WorkflowState.Pending, WorkflowState.Running, WorkflowState.Waiting];
    return [...this.byId.values()].filter((r) => active.includes(r.status));
  }
}
