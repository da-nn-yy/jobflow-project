import type { TenantId } from "../domain/tenant.js";
import { AuditTrail } from "../audit/trail.js";
import type { AuditQueryFilter } from "../audit/sink.js";

export class AuditService {
  constructor(private readonly trail: AuditTrail) {}

  async log(
    tenantId: TenantId,
    actor: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, unknown>,
  ) {
    return this.trail.record(tenantId, actor, action, resourceType, resourceId, metadata);
  }

  async query(filter: AuditQueryFilter) {
    return this.trail.query(filter);
  }
}
