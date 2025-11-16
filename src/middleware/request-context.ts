import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { TenantId } from "../domain/tenant.js";

declare module "fastify" {
  interface FastifyRequest {
    requestId: string;
    tenantId?: TenantId;
  }
}

export function registerRequestContext(app: FastifyInstance): void {
  app.addHook("onRequest", async (req) => {
    req.requestId = (req.headers["x-request-id"] as string) ?? randomUUID();
  });
}
