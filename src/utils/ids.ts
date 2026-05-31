import { randomUUID } from "node:crypto";
import type { JobId, RunId, TaskId, WorkflowId } from "../domain/types.js";

export function newJobId(): JobId {
  return `job_${randomUUID().slice(0, 12)}` as JobId;
}

export function newWorkflowId(): WorkflowId {
  return `wf_${randomUUID().slice(0, 12)}` as WorkflowId;
}

export function newRunId(): RunId {
  return `run_${randomUUID().slice(0, 12)}` as RunId;
}

export function newTaskId(): TaskId {
  return `task_${randomUUID().slice(0, 12)}` as TaskId;
}

export function asJobId(id: string): JobId {
  return id as JobId;
}

export function asRunId(id: string): RunId {
  return id as RunId;
}

export function asWorkflowId(id: string): WorkflowId {
  return id as WorkflowId;
}

export function asTaskId(id: string): TaskId {
  return id as TaskId;
}
