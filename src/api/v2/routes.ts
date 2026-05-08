import type { FastifyInstance } from "fastify";
import type { BatchCoordinator } from "../../batch/coordinator.js";
import type { TemplateInstantiator } from "../../templates/instantiator.js";
import type { JobService } from "../../services/job-service.js";
import type { RunQueryService } from "../../query/run-query-service.js";
import type { RunReplayer } from "../../replay/replayer.js";
import type { JobBundleImporter } from "../../import/job-bundle-importer.js";
import { WORKFLOW_TEMPLATES } from "../../templates/catalog.js";
import { asJobId, asRunId } from "../../utils/ids.js";
import { loadBatchManifest } from "../../batch/loader.js";

export function registerV2Routes(
  app: FastifyInstance,
  deps: {
    batch: BatchCoordinator;
    templates: TemplateInstantiator;
    jobs: JobService;
    runQuery: RunQueryService;
    replayer: RunReplayer;
    importer: JobBundleImporter;
  },
): void {
  app.get("/v2/templates", async () => ({
    templates: WORKFLOW_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      parameters: t.parameters,
    })),
  }));

  app.post<{ Params: { id: string } }>("/v2/templates/:id/instantiate", async (req, reply) => {
    const params = (req.body ?? {}) as Record<string, string>;
    const def = deps.templates.instantiate(req.params.id, params);
    const registered = await deps.jobs.register(def);
    return reply.code(201).send(registered);
  });

  app.post("/v2/batch", async (req, reply) => {
    const body = req.body as { manifestPath: string };
    const manifest = await loadBatchManifest(body.manifestPath);
    const progress = await deps.batch.execute(manifest);
    return reply.code(202).send(progress);
  });

  app.get<{ Params: { jobId: string } }>("/v2/jobs/:jobId/runs", async (req) => {
    const q = req.query as { page?: string; pageSize?: string; status?: string };
    return deps.runQuery.search(
      asJobId(req.params.jobId),
      { status: q.status ? [q.status as never] : undefined },
      { page: Number(q.page ?? 1), pageSize: Number(q.pageSize ?? 20) },
    );
  });

  app.post<{ Params: { runId: string } }>("/v2/runs/:runId/replay", async (req) => {
    return deps.replayer.replay(asRunId(req.params.runId));
  });

  app.post("/v2/import/jobs", async (req, reply) => {
    const body = req.body as { directory: string };
    const result = await deps.importer.importDirectory(body.directory);
    return reply.code(200).send(result);
  });
}
