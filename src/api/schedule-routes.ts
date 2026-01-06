import type { FastifyInstance } from "fastify";
import type { ScheduleService } from "../services/schedule-service.js";
import { asJobId } from "../utils/ids.js";
import type { TenantId } from "../domain/tenant.js";

export function registerScheduleRoutes(app: FastifyInstance, schedules: ScheduleService): void {
  app.get("/schedules", async (req) => {
    const tenantId = req.tenantId as TenantId;
    const items = await schedules.listByTenant(tenantId);
    return { schedules: items };
  });

  app.post("/schedules", async (req, reply) => {
    const body = req.body as {
      jobId: string;
      cronExpression: string;
      timezone?: string;
      defaultInput?: Record<string, unknown>;
    };
    const schedule = await schedules.create({
      tenantId: req.tenantId as TenantId,
      jobId: asJobId(body.jobId),
      cronExpression: body.cronExpression,
      timezone: body.timezone,
      defaultInput: body.defaultInput,
    });
    return reply.code(201).send(schedule);
  });
}
