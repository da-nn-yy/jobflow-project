import type { WorkflowInstance } from "../domain/workflow-instance.js";
import type { JobDefinition } from "../domain/job-definition.js";
import { TaskStatus } from "../domain/types.js";

export interface RunReport {
  runId: string;
  jobId: string;
  jobName: string;
  state: string;
  durationMs: number | null;
  taskSummary: Record<string, number>;
  failures: Array<{ taskId: string; message: string; attempts: number }>;
  timeline: Array<{ at: string; event: string; from: string; to: string }>;
}

export class RunReportBuilder {
  build(workflow: WorkflowInstance, definition: JobDefinition, finishedAt?: string): RunReport {
    const started = new Date(workflow.createdAt).getTime();
    const ended = finishedAt ? new Date(finishedAt).getTime() : Date.now();
    const taskSummary: Record<string, number> = {};
    for (const t of workflow.tasks) {
      taskSummary[t.status] = (taskSummary[t.status] ?? 0) + 1;
    }
    const failures = workflow.tasks
      .filter((t) => t.status === TaskStatus.Failed || t.status === TaskStatus.Retrying)
      .map((t) => ({
        taskId: t.definitionTaskId,
        message: t.errorMessage ?? "unknown",
        attempts: t.attempt,
      }));

    return {
      runId: workflow.runId,
      jobId: workflow.jobId,
      jobName: definition.name,
      state: workflow.state,
      durationMs: ended - started,
      taskSummary,
      failures,
      timeline: workflow.history.map((h) => ({
        at: h.at,
        event: h.event,
        from: h.from,
        to: h.to,
      })),
    };
  }
}
