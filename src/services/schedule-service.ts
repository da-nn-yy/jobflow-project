import { randomUUID } from "node:crypto";
import type { CronSchedule, ScheduleId } from "../domain/schedule.js";
import type { JobId } from "../domain/types.js";
import type { TenantId } from "../domain/tenant.js";
import { InMemoryScheduleStore } from "../storage/memory/schedule-store.js";
import { matchesCron, nextCronRun } from "../utils/cron.js";
import type { Clock } from "../utils/clock.js";
import { ValidationError } from "../domain/errors.js";

export class ScheduleService {
  constructor(
    private readonly store: InMemoryScheduleStore,
    private readonly clock: Clock,
  ) {}

  async create(input: {
    tenantId: TenantId;
    jobId: JobId;
    cronExpression: string;
    timezone?: string;
    defaultInput?: Record<string, unknown>;
  }): Promise<CronSchedule> {
    try {
      nextCronRun(input.cronExpression, this.clock.now());
    } catch {
      throw new ValidationError(`invalid cron expression: ${input.cronExpression}`);
    }
    const now = this.clock.nowIso();
    const schedule: CronSchedule = {
      id: `sched_${randomUUID().slice(0, 10)}` as ScheduleId,
      tenantId: input.tenantId,
      jobId: input.jobId,
      cronExpression: input.cronExpression,
      timezone: input.timezone ?? "UTC",
      enabled: true,
      defaultInput: input.defaultInput ?? {},
      createdAt: now,
      nextRunAt: nextCronRun(input.cronExpression, this.clock.now()).toISOString(),
    };
    await this.store.save(schedule);
    return schedule;
  }

  async dueSchedules(): Promise<CronSchedule[]> {
    const enabled = await this.store.listEnabled();
    const now = this.clock.now();
    return enabled.filter((s) => {
      if (!s.nextRunAt) return matchesCron(s.cronExpression, now);
      return new Date(s.nextRunAt) <= now;
    });
  }

  async markTriggered(schedule: CronSchedule): Promise<CronSchedule> {
    const next = nextCronRun(schedule.cronExpression, this.clock.now());
    const updated: CronSchedule = {
      ...schedule,
      lastTriggeredAt: this.clock.nowIso(),
      nextRunAt: next.toISOString(),
    };
    await this.store.save(updated);
    return updated;
  }

  async listByTenant(tenantId: TenantId): Promise<CronSchedule[]> {
    return this.store.listByTenant(tenantId);
  }

  async disable(id: ScheduleId): Promise<void> {
    const s = await this.store.get(id);
    if (!s) throw new ValidationError(`schedule not found: ${id}`);
    await this.store.save({ ...s, enabled: false });
  }
}
