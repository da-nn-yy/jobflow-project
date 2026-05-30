import type { AuditRecord } from "../domain/audit.js";
import type { WorkflowInstance } from "../domain/workflow-instance.js";

export interface RetentionPolicy {
  auditDays: number;
  workflowDays: number;
  deadLetterDays: number;
}

export const DEFAULT_RETENTION: RetentionPolicy = {
  auditDays: 90,
  workflowDays: 30,
  deadLetterDays: 180,
};

export class RetentionEnforcer {
  constructor(private readonly policy: RetentionPolicy) {}

  filterAudit(records: AuditRecord[], now: Date): AuditRecord[] {
    const cutoff = this.cutoffDate(now, this.policy.auditDays);
    return records.filter((r) => r.at >= cutoff);
  }

  shouldPurgeWorkflow(workflow: WorkflowInstance, now: Date): boolean {
    const cutoff = this.cutoffDate(now, this.policy.workflowDays);
    return workflow.updatedAt < cutoff && this.isTerminal(workflow.state);
  }

  private cutoffDate(now: Date, days: number): string {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString();
  }

  private isTerminal(state: string): boolean {
    return ["completed", "failed", "cancelled", "dead_lettered"].includes(state);
  }
}
