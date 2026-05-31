import Fastify from "fastify";
import type { EngineConfig } from "../config/defaults.js";
import type { JobService } from "../services/job-service.js";
import type { WorkflowService } from "../services/workflow-service.js";
import type { ExecutionService } from "../services/execution-service.js";
import { registerRoutes } from "./routes.js";
import type { Logger } from "../utils/logger.js";

export async function createServer(
  config: EngineConfig,
  services: {
    jobs: JobService;
    workflows: WorkflowService;
    execution: ExecutionService;
    log: Logger;
  },
) {
  const app = Fastify({ logger: false });

  app.setErrorHandler((err, _req, reply) => {
    const status = err.name === "ValidationError" ? 400 : err.name === "NotFoundError" ? 404 : 500;
    services.log.error("request error", { err: err.message, code: (err as { code?: string }).code });
    return reply.code(status).send({
      error: err.message,
      code: (err as { code?: string }).code ?? "INTERNAL_ERROR",
    });
  });

  registerRoutes(app, services.jobs, services.workflows, services.execution);

  await app.listen({ port: config.port, host: "0.0.0.0" });
  services.log.info("server listening", { port: config.port });
  return app;
}
