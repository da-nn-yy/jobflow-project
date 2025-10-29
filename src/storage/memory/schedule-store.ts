import type { CronSchedule } from "../../domain/schedule.js";
import type { ScheduleId } from "../../domain/schedule.js";
import type { TenantId } from "../../domain/tenant.js";

export class InMemoryScheduleStore {
  private readonly byId = new Map<ScheduleId, CronSchedule>();

  async save(schedule: CronSchedule): Promise<void> {
    this.byId.set(schedule.id, schedule);
  }

  async get(id: ScheduleId): Promise<CronSchedule | undefined> {
    return this.byId.get(id);
  }

  async listByTenant(tenantId: TenantId): Promise<CronSchedule[]> {
    return [...this.byId.values()].filter((s) => s.tenantId === tenantId);
  }

  async listEnabled(): Promise<CronSchedule[]> {
    return [...this.byId.values()].filter((s) => s.enabled);
  }
}
