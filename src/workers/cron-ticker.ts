import type { ScheduleService } from "../services/schedule-service.js";
import type { WorkflowService } from "../services/workflow-service.js";
import type { ExecutionService } from "../services/execution-service.js";
import type { Logger } from "../utils/logger.js";

export class CronTicker {
  private timer?: ReturnType<typeof setInterval>;

  constructor(
    private readonly schedules: ScheduleService,
    private readonly workflows: WorkflowService,
    private readonly execution: ExecutionService,
    private readonly log: Logger,
    private readonly intervalMs = 60_000,
  ) {}

  start(): void {
    this.timer = setInterval(() => void this.tick(), this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    const due = await this.schedules.dueSchedules();
    for (const s of due) {
      const { run } = await this.workflows.createRun(s.jobId, "cron", s.defaultInput);
      await this.schedules.markTriggered(s);
      void this.execution.executeRun(run.id);
      this.log.info("cron triggered run", { scheduleId: s.id, runId: run.id });
    }
  }
}
