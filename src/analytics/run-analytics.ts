import type { WorkflowInstance } from "../domain/workflow-instance.js";
import { TaskStatus } from "../domain/types.js";

export interface RunAnalyticsSummary {
  runId: string;
  totalTasks: number;
  succeeded: number;
  failed: number;
  retrying: number;
  averageAttempts: number;
  criticalPathMs: number;
  handlerBreakdown: Record<string, { count: number; failed: number }>;
}

export class RunAnalyticsEngine {
  summarize(workflow: WorkflowInstance): RunAnalyticsSummary {
    const handlerBreakdown: Record<string, { count: number; failed: number }> = {};
    let succeeded = 0;
    let failed = 0;
    let retrying = 0;
    let attemptSum = 0;

    for (const t of workflow.tasks) {
      attemptSum += t.attempt;
      const h = handlerBreakdown[t.handler] ?? { count: 0, failed: 0 };
      h.count += 1;
      if (t.status === TaskStatus.Failed) h.failed += 1;
      handlerBreakdown[t.handler] = h;
      if (t.status === TaskStatus.Succeeded) succeeded += 1;
      if (t.status === TaskStatus.Failed) failed += 1;
      if (t.status === TaskStatus.Retrying) retrying += 1;
    }

    return {
      runId: workflow.runId,
      totalTasks: workflow.tasks.length,
      succeeded,
      failed,
      retrying,
      averageAttempts: workflow.tasks.length ? attemptSum / workflow.tasks.length : 0,
      criticalPathMs: this.estimateCriticalPath(workflow),
      handlerBreakdown,
    };
  }

  private estimateCriticalPath(workflow: WorkflowInstance): number {
    return workflow.tasks.reduce((sum, t) => {
      const start = t.startedAt ? new Date(t.startedAt).getTime() : 0;
      const end = t.finishedAt ? new Date(t.finishedAt).getTime() : start;
      return sum + Math.max(0, end - start);
    }, 0);
  }
}
