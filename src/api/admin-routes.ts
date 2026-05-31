import type { FastifyInstance } from "fastify";
import type { InMemoryDeadLetterStore } from "../storage/memory/dead-letter-store.js";
import type { WebhookDeliveryStore } from "../webhooks/delivery-store.js";
import type { AuditService } from "../services/audit-service.js";
import type { HandlerRegistry } from "../handlers/registry.js";
import type { MetricsRegistry } from "../metrics/registry.js";
import { formatPrometheus } from "../metrics/prometheus.js";
import { openApiJson } from "../openapi/spec.js";
import { paginate } from "../utils/pagination.js";

export function registerAdminRoutes(
  app: FastifyInstance,
  deps: {
    deadLetter: InMemoryDeadLetterStore;
    webhookDeliveries: WebhookDeliveryStore;
    audit: AuditService;
    handlers: HandlerRegistry;
    metrics: MetricsRegistry;
  },
): void {
  app.get("/openapi.json", async (_req, reply) => {
    reply.header("content-type", "application/json");
    return openApiJson();
  });

  app.get("/metrics", async (_req, reply) => {
    reply.header("content-type", "text/plain; version=0.0.4");
    return formatPrometheus(deps.metrics);
  });

  app.get("/admin/dead-letter", async (req) => {
    const q = req.query as { limit?: string };
    const items = await deps.deadLetter.list(Number(q.limit ?? 50));
    return paginate(items, { page: 1, pageSize: items.length });
  });

  app.get("/admin/webhook-deliveries", async () => {
    const items = await deps.webhookDeliveries.list(100);
    return { items };
  });

  app.get("/admin/audit", async (req) => {
    const q = req.query as { resourceType?: string; resourceId?: string; limit?: string };
    const items = await deps.audit.query({
      tenantId: req.tenantId,
      resourceType: q.resourceType,
      resourceId: q.resourceId,
      limit: Number(q.limit ?? 50),
    });
    return { items };
  });

  app.get("/admin/handlers", async (req) => {
    const q = req.query as { tag?: string };
    return { handlers: deps.handlers.list(q.tag) };
  });
}
