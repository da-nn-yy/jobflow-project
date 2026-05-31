import type { FastifyInstance } from "fastify";
import type { JobService } from "../services/job-service.js";
import type { WorkflowService } from "../services/workflow-service.js";
import type { ExecutionService } from "../services/execution-service.js";
import { asJobId, asRunId } from "../utils/ids.js";

export function registerRoutes(
  app: FastifyInstance,
  jobs: JobService,
  workflows: WorkflowService,
  execution: ExecutionService,
): void {
  app.get("/health", async () => ({ status: "ok" }));

  app.get("/jobs", async () => {
    const list = await jobs.list();
    return { jobs: list.map((j) => ({ id: j.id, name: j.name, version: j.version })) };
  });

  app.post("/jobs", async (req, reply) => {
    const def = await jobs.register(req.body);
    return reply.code(201).send(def);
  });

  app.get<{ Params: { jobId: string } }>("/jobs/:jobId", async (req) => {
    const def = await jobs.get(asJobId(req.params.jobId));
    return def;
  });

  app.post<{ Params: { jobId: string } }>("/jobs/:jobId/runs", async (req, reply) => {
    const body = (req.body ?? {}) as { trigger?: string; input?: Record<string, unknown> };
    const { run, workflow } = await workflows.createRun(
      asJobId(req.params.jobId),
      body.trigger ?? "api",
      body.input ?? {},
    );
    void execution.executeRun(run.id);
    return reply.code(202).send({ run, workflowId: workflow.id });
  });

  app.get<{ Params: { runId: string } }>("/runs/:runId", async (req) => {
    const wf = await workflows.getWorkflowByRun(asRunId(req.params.runId));
    return wf;
  });

  app.post<{ Params: { runId: string } }>("/runs/:runId/execute", async (req) => {
    await execution.executeRun(asRunId(req.params.runId));
    const wf = await workflows.getWorkflowByRun(asRunId(req.params.runId));
    return wf;
  });
}
