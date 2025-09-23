import type { DomainEvent } from "../domain/events.js";
import type { MetricsRegistry } from "./registry.js";

export class MetricsCollector {
  constructor(private readonly registry: MetricsRegistry) {}

  onDomainEvent(event: DomainEvent): void {
    switch (event.type) {
      case "run.started":
        this.registry.increment("jobflow_runs_started_total", { job_id: event.jobId });
        break;
      case "run.completed":
        this.registry.increment("jobflow_runs_completed_total");
        break;
      case "run.failed":
        this.registry.increment("jobflow_runs_failed_total", { reason: event.reason });
        break;
      case "task.finished":
        this.registry.increment("jobflow_tasks_finished_total", { success: String(event.success) });
        break;
      case "task.retry_scheduled":
        this.registry.increment("jobflow_task_retries_total");
        break;
      default:
        break;
    }
  }

  recordTaskDuration(handler: string, ms: number): void {
    this.registry.observe("jobflow_task_duration_ms", ms, { handler });
  }
}
