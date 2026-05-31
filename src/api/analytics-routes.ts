import type { FastifyInstance } from "fastify";
import type { AnalyticsService } from "../services/analytics-service.js";
import { asRunId } from "../utils/ids.js";

export function registerAnalyticsRoutes(app: FastifyInstance, analytics: AnalyticsService): void {
  app.get<{ Params: { runId: string } }>("/api/v1/runs/:runId/analytics", async (req) => {
    return analytics.summarizeRun(asRunId(req.params.runId));
  });

  app.get<{ Querystring: { name: string; since?: string } }>("/api/v1/metrics/series", async (req) => {
    const { name, since } = req.query;
    if (!name) return [];
    return analytics.timeSeries(name, since);
  });
}
