import type { AuditRecord } from "../domain/audit.js";
import type { AuditQueryFilter, AuditSink } from "./sink.js";

export class InMemoryAuditSink implements AuditSink {
  private readonly records: AuditRecord[] = [];

  async write(record: AuditRecord): Promise<void> {
    this.records.push(record);
  }

  async query(filter: AuditQueryFilter): Promise<AuditRecord[]> {
    let result = [...this.records];
    if (filter.tenantId) {
      result = result.filter((r) => r.tenantId === filter.tenantId);
    }
    if (filter.resourceType) {
      result = result.filter((r) => r.resourceType === filter.resourceType);
    }
    if (filter.resourceId) {
      result = result.filter((r) => r.resourceId === filter.resourceId);
    }
    if (filter.since) {
      result = result.filter((r) => r.at >= filter.since!);
    }
    const limit = filter.limit ?? 100;
    return result.slice(-limit);
  }
}
