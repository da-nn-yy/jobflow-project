import type { TenantId } from "./tenant.js";

export type WebhookId = string & { readonly __brand: "WebhookId" };

export type WebhookEvent =
  | "run.started"
  | "run.completed"
  | "run.failed"
  | "run.dead_lettered"
  | "task.failed";

export interface WebhookEndpoint {
  id: WebhookId;
  tenantId: TenantId;
  url: string;
  secret: string;
  events: WebhookEvent[];
  enabled: boolean;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  endpointId: WebhookId;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  status: "pending" | "delivered" | "failed";
  attempts: number;
  lastAttemptAt?: string;
  responseStatus?: number;
}
