import { randomUUID } from "node:crypto";
import type { WebhookEndpoint, WebhookEvent, WebhookId } from "../domain/webhook.js";
import type { TenantId } from "../domain/tenant.js";
import { InMemoryWebhookStore } from "../storage/memory/webhook-store.js";
import { WebhookDispatcher } from "../webhooks/dispatcher.js";
import { WebhookDeliveryStore } from "../webhooks/delivery-store.js";
import { generateApiKey } from "../security/api-key.js";

export class WebhookService {
  constructor(
    private readonly store: InMemoryWebhookStore,
    private readonly dispatcher: WebhookDispatcher,
    private readonly deliveries: WebhookDeliveryStore,
  ) {}

  async register(input: {
    tenantId: TenantId;
    url: string;
    events: WebhookEvent[];
  }): Promise<WebhookEndpoint & { secretPlaintext: string }> {
    const { raw } = generateApiKey();
    const endpoint: WebhookEndpoint = {
      id: `wh_${randomUUID().slice(0, 10)}` as WebhookId,
      tenantId: input.tenantId,
      url: input.url,
      secret: raw,
      events: input.events,
      enabled: true,
      createdAt: new Date().toISOString(),
    };
    await this.store.save(endpoint);
    return { ...endpoint, secretPlaintext: raw };
  }

  async emit(tenantId: TenantId, event: WebhookEvent, payload: Record<string, unknown>): Promise<void> {
    const endpoints = await this.store.listForEvent(tenantId, event);
    for (const ep of endpoints) {
      const result = await this.dispatcher.dispatch(ep, event, payload);
      await this.deliveries.save(result.delivery);
    }
  }
}
