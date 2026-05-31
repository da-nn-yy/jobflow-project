import type { JobId, RunId, WorkflowId, WorkflowState } from "./types.js";
import type { TaskRun } from "./task.js";

export interface WorkflowInstance {
  id: WorkflowId;
  jobId: JobId;
  runId: RunId;
  state: WorkflowState;
  currentTaskId?: string;
  context: Record<string, unknown>;
  tasks: TaskRun[];
  history: WorkflowHistoryEntry[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowHistoryEntry {
  at: string;
  from: WorkflowState;
  to: WorkflowState;
  event: string;
  actor: string;
  note?: string;
}

export interface JobRun {
  id: RunId;
  jobId: JobId;
  workflowId: WorkflowId;
  status: WorkflowState;
  startedAt: string;
  finishedAt?: string;
  trigger: string;
  input: Record<string, unknown>;
}
