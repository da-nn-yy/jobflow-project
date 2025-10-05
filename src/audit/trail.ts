import { randomUUID } from "node:crypto";
import type { AuditRecord } from "../domain/audit.js";
import type { TenantId } from "../domain/tenant.js";
import type { Clock } from "../utils/clock.js";
import type { AuditSink } from "./sink.js";

export class AuditTrail {
  constructor(
    private readonly sink: AuditSink,
    private readonly clock: Clock,
  ) {}

  async record(
    tenantId: TenantId,
    actor: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, unknown> = {},
  ): Promise<AuditRecord> {
    const entry: AuditRecord = {
      id: randomUUID(),
      tenantId,
      actor,
      action,
      resourceType,
      resourceId,
      metadata,
      at: this.clock.nowIso(),
    };
    await this.sink.write(entry);
    return entry;
  }

  query(filter: Parameters<AuditSink["query"]>[0]) {
    return this.sink.query(filter);
  }
}
