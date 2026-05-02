import type { WorkflowInstance } from "../domain/workflow-instance.js";
import { TaskStatus } from "../domain/types.js";

export interface RunExportRow {
  runId: string;
  jobId: string;
  state: string;
  taskId: string;
  taskStatus: string;
  attempt: number;
  error?: string;
}

export class RunExporter {
  toRows(workflow: WorkflowInstance): RunExportRow[] {
    return workflow.tasks.map((t) => ({
      runId: workflow.runId,
      jobId: workflow.jobId,
      state: workflow.state,
      taskId: t.definitionTaskId,
      taskStatus: t.status,
      attempt: t.attempt,
      error: t.errorMessage,
    }));
  }

  toCsv(workflow: WorkflowInstance): string {
    const rows = this.toRows(workflow);
    const header = "runId,jobId,state,taskId,taskStatus,attempt,error";
    const lines = rows.map((r) =>
      [r.runId, r.jobId, r.state, r.taskId, r.taskStatus, r.attempt, r.error ?? ""]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(","),
    );
    return [header, ...lines].join("\n");
  }

  toSummary(workflow: WorkflowInstance): Record<string, unknown> {
    const counts: Record<string, number> = {};
    for (const t of workflow.tasks) {
      counts[t.status] = (counts[t.status] ?? 0) + 1;
    }
    return {
      runId: workflow.runId,
      state: workflow.state,
      taskCount: workflow.tasks.length,
      succeeded: counts[TaskStatus.Succeeded] ?? 0,
      failed: counts[TaskStatus.Failed] ?? 0,
      historyLength: workflow.history.length,
    };
  }
}
