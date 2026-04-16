import type { RunId } from "../domain/types.js";
import { RunPriority } from "../domain/priority.js";
import type { BatchManifest, BatchProgress } from "./manifest.js";
import type { WorkflowService } from "../services/workflow-service.js";
import type { ExecutionService } from "../services/execution-service.js";
import type { WorkerPool } from "../workers/pool.js";
import type { Logger } from "../utils/logger.js";
import type { Clock } from "../utils/clock.js";

export class BatchCoordinator {
  private readonly progress = new Map<string, BatchProgress>();

  constructor(
    private readonly workflows: WorkflowService,
    private readonly execution: ExecutionService,
    private readonly pool: WorkerPool,
    private readonly log: Logger,
    private readonly clock: Clock,
  ) {}

  async execute(manifest: BatchManifest): Promise<BatchProgress> {
    const state: BatchProgress = {
      manifestId: manifest.id,
      total: manifest.items.length,
      completed: 0,
      failed: 0,
      running: 0,
      runIds: [],
    };
    this.progress.set(manifest.id, state);

    const parallel = manifest.maxParallel ?? 4;
    const queue = [...manifest.items];

    const workers = Array.from({ length: parallel }, async () => {
      while (queue.length) {
        const item = queue.shift();
        if (!item) break;
        state.running += 1;
        try {
          const { run } = await this.workflows.createRun(item.jobId, `batch:${manifest.id}`, item.input);
          state.runIds.push(run.id);
          this.pool.enqueue({
            runId: run.id as RunId,
            priority: item.priority ?? RunPriority.Normal,
            enqueuedAt: this.clock.nowIso(),
          });
          await this.execution.executeRun(run.id);
          state.completed += 1;
        } catch (err) {
          state.failed += 1;
          this.log.error("batch item failed", { label: item.label, err: String(err) });
          if (!item.continueOnError) {
            queue.length = 0;
          }
        } finally {
          state.running -= 1;
        }
      }
    });

    await Promise.all(workers);
    return state;
  }

  getProgress(manifestId: string): BatchProgress | undefined {
    return this.progress.get(manifestId);
  }
}
