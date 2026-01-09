import type { FastifyInstance } from "fastify";
import type { WebhookService } from "../services/webhook-service.js";
import { WebhookValidator } from "../validators/webhook-validator.js";
import type { WebhookEvent } from "../domain/webhook.js";
import type { TenantId } from "../domain/tenant.js";

export function registerWebhookRoutes(app: FastifyInstance, webhooks: WebhookService): void {
  const validator = new WebhookValidator();

  app.post("/webhooks", async (req, reply) => {
    const body = req.body as { url: string; events: WebhookEvent[] };
    validator.validateUrl(body.url);
    const endpoint = await webhooks.register({
      tenantId: req.tenantId as TenantId,
      url: body.url,
      events: body.events,
    });
    return reply.code(201).send(endpoint);
  });
}
