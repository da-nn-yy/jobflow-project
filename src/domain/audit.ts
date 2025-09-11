import type { TenantId } from "./tenant.js";

export interface AuditRecord {
  id: string;
  tenantId: TenantId;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  at: string;
}
