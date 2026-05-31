import type { TaskDefinition } from "../domain/job-definition.js";
import type { TaskRun } from "../domain/task.js";
import { DagPlanner } from "./dag-planner.js";
import type { TaskExecutor } from "../workers/task-executor.js";
import type { RetryPolicy } from "../domain/types.js";

export interface ParallelExecuteOptions {
  maxConcurrency: number;
  policy: RetryPolicy;
  input: Record<string, unknown>;
}

export class ParallelTaskExecutor {
  private readonly planner = new DagPlanner();

  constructor(private readonly executor: TaskExecutor) {}

  async executeLevel(
    tasks: TaskDefinition[],
    runs: Map<string, TaskRun>,
    options: ParallelExecuteOptions,
  ): Promise<Map<string, TaskRun>> {
    const plan = this.planner.plan(tasks);
    const updated = new Map(runs);

    for (const level of plan.levels) {
      const batch = level
        .map((id) => {
          const def = tasks.find((t) => t.id === id);
          const run = updated.get(id);
          return def && run ? { def, run } : undefined;
        })
        .filter((x): x is { def: TaskDefinition; run: TaskRun } => Boolean(x));

      await this.runBatch(batch, options, updated);
    }

    return updated;
  }

  private async runBatch(
    batch: Array<{ def: TaskDefinition; run: TaskRun }>,
    options: ParallelExecuteOptions,
    updated: Map<string, TaskRun>,
  ): Promise<void> {
    const { maxConcurrency, policy, input } = options;
    let index = 0;

    const worker = async () => {
      while (index < batch.length) {
        const current = batch[index];
        index += 1;
        if (!current) return;
        const result = await this.executor.run(current.run, current.def, policy, input);
        updated.set(current.def.id, result.task);
      }
    };

    const workers = Array.from({ length: Math.min(maxConcurrency, batch.length) }, () => worker());
    await Promise.all(workers);
  }
}
