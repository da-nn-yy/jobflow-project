import type { JobId } from "./types.js";
import type { TenantId } from "./tenant.js";

export type ScheduleId = string & { readonly __brand: "ScheduleId" };

export interface CronSchedule {
  id: ScheduleId;
  tenantId: TenantId;
  jobId: JobId;
  cronExpression: string;
  timezone: string;
  enabled: boolean;
  lastTriggeredAt?: string;
  nextRunAt?: string;
  defaultInput: Record<string, unknown>;
  createdAt: string;
}
