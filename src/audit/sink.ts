import type { AuditRecord } from "../domain/audit.js";

export interface AuditSink {
  write(record: AuditRecord): Promise<void>;
  query(filter: AuditQueryFilter): Promise<AuditRecord[]>;
}

export interface AuditQueryFilter {
  tenantId?: string;
  resourceType?: string;
  resourceId?: string;
  since?: string;
  limit?: number;
}
