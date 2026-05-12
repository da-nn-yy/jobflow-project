import Fastify from "fastify";
import type { EngineConfig } from "../config/defaults.js";
import type { AppContainer } from "../container.js";
import { registerRoutes } from "./routes.js";
import { registerAdminRoutes } from "./admin-routes.js";
import { registerScheduleRoutes } from "./schedule-routes.js";
import { registerWebhookRoutes } from "./webhook-routes.js";
import { registerV2Routes } from "./v2/routes.js";
import { registerRequestContext } from "../middleware/request-context.js";
import { registerRateLimit } from "../middleware/rate-limit.js";
import { registerAuthHook } from "../middleware/auth-hook.js";

export async function createServer(config: EngineConfig, container: AppContainer) {
  const app = Fastify({ logger: false });

  registerRequestContext(app);
  registerRateLimit(app);
  registerAuthHook(app, container.apiKeyAuth);

  app.setErrorHandler((err, _req, reply) => {
    const status =
      err.name === "ValidationError" ? 400 : err.name === "NotFoundError" ? 404 : err.name === "JobflowError" && (err as { code?: string }).code === "UNAUTHORIZED" ? 401 : 500;
    container.log.error("request error", { err: err.message, code: (err as { code?: string }).code });
    return reply.code(status).send({
      error: err.message,
      code: (err as { code?: string }).code ?? "INTERNAL_ERROR",
    });
  });

  registerRoutes(app, container.jobService, container.workflowService, container.executionService);
  registerScheduleRoutes(app, container.scheduleService);
  registerWebhookRoutes(app, container.webhookService);
  registerAdminRoutes(app, {
    deadLetter: container.deadLetterStore,
    webhookDeliveries: container.webhookDeliveries,
    audit: container.auditService,
    handlers: container.handlerRegistry,
    metrics: container.metricsRegistry,
  });

  registerV2Routes(app, {
    batch: container.batchCoordinator,
    templates: container.templateInstantiator,
    jobs: container.jobService,
    runQuery: container.runQueryService,
    replayer: container.runReplayer,
    importer: container.jobImporter,
  });

  await app.listen({ port: config.port, host: "0.0.0.0" });
  container.cronTicker.start();
  container.log.info("server listening", { port: config.port });
  return app;
}
