import type { FastifyInstance } from "fastify";
import type { DslService } from "../services/dsl-service.js";

export function registerDslRoutes(app: FastifyInstance, dsl: DslService): void {
  app.post<{ Body: { source: string; jobId?: string } }>("/api/v1/dsl/compile", async (req, reply) => {
    const { source, jobId } = req.body ?? {};
    if (!source || typeof source !== "string") {
      return reply.code(400).send({ error: "source required" });
    }
    const def = await dsl.compileAndRegister(source, jobId);
    return { job: def };
  });
}
