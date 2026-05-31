import { RunAnalyticsEngine } from "../analytics/run-analytics.js";
import { TimeSeriesBuffer } from "../analytics/time-series.js";
import type { WorkflowService } from "./workflow-service.js";
import type { RunId } from "../domain/types.js";

export class AnalyticsService {
  private readonly engine = new RunAnalyticsEngine();
  private readonly series = new TimeSeriesBuffer();

  constructor(private readonly workflows: WorkflowService) {}

  async summarizeRun(runId: RunId) {
    const wf = await this.workflows.getWorkflowByRun(runId);
    const summary = this.engine.summarize(wf);
    this.series.record("run.duration_ms", summary.criticalPathMs);
    this.series.record("run.failed_tasks", summary.failed);
    return summary;
  }

  timeSeries(name: string, since?: string) {
    return this.series.get(name, since);
  }
}
