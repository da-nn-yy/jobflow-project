import type { JobRun } from "../domain/workflow-instance.js";
import { WorkflowState } from "../domain/types.js";

export interface RunFilter {
  status?: WorkflowState[];
  jobId?: string;
  triggerPrefix?: string;
  since?: string;
  until?: string;
}

export function filterRuns(runs: JobRun[], filter: RunFilter): JobRun[] {
  return runs.filter((r) => {
    if (filter.status?.length && !filter.status.includes(r.status)) return false;
    if (filter.jobId && r.jobId !== filter.jobId) return false;
    if (filter.triggerPrefix && !r.trigger.startsWith(filter.triggerPrefix)) return false;
    if (filter.since && r.startedAt < filter.since) return false;
    if (filter.until && r.finishedAt && r.finishedAt > filter.until) return false;
    return true;
  });
}

export function sortRuns(runs: JobRun[], by: "startedAt" | "finishedAt" = "startedAt", desc = true): JobRun[] {
  return [...runs].sort((a, b) => {
    const av = by === "startedAt" ? a.startedAt : (a.finishedAt ?? "");
    const bv = by === "startedAt" ? b.startedAt : (b.finishedAt ?? "");
    return desc ? bv.localeCompare(av) : av.localeCompare(bv);
  });
}
