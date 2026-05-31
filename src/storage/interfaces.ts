import type { JobDefinition } from "../domain/job-definition.js";
import type { JobRun } from "../domain/workflow-instance.js";
import type { WorkflowInstance } from "../domain/workflow-instance.js";
import type { JobId, RunId, WorkflowId } from "../domain/types.js";

export interface JobDefinitionStore {
  save(definition: JobDefinition): Promise<void>;
  get(id: JobId): Promise<JobDefinition | undefined>;
  list(): Promise<JobDefinition[]>;
  delete(id: JobId): Promise<boolean>;
}

export interface WorkflowStore {
  save(instance: WorkflowInstance): Promise<void>;
  get(id: WorkflowId): Promise<WorkflowInstance | undefined>;
  getByRunId(runId: RunId): Promise<WorkflowInstance | undefined>;
}

export interface RunStore {
  save(run: JobRun): Promise<void>;
  get(id: RunId): Promise<JobRun | undefined>;
  listByJob(jobId: JobId): Promise<JobRun[]>;
  listActive(): Promise<JobRun[]>;
}

export interface DeadLetterStore {
  push(runId: RunId, payload: Record<string, unknown>): Promise<void>;
  list(limit?: number): Promise<Array<{ runId: RunId; payload: Record<string, unknown>; at: string }>>;
}
