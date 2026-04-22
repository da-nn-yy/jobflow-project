import type { WorkflowInstance } from "../domain/workflow-instance.js";
import { TaskStatus } from "../domain/types.js";

export interface TaskDiff {
  taskId: string;
  field: string;
  before: string;
  after: string;
}

export interface WorkflowDiff {
  runId: string;
  stateChanged: boolean;
  fromState?: string;
  toState?: string;
  taskDiffs: TaskDiff[];
}

export function diffWorkflows(before: WorkflowInstance, after: WorkflowInstance): WorkflowDiff {
  const taskDiffs: TaskDiff[] = [];
  const beforeById = new Map(before.tasks.map((t) => [t.definitionTaskId, t]));

  for (const t of after.tasks) {
    const prev = beforeById.get(t.definitionTaskId);
    if (!prev) {
      taskDiffs.push({ taskId: t.definitionTaskId, field: "status", before: "missing", after: t.status });
      continue;
    }
    if (prev.status !== t.status) {
      taskDiffs.push({ taskId: t.definitionTaskId, field: "status", before: prev.status, after: t.status });
    }
    if (prev.attempt !== t.attempt) {
      taskDiffs.push({
        taskId: t.definitionTaskId,
        field: "attempt",
        before: String(prev.attempt),
        after: String(t.attempt),
      });
    }
    if (prev.errorMessage !== t.errorMessage) {
      taskDiffs.push({
        taskId: t.definitionTaskId,
        field: "error",
        before: prev.errorMessage ?? "",
        after: t.errorMessage ?? "",
      });
    }
  }

  return {
    runId: after.runId,
    stateChanged: before.state !== after.state,
    fromState: before.state,
    toState: after.state,
    taskDiffs,
  };
}

export function countFailedTasks(wf: WorkflowInstance): number {
  return wf.tasks.filter((t) => t.status === TaskStatus.Failed).length;
}
