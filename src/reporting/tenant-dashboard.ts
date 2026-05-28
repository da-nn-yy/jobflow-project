import type { JobRun } from "../domain/workflow-instance.js";
import { WorkflowState } from "../domain/types.js";

export interface TenantDashboardStats {
  activeRuns: number;
  completedToday: number;
  failedToday: number;
  averageDurationMs: number;
  byJob: Record<string, { runs: number; failed: number }>;
}

export class TenantDashboardAggregator {
  aggregate(runs: JobRun[], sinceIso: string): TenantDashboardStats {
    const since = new Date(sinceIso).getTime();
    const recent = runs.filter((r) => new Date(r.startedAt).getTime() >= since);

    let totalDuration = 0;
    let durationCount = 0;
    const byJob: Record<string, { runs: number; failed: number }> = {};

    for (const r of recent) {
      const entry = byJob[r.jobId] ?? { runs: 0, failed: 0 };
      entry.runs += 1;
      if (r.status === WorkflowState.Failed) entry.failed += 1;
      byJob[r.jobId] = entry;
      if (r.finishedAt) {
        totalDuration += new Date(r.finishedAt).getTime() - new Date(r.startedAt).getTime();
        durationCount += 1;
      }
    }

    const active = runs.filter((r) =>
      [WorkflowState.Pending, WorkflowState.Running, WorkflowState.Waiting].includes(r.status),
    );

    return {
      activeRuns: active.length,
      completedToday: recent.filter((r) => r.status === WorkflowState.Completed).length,
      failedToday: recent.filter((r) => r.status === WorkflowState.Failed).length,
      averageDurationMs: durationCount ? Math.round(totalDuration / durationCount) : 0,
      byJob,
    };
  }
}
