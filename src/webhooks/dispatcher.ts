import type { WebhookDelivery, WebhookEndpoint, WebhookEvent } from "../domain/webhook.js";
import { signPayload } from "./signer.js";
import type { Logger } from "../utils/logger.js";
import type { Clock } from "../utils/clock.js";

export interface DispatchResult {
  delivery: WebhookDelivery;
  ok: boolean;
}

export class WebhookDispatcher {
  constructor(
    private readonly log: Logger,
    private readonly clock: Clock,
    private readonly maxAttempts = 3,
  ) {}

  async dispatch(
    endpoint: WebhookEndpoint,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<DispatchResult> {
    const delivery: WebhookDelivery = {
      id: `whd_${Date.now()}`,
      endpointId: endpoint.id,
      event,
      payload,
      status: "pending",
      attempts: 0,
    };

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      delivery.attempts = attempt;
      delivery.lastAttemptAt = this.clock.nowIso();
      const ok = await this.post(endpoint, event, payload);
      if (ok) {
        delivery.status = "delivered";
        delivery.responseStatus = 200;
        return { delivery, ok: true };
      }
    }

    delivery.status = "failed";
    this.log.warn("webhook delivery failed", { endpointId: endpoint.id, event });
    return { delivery, ok: false };
  }

  private async post(
    endpoint: WebhookEndpoint,
    event: WebhookEvent,
    payload: Record<string, unknown>,
  ): Promise<boolean> {
    const body = JSON.stringify({ event, payload, sentAt: this.clock.nowIso() });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = signPayload(endpoint.secret, body, timestamp);

    try {
      const res = await fetch(endpoint.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-jobflow-event": event,
          "x-jobflow-timestamp": timestamp,
          "x-jobflow-signature": signature,
        },
        body,
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
