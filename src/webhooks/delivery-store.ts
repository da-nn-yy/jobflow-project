import type { WebhookDelivery } from "../domain/webhook.js";

export class WebhookDeliveryStore {
  private readonly byId = new Map<string, WebhookDelivery>();

  async save(delivery: WebhookDelivery): Promise<void> {
    this.byId.set(delivery.id, delivery);
  }

  async list(limit = 50): Promise<WebhookDelivery[]> {
    return [...this.byId.values()].slice(-limit);
  }
}
