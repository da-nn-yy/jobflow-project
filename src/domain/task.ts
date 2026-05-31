import type { RunId, TaskId, TaskStatus } from "./types.js";

export interface TaskRun {
  id: TaskId;
  runId: RunId;
  definitionTaskId: string;
  handler: string;
  status: TaskStatus;
  attempt: number;
  startedAt?: string;
  finishedAt?: string;
  output?: Record<string, unknown>;
  errorMessage?: string;
}

export function createTaskRun(
  id: TaskId,
  runId: RunId,
  definitionTaskId: string,
  handler: string,
): TaskRun {
  return {
    id,
    runId,
    definitionTaskId,
    handler,
    status: "queued" as TaskStatus,
    attempt: 0,
  };
}
