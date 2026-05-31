import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type { ApiKeyAuthenticator } from "../security/auth.js";
import type { TenantId } from "../domain/tenant.js";

const PUBLIC_PATHS = new Set(["/health", "/metrics", "/openapi.json"]);

export function registerAuthHook(app: FastifyInstance, auth: ApiKeyAuthenticator): void {
  app.addHook("preHandler", async (req: FastifyRequest, reply: FastifyReply) => {
    if (PUBLIC_PATHS.has(req.url.split("?")[0])) {
      return;
    }
    if (process.env.JOBFLOW_AUTH_DISABLED === "1") {
      req.tenantId = "tenant_dev" as TenantId;
      return;
    }
    try {
      const result = await auth.authenticate(req.headers.authorization);
      req.tenantId = result.tenantId;
    } catch {
      return reply.code(401).send({ error: "unauthorized" });
    }
  });
}
