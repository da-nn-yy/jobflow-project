import type { WebhookEndpoint, WebhookId } from "../../domain/webhook.js";
import type { TenantId } from "../../domain/tenant.js";

export class InMemoryWebhookStore {
  private readonly byId = new Map<WebhookId, WebhookEndpoint>();

  async save(endpoint: WebhookEndpoint): Promise<void> {
    this.byId.set(endpoint.id, endpoint);
  }

  async get(id: WebhookId): Promise<WebhookEndpoint | undefined> {
    return this.byId.get(id);
  }

  async listByTenant(tenantId: TenantId): Promise<WebhookEndpoint[]> {
    return [...this.byId.values()].filter((e) => e.tenantId === tenantId);
  }

  async listForEvent(tenantId: TenantId, event: string): Promise<WebhookEndpoint[]> {
    return [...this.byId.values()].filter(
      (e) => e.tenantId === tenantId && e.enabled && e.events.includes(event as never),
    );
  }
}
